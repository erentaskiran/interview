import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User, Session, SessionFeedback, TtsPayload } from "../types";
import { AudioRecorder, type AudioRecorderState } from "../components/AudioRecorder";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { ResultSummary } from "../components/ResultSummary";
import { SessionProgress } from "../components/SessionProgress";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

type SubmitAnswerPayload = {
  answerTranscript?: string;
  answerAudioBase64?: string;
  answerAudioMimeType?: string;
};

type SessionPageProps = {
  user: User;
  session: Session | null;
  loading: boolean;
  busy: boolean;
  error?: string | null;
  firstQuestionAudio?: TtsPayload | null;
  questionAudioByTurn?: Record<number, TtsPayload>;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onSubmitAnswer: (payload: SubmitAnswerPayload) => Promise<void>;
  onLoadQuestionAudio?: (turnIndex: number) => Promise<TtsPayload | null>;
  onManualFinish: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onRetryFromTemplate: () => Promise<void>;
  onOpenTemplate: () => void;
  onOpenProfile: () => void;
  onOpenLiked: () => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const msToDuration = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
};

const toBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to convert audio"));
        return;
      }
      const commaIndex = result.indexOf(",");
      if (commaIndex < 0) {
        reject(new Error("Invalid audio encoding"));
        return;
      }
      resolve(result.slice(commaIndex + 1));
    };
    reader.onerror = () => reject(new Error("Failed to read audio"));
    reader.readAsDataURL(blob);
  });

const safeFeedback = (value: Session["feedback"]): SessionFeedback => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value;
};

export default function SessionPage({
  user,
  session,
  loading,
  busy,
  error,
  firstQuestionAudio,
  questionAudioByTurn,
  counts,
  onSubmitAnswer,
  onLoadQuestionAudio,
  onManualFinish,
  onRefresh,
  onRetryFromTemplate,
  onOpenTemplate,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout
}: SessionPageProps) {
  const [answerText, setAnswerText] = useState("");
  const [recorderState, setRecorderState] = useState<AudioRecorderState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>("audio/webm");
  const [recordingSec, setRecordingSec] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [autoReadEnabled, setAutoReadEnabled] = useState(true);
  const [lastSpokenTurnId, setLastSpokenTurnId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const activeError = localError ?? error ?? null;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const pendingTurn = useMemo(
    () => session?.turns.find((turn) => !turn.answerTranscript) ?? null,
    [session]
  );

  const answeredCount = useMemo(
    () => session?.turns.filter((turn) => Boolean(turn.answerTranscript)).length ?? 0,
    [session]
  );

  const questionIndex = pendingTurn?.turnIndex ?? session?.turns.length ?? 1;
  const pendingTurnId = pendingTurn?.id ?? null;

  const feedback = safeFeedback(session?.feedback ?? null);

  const resultData = useMemo(() => {
    if (!session || session.status === "active") {
      return null;
    }
    const score = session.score ?? 0;
    const strengths = feedback.strengths ?? [];
    const improvements = [...(feedback.weakAreas ?? []), ...(feedback.suggestions ?? [])];
    const started = new Date(session.createdAt).getTime();
    const ended = new Date(session.completedAt ?? session.updatedAt).getTime();
    return {
      score,
      completionReason: session.completionReason ?? "failed",
      headline:
        feedback.summary ??
        (score >= 80
          ? "Strong signal across interview axes"
          : score >= 60
            ? "Good base signal with clear improvement areas"
            : "Partial signal; iterate once more"),
      strengths: strengths.length > 0 ? strengths : ["No strengths returned by AI."],
      improvements:
        improvements.length > 0
          ? improvements
          : ["No detailed improvements returned by AI."],
      questionCount: answeredCount,
      duration: msToDuration(ended - started)
    };
  }, [answeredCount, feedback, session]);

  const playQuestionAudio = useCallback(async () => {
    if (!pendingTurn) {
      return;
    }

    const speakWithBrowserTts = () => {
      if (!window.speechSynthesis) {
        throw new Error("BROWSER_TTS_UNAVAILABLE");
      }
      const utterance = new SpeechSynthesisUtterance(pendingTurn.questionText);
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const serverAudio =
      questionAudioByTurn?.[pendingTurn.turnIndex] ??
      (pendingTurn.turnIndex === 1 ? firstQuestionAudio ?? undefined : undefined);

    if (serverAudio) {
      try {
        const audio = new Audio(`data:${serverAudio.mimeType};base64,${serverAudio.audioBase64}`);
        await audio.play();
        return;
      } catch {
        // Fallback to browser speech synthesis below.
      }
    }

    if (onLoadQuestionAudio) {
      try {
        const generatedAudio = await onLoadQuestionAudio(pendingTurn.turnIndex);
        if (generatedAudio) {
          const audio = new Audio(
            `data:${generatedAudio.mimeType};base64,${generatedAudio.audioBase64}`
          );
          await audio.play();
          return;
        }
      } catch {
        // Fallback to browser speech synthesis below.
      }
    }

    speakWithBrowserTts();
  }, [firstQuestionAudio, onLoadQuestionAudio, pendingTurn, questionAudioByTurn]);

  useEffect(() => {
    if (!autoReadEnabled || !pendingTurn) {
      return;
    }

    if (pendingTurnId === lastSpokenTurnId) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        await playQuestionAudio();
        if (!cancelled) {
          setLastSpokenTurnId(pendingTurnId);
        }
      } catch {
        // Browser policy can block autoplay; user can always tap Play question.
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    autoReadEnabled,
    firstQuestionAudio,
    lastSpokenTurnId,
    pendingTurn,
    pendingTurnId,
    playQuestionAudio
  ]);

  useEffect(() => {
    setLastSpokenTurnId(null);
  }, [session?.id]);

  const handlePlayQuestion = async () => {
    if (!pendingTurn) {
      return;
    }
    setLocalError(null);
    try {
      await playQuestionAudio();
      setLastSpokenTurnId(pendingTurnId);
    } catch {
      setLocalError("Question audio could not be played on this browser.");
    }
  };

  const startRecording = async () => {
    setLocalError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setLocalError("Audio recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType: preferredMimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        setRecordedBlob(blob);
        setRecordedMimeType(recorder.mimeType || preferredMimeType);
        setRecorderState("review");
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      setRecordingSec(0);
      setRecorderState("recording");
      recorder.start();

      timerRef.current = window.setInterval(() => {
        setRecordingSec((prev) => prev + 1);
      }, 1000);
    } catch {
      setLocalError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const submitRecordedAnswer = async () => {
    if (!recordedBlob) {
      return;
    }
    setLocalError(null);
    setRecorderState("processing");
    try {
      const base64 = await toBase64(recordedBlob);
      await onSubmitAnswer({
        answerAudioBase64: base64,
        answerAudioMimeType: recordedMimeType
      });
      setRecorderState("idle");
      setRecordedBlob(null);
      setRecordingSec(0);
    } catch {
      setRecorderState("review");
      setLocalError("Failed to send audio answer.");
    }
  };

  const submitTextAnswer = async () => {
    if (!answerText.trim()) {
      setLocalError("Type an answer or record audio.");
      return;
    }
    setLocalError(null);
    try {
      await onSubmitAnswer({ answerTranscript: answerText.trim() });
      setAnswerText("");
    } catch {
      setLocalError("Failed to submit text answer.");
    }
  };

  return (
    <div className="page">
      <Sidebar
        active="sessions"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          crumb={["Session", session?.template?.title ?? "Interview"]}
          userInitials={initials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          actions={
            <Button kind="ghost" size="sm" icon="book" onClick={onOpenTemplate}>
              Template
            </Button>
          }
        />

        <div className="main main--scroll" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {loading && (
            <div className="card" style={{ padding: 16 }}>
              <div className="small-text">Loading session...</div>
            </div>
          )}

          {activeError && (
            <div className="card" style={{ padding: 16, borderColor: "var(--err)" }}>
              <div className="small-text" style={{ color: "var(--err)" }}>
                {activeError}
              </div>
              <Button
                kind="ghost"
                size="sm"
                style={{ marginTop: 10 }}
                onClick={() => {
                  void onRefresh();
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {session && session.status === "active" && (
            <>
              <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <SessionProgress
                  current={questionIndex}
                  plannedTotal={session.plannedQuestionCount}
                  min={session.minQuestionCount}
                  max={session.maxQuestionCount}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    kind="ghost"
                    icon="play"
                    onClick={() => {
                      void handlePlayQuestion();
                    }}
                    disabled={!pendingTurn}
                  >
                    Play question
                  </Button>
                  <Button
                    kind="ghost"
                    icon={autoReadEnabled ? "check" : "pause"}
                    onClick={() => {
                      setAutoReadEnabled((current) => !current);
                    }}
                  >
                    Auto read {autoReadEnabled ? "on" : "off"}
                  </Button>
                  <Button
                    kind="ghost"
                    icon="stop"
                    onClick={() => {
                      void onManualFinish();
                    }}
                    disabled={answeredCount < 1 || busy}
                  >
                    Finish now
                  </Button>
                </div>
              </div>

              <div
                className="card"
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxHeight: 420,
                  overflowY: "auto"
                }}
              >
                {session.turns.map((turn) => (
                  <div key={turn.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name="AI" tone="b" size="sm" />
                      <span className="micro-text">AI Interviewer · Q{turn.turnIndex}</span>
                    </div>
                    <div className="bubble bubble--ai">{turn.questionText}</div>
                    {turn.answerTranscript && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            justifyContent: "flex-end"
                          }}
                        >
                          <span className="micro-text">You</span>
                          <Avatar name={initials(user.displayName)} tone="a" size="sm" />
                        </div>
                        <div className="bubble bubble--me">{turn.answerTranscript}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="h3" style={{ fontWeight: 500 }}>
                  Answer by text
                </div>
                <textarea
                  className="textarea"
                  rows={4}
                  value={answerText}
                  onChange={(event) => setAnswerText(event.target.value)}
                  placeholder="Type your answer if you prefer not to record audio."
                  disabled={busy}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button
                    kind="primary"
                    iconRight="arrow"
                    onClick={() => {
                      void submitTextAnswer();
                    }}
                    loading={busy}
                  >
                    Submit answer
                  </Button>
                </div>
              </div>

              <AudioRecorder
                state={recorderState}
                durationSec={recordingSec}
                onStart={() => {
                  void startRecording();
                }}
                onStop={stopRecording}
                onSubmit={() => {
                  void submitRecordedAnswer();
                }}
                onPlayback={() => {
                  if (!recordedBlob) {
                    return;
                  }
                  const url = URL.createObjectURL(recordedBlob);
                  const audio = new Audio(url);
                  void audio.play();
                  audio.onended = () => URL.revokeObjectURL(url);
                }}
                onReRecord={() => {
                  setRecordedBlob(null);
                  setRecorderState("idle");
                  setRecordingSec(0);
                }}
              />
            </>
          )}

          {session && resultData && (
            <ResultSummary
              score={resultData.score}
              completionReason={resultData.completionReason}
              headline={resultData.headline}
              strengths={resultData.strengths}
              improvements={resultData.improvements}
              questionCount={resultData.questionCount}
              duration={resultData.duration}
              onRetry={() => {
                void onRetryFromTemplate();
              }}
              onTranscript={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onExport={() => {
                const lines: string[] = [];
                session.turns.forEach((turn) => {
                  lines.push(`Q${turn.turnIndex}: ${turn.questionText}`);
                  lines.push(`A${turn.turnIndex}: ${turn.answerTranscript ?? ""}`);
                  lines.push("");
                });
                const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = `session-${session.id}.txt`;
                anchor.click();
                URL.revokeObjectURL(url);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
