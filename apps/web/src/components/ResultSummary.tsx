import { Button } from "./Button";
import { Chip } from "./Chip";

export type ResultSummaryProps = {
  score: number;
  completionReason: "ai_completed" | "user_stopped" | "failed";
  headline: string;
  strengths: string[];
  improvements: string[];
  questionCount: number;
  duration: string;
  onRetry: () => void;
  onTranscript: () => void;
  onExport: () => void;
};

export function ResultSummary({
  score,
  completionReason,
  headline,
  strengths,
  improvements,
  questionCount,
  duration,
  onRetry,
  onTranscript,
  onExport,
}: ResultSummaryProps) {
  const reasonLabel = {
    ai_completed: "AI completed",
    user_stopped: "You ended early",
    failed: "Could not score",
  }[completionReason];

  return (
    <div
      className="card"
      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="gauge" style={{ "--p": score / 100 } as React.CSSProperties}>
          <span className="gauge__val">{score}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Overall
          </div>
          <div className="h1" style={{ fontWeight: 500 }}>
            {headline}
          </div>
          <div
            className="small-text"
            style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Chip kind={completionReason === "user_stopped" ? undefined : "ok"} dot>
              {reasonLabel}
            </Chip>
            <span className="micro-text">
              {questionCount} questions · {duration}
            </span>
          </div>
        </div>
      </div>

      <div className="hr" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <div className="micro-text upper" style={{ color: "var(--ok)", marginBottom: 8 }}>
            Strengths
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strengths.map((s, i) => (
              <li key={i} className="body-text" style={{ paddingLeft: 14, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 7,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--ok)",
                  }}
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="micro-text upper" style={{ color: "var(--err)", marginBottom: 8 }}>
            Improve
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {improvements.map((s, i) => (
              <li key={i} className="body-text" style={{ paddingLeft: 14, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 7,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--err)",
                  }}
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Button kind="primary" icon="play" onClick={onRetry}>
          Try again
        </Button>
        <Button kind="ghost" icon="book" onClick={onTranscript}>
          View transcript
        </Button>
        <Button kind="quiet" icon="download" style={{ marginLeft: "auto" }} onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  );
}
