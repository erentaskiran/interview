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
  onDiscoverTemplates: () => void;
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
  onDiscoverTemplates,
  onLogout
}: SessionPageProps) {
  const [answerText, setAnswerText] = useState("");
  const [recorderState, setRecorderState] = useState<AudioRecorderState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>("audio/webm");
  const [recordingSec, setRecordingSec] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [autoReadEnabled, setAutoReadEnabled] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioObjectUrlRef = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const playbackTokenRef = useRef(0);
  const autoReadTurnIdRef = useRef<string | null>(null);
  const recordingCancelledRef = useRef(false);
  const submitInFlightRef = useRef(false);

  const activeError = localError ?? error ?? null;
  const answerBusy = busy || submittingAnswer;

  const isInteractiveSession = session?.status === "active";
  const pendingTurn = useMemo(
    () =>
      isInteractiveSession
        ? (session?.turns.find((turn) => !turn.answerTranscript) ?? null)
        : null,
    [isInteractiveSession, session]
  );

  const answeredCount = useMemo(
    () => session?.turns.filter((turn) => Boolean(turn.answerTranscript)).length ?? 0,
    [session]
  );

  const questionIndex = pendingTurn?.turnIndex ?? session?.turns.length ?? 1;
  const pendingTurnId = pendingTurn?.id ?? null;

  const feedback = safeFeedback(session?.feedback ?? null);
  const isPastSession = Boolean(session && !isInteractiveSession);
  const showSidebar = !isInteractiveSession;

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
      duration: msToDuration(ended - started),
      templateTitle: session.template?.title ?? "Interview",
      templateCategory: session.template?.category ?? "Interview"
    };
  }, [answeredCount, feedback, session]);

  const stopAllPlayback = useCallback(() => {
    playbackTokenRef.current += 1;
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if (activeAudioObjectUrlRef.current) {
      URL.revokeObjectURL(activeAudioObjectUrlRef.current);
      activeAudioObjectUrlRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    recordingCancelledRef.current = true;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // Recorder may already be stopping; cleanup below still releases local state.
      }
    }
    recorderRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setRecorderState("idle");
    setRecordedBlob(null);
    setRecordingSec(0);
  }, []);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      cancelRecording();
    };
  }, [cancelRecording, stopAllPlayback]);

  useEffect(() => {
    if (!session || isInteractiveSession) {
      return;
    }

    stopAllPlayback();
    cancelRecording();
  }, [cancelRecording, isInteractiveSession, session, stopAllPlayback]);

  const playBase64Audio = useCallback(
    async (payload: TtsPayload, playbackToken: number) => {
      if (playbackToken !== playbackTokenRef.current) {
        return false;
      }
      const audio = new Audio(`data:${payload.mimeType};base64,${payload.audioBase64}`);
      activeAudioRef.current = audio;
      audio.onended = () => {
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null;
        }
      };
      try {
        await audio.play();
        return playbackToken === playbackTokenRef.current;
      } catch (error) {
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null;
        }
        throw error;
      }
    },
    []
  );

  const playQuestionAudio = useCallback(async (turn = pendingTurn) => {
    if (!turn) {
      return false;
    }

    stopAllPlayback();
    const playbackToken = playbackTokenRef.current;

    const isCurrentPlayback = () => playbackToken === playbackTokenRef.current;

    const speakWithBrowserTts = () => {
      if (!window.speechSynthesis) {
        throw new Error("BROWSER_TTS_UNAVAILABLE");
      }
      if (!isCurrentPlayback()) {
        return false;
      }
      const utterance = new SpeechSynthesisUtterance(turn.questionText);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
      return true;
    };

    const serverAudio =
      questionAudioByTurn?.[turn.turnIndex] ??
      (turn.turnIndex === 1 ? firstQuestionAudio ?? undefined : undefined);

    if (serverAudio) {
      try {
        return await playBase64Audio(serverAudio, playbackToken);
      } catch {
        // Fallback to browser speech synthesis below.
      }
    }

    if (onLoadQuestionAudio) {
      try {
        const generatedAudio = await onLoadQuestionAudio(turn.turnIndex);
        if (!isCurrentPlayback()) {
          return false;
        }
        if (generatedAudio) {
          try {
            return await playBase64Audio(generatedAudio, playbackToken);
          } catch {
            // Fallback to browser speech synthesis below.
          }
        }
      } catch {
        // Fallback to browser speech synthesis below.
      }
    }

    return speakWithBrowserTts();
  }, [
    firstQuestionAudio,
    onLoadQuestionAudio,
    pendingTurn,
    playBase64Audio,
    questionAudioByTurn,
    stopAllPlayback
  ]);

  useEffect(() => {
    autoReadTurnIdRef.current = null;
  }, [session?.id]);

  useEffect(() => {
    if (!autoReadEnabled) {
      stopAllPlayback();
      return;
    }

    if (!autoReadEnabled || !pendingTurn) {
      return;
    }

    if (!pendingTurnId || pendingTurnId === autoReadTurnIdRef.current) {
      return;
    }

    autoReadTurnIdRef.current = pendingTurnId;
    const run = async () => {
      try {
        await playQuestionAudio(pendingTurn);
      } catch {
        // Browser policy can block autoplay; user can always tap Play question.
      }
    };

    void run();
  }, [
    autoReadEnabled,
    firstQuestionAudio,
    pendingTurn,
    pendingTurnId,
    playQuestionAudio,
    stopAllPlayback
  ]);

  const handlePlayQuestion = async () => {
    if (!pendingTurn) {
      return;
    }
    setLocalError(null);
    autoReadTurnIdRef.current = pendingTurnId;
    try {
      await playQuestionAudio(pendingTurn);
    } catch {
      setLocalError("Question audio could not be played on this browser.");
    }
  };

  const startRecording = async () => {
    setLocalError(null);
    stopAllPlayback();
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
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;

        if (recordingCancelledRef.current) {
          recordingCancelledRef.current = false;
          setRecordedBlob(null);
          setRecorderState("idle");
          setRecordingSec(0);
          return;
        }

        const blob = new Blob(chunks, { type: recorder.mimeType });
        setRecordedBlob(blob);
        setRecordedMimeType(recorder.mimeType || preferredMimeType);
        setRecorderState("review");
      };

      recordingCancelledRef.current = false;
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
    recordingCancelledRef.current = false;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current?.state !== "recording") {
      return;
    }
    recorderRef.current.pause();
    setRecorderState("paused");
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current?.state !== "paused") {
      return;
    }
    recorderRef.current.resume();
    setRecorderState("recording");
    timerRef.current = window.setInterval(() => {
      setRecordingSec((prev) => prev + 1);
    }, 1000);
  };

  const submitRecordedAnswer = async () => {
    if (!recordedBlob || answerBusy || submitInFlightRef.current) {
      return;
    }
    setLocalError(null);
    stopAllPlayback();
    submitInFlightRef.current = true;
    setSubmittingAnswer(true);
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
    } finally {
      submitInFlightRef.current = false;
      setSubmittingAnswer(false);
    }
  };

  const submitTextAnswer = async () => {
    if (answerBusy || submitInFlightRef.current) {
      return;
    }
    if (!pendingTurn) {
      setLocalError("No pending question is available. Refreshing the session may be needed.");
      return;
    }
    if (!answerText.trim()) {
      setLocalError("Type an answer or record audio.");
      return;
    }
    setLocalError(null);
    stopAllPlayback();
    submitInFlightRef.current = true;
    setSubmittingAnswer(true);
    try {
      await onSubmitAnswer({ answerTranscript: answerText.trim() });
      setAnswerText("");
    } catch (submitError) {
      setLocalError(
        submitError instanceof Error ? submitError.message : "Failed to submit text answer."
      );
    } finally {
      submitInFlightRef.current = false;
      setSubmittingAnswer(false);
    }
  };

  const handleManualFinish = async () => {
    setLocalError(null);
    stopAllPlayback();
    if (answeredCount < 1) {
      setLocalError("Submit at least one answer before finishing.");
      return;
    }
    cancelRecording();
    await onManualFinish();
  };

  return (
    <div className={`page${showSidebar ? "" : " page--bare"}`}>
      {showSidebar && (
        <Sidebar
          active="sessions"
          user={{ name: user.displayName, sub: user.email }}
          {...(counts ? { counts } : {})}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          crumb={[{ label: "Sessions", onClick: onOpenSessions }, session?.template?.title ?? "Interview"]}
          userInitials={initials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onDiscoverTemplates={onDiscoverTemplates}
          onLogout={onLogout}
          hideSearch={isInteractiveSession}
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

          {session && isInteractiveSession && (
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
                      setAutoReadEnabled((current) => {
                        const next = !current;
                        if (!next) {
                          stopAllPlayback();
                        } else {
                          autoReadTurnIdRef.current = null;
                        }
                        return next;
                      });
                    }}
                  >
                    Auto read {autoReadEnabled ? "on" : "off"}
                  </Button>
                  <Button
                    kind="ghost"
                    icon="stop"
                    onClick={() => {
                      void handleManualFinish();
                    }}
                    loading={busy}
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
                  disabled={answerBusy || !pendingTurn}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button
                    kind="primary"
                    iconRight="arrow"
                    onClick={() => {
                      void submitTextAnswer();
                    }}
                    loading={answerBusy}
                    disabled={!pendingTurn}
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
                onPause={pauseRecording}
                onResume={resumeRecording}
                onSubmit={() => {
                  void submitRecordedAnswer();
                }}
                onPlayback={() => {
                  if (!recordedBlob) {
                    return;
                  }
                  stopAllPlayback();
                  const url = URL.createObjectURL(recordedBlob);
                  const audio = new Audio(url);
                  activeAudioObjectUrlRef.current = url;
                  activeAudioRef.current = audio;
                  void audio.play();
                  audio.onended = () => {
                    if (activeAudioRef.current === audio) {
                      activeAudioRef.current = null;
                    }
                    if (activeAudioObjectUrlRef.current === url) {
                      URL.revokeObjectURL(url);
                      activeAudioObjectUrlRef.current = null;
                    }
                  };
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
              templateTitle={resultData.templateTitle}
              templateCategory={resultData.templateCategory}
              onRetry={() => {
                void onRetryFromTemplate();
              }}
              onTranscript={() => {
                transcriptRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

          {session && isPastSession && (
            <div
              ref={transcriptRef}
              className="card"
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div className="h3" style={{ fontWeight: 500 }}>
                Transcript
              </div>
              {session.turns.map((turn) => (
                <div key={turn.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="bubble bubble--ai">{turn.questionText}</div>
                  <div className="bubble bubble--me">{turn.answerTranscript ?? ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
