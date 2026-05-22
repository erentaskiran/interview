import type { CSSProperties, ReactNode } from "react";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Icon, type IconName } from "./Icon";

export type ResultSummaryProps = {
  score: number;
  completionReason: "ai_completed" | "user_stopped" | "failed";
  headline: string;
  strengths: string[];
  improvements: string[];
  questionCount: number;
  duration: string;
  templateTitle?: string;
  templateCategory?: string;
  onRetry: () => void;
  onTranscript: () => void;
  onExport: () => void;
};

type FeedbackCardProps = {
  icon: IconName;
  tone: "ok" | "err";
  title: string;
  body: string;
};

const scoreColor = (score: number) => {
  if (score >= 75) {
    return "var(--ok)";
  }
  if (score >= 60) {
    return "var(--warn)";
  }
  return "var(--err)";
};

const scoreTier = (score: number) => {
  if (score >= 85) {
    return "Excellent interview signal";
  }
  if (score >= 70) {
    return "Strong interview signal";
  }
  if (score >= 55) {
    return "Developing interview signal";
  }
  return "Needs another focused pass";
};

const resultIntro = (questionCount: number, duration: string, completionReason: ResultSummaryProps["completionReason"]) => {
  const reason =
    completionReason === "ai_completed"
      ? "The AI ended the round after it had enough signal."
      : completionReason === "user_stopped"
        ? "You ended the round before the AI completed its full read."
        : "The round ended before a full score could be produced.";

  return `You answered ${questionCount} ${questionCount === 1 ? "question" : "questions"} in ${duration}. ${reason} Here is what came through and what to sharpen next.`;
};

function FeedbackCard({ icon, tone, title, body }: FeedbackCardProps) {
  const color = tone === "ok" ? "var(--ok)" : "var(--err)";
  const background = tone === "ok" ? "var(--ok-soft)" : "var(--err-soft)";

  return (
    <article className="card result-feedback-card">
      <span className="result-feedback-card__icon" style={{ color, background }}>
        <Icon name={icon} size={13} stroke={2.4} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div className="h3" style={{ marginBottom: 4 }}>
          {title}
        </div>
        <p className="body-text">{body}</p>
      </div>
    </article>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="result-meta-row">
      <span className="small-text">{label}</span>
      <span className="small-text" style={{ color: "var(--ink-900)", textAlign: "right" }}>
        {children}
      </span>
    </div>
  );
}

export function ResultSummary({
  score,
  completionReason,
  headline,
  strengths,
  improvements,
  questionCount,
  duration,
  templateTitle = "Interview",
  templateCategory = "Interview",
  onRetry,
  onTranscript,
  onExport,
}: ResultSummaryProps) {
  const reasonLabel = {
    ai_completed: "AI completed",
    user_stopped: "You ended early",
    failed: "Could not score",
  }[completionReason];
  const scoreTone = scoreColor(score);
  const scoreStyle = { "--p": score / 100, "--score-color": scoreTone } as CSSProperties;

  return (
    <section className="result-layout" aria-labelledby="session-result-heading">
      <div className="result-main">
        <header>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Result · session complete
          </div>
          <h1 id="session-result-heading" className="h-display result-title">
            {headline}
          </h1>
          <p className="body-text result-intro">
            {resultIntro(questionCount, duration, completionReason)}
          </p>
        </header>

        <div className="card result-hero">
          <div className="gauge result-hero__gauge" style={scoreStyle}>
            <span className="gauge__val">{score}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="h2" style={{ fontWeight: 500 }}>
              {scoreTier(score)}
            </div>
            <p className="body-text" style={{ marginTop: 6 }}>
              The score is paired with the strongest observed signals and the gaps that need the next practice pass.
            </p>
            <div className="result-chip-row">
              <Chip kind={completionReason === "user_stopped" ? undefined : "ok"} dot>
                {reasonLabel}
              </Chip>
              <Chip dot>{questionCount} questions</Chip>
              <Chip dot>{duration}</Chip>
              <Chip dot>{templateCategory}</Chip>
            </div>
          </div>
        </div>

        <div>
          <div className="micro-text upper" style={{ color: "var(--ok)", marginBottom: 10 }}>
            What landed
          </div>
          <div className="result-feedback-grid">
            {strengths.map((item, index) => (
              <FeedbackCard
                key={`${item}-${index}`}
                icon="check"
                tone="ok"
                title={item}
                body="This came through as a positive signal in the session summary."
              />
            ))}
          </div>
        </div>

        <div>
          <div className="micro-text upper" style={{ color: "var(--err)", marginBottom: 10 }}>
            What to sharpen
          </div>
          <div className="result-feedback-grid">
            {improvements.map((item, index) => (
              <FeedbackCard
                key={`${item}-${index}`}
                icon="bolt"
                tone="err"
                title={item}
                body="Use this as the next rehearsal target before rerunning the interview."
              />
            ))}
          </div>
        </div>

        <div className="card card--flush result-next-step">
          <Icon name="sparkle" size={18} style={{ color: "var(--acc-deep)" }} />
          <span className="body-text" style={{ color: "var(--ink-800)" }}>
            Run the same template again after tightening the sharpen items, or open the transcript to review the exact answer flow.
          </span>
          <Button kind="primary" size="sm" icon="play" style={{ marginLeft: "auto" }} onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>

      <aside className="result-rail" aria-label="Result details">
        <div className="card result-rail-card">
          <div className="micro-text upper" style={{ marginBottom: 12 }}>
            Score profile
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ color: scoreTone, fontSize: 26, fontWeight: 500 }}>
              {score}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bar" style={{ height: 7 }}>
                <i style={{ width: `${score}%`, background: scoreTone }} />
              </div>
            </div>
          </div>
          <p className="small-text" style={{ marginTop: 10 }}>
            {scoreTier(score)}
          </p>
        </div>

        <div className="card result-rail-card">
          <div className="micro-text upper" style={{ marginBottom: 12 }}>
            Session
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MetaRow label="Template">{templateTitle}</MetaRow>
            <MetaRow label="Category">{templateCategory}</MetaRow>
            <MetaRow label="Finished by">{reasonLabel}</MetaRow>
            <MetaRow label="Questions">{questionCount}</MetaRow>
            <MetaRow label="Duration">{duration}</MetaRow>
          </div>
          <div className="hr" style={{ margin: "12px 0" }} />
          <Button kind="ghost" block icon="book" size="sm" onClick={onTranscript}>
            View full transcript
          </Button>
          <Button kind="quiet" block icon="download" size="sm" style={{ marginTop: 6 }} onClick={onExport}>
            Export transcript
          </Button>
        </div>
      </aside>
    </section>
  );
}
