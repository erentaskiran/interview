import { useMemo } from "react";
import { Button } from "./Button";
import { Icon, IconBtn } from "./Icon";
import { Wave } from "./Wave";

export type AudioRecorderState = "idle" | "recording" | "review" | "processing";

export type AudioRecorderProps = {
  state: AudioRecorderState;
  durationSec?: number;
  maxSec?: number;
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  onPlayback: () => void;
  onReRecord: () => void;
  device?: { name: string; levelOk: boolean };
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  state,
  durationSec = 0,
  maxSec = 180,
  onStart,
  onStop,
  onSubmit,
  onPlayback,
  onReRecord,
}: AudioRecorderProps) {
  const label = useMemo(() => {
    switch (state) {
      case "idle":
        return "Tap to record your answer";
      case "recording":
        return `Recording · ${formatDuration(durationSec)}`;
      case "processing":
        return "Transcribing…";
      case "review":
        return `Answer captured · ${formatDuration(durationSec)}`;
      default:
        return "";
    }
  }, [state, durationSec]);

  const isInverted = state === "recording";

  return (
    <div
      className="card"
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: isInverted ? "var(--ink-900)" : "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          className={state === "recording" ? "rec-dot" : ""}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background:
              state === "recording"
                ? "var(--err)"
                : state === "review"
                  ? "var(--ok)"
                  : state === "processing"
                    ? "var(--acc)"
                    : "var(--ink-300)",
          }}
        />
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: isInverted ? "var(--surface)" : "var(--ink-600)",
            opacity: isInverted ? 0.8 : 1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          className="mono"
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: isInverted ? "var(--surface)" : "var(--ink-500)",
            opacity: isInverted ? 0.6 : 1,
          }}
        >
          {state === "recording"
            ? `${formatDuration(durationSec)} / ${formatDuration(maxSec)}`
            : state === "review"
              ? formatDuration(durationSec)
              : "00:00"}
        </span>
      </div>

      <div
        style={{
          height: 56,
          borderRadius: 10,
          background: isInverted ? "oklch(1 0 0 / 0.06)" : "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          color: isInverted ? "var(--surface)" : "var(--ink-700)",
          overflow: "hidden",
        }}
      >
        <Wave
          bars={48}
          max={32}
          seed={state === "recording" ? 5 : 2}
          color={state === "recording" ? "var(--acc)" : "var(--ink-400)"}
          style={{ width: "100%", justifyContent: "space-between" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {state === "idle" && (
          <Button kind="accent" icon="mic" size="lg" block onClick={onStart}>
            Record answer
          </Button>
        )}

        {state === "recording" && (
          <>
            <Button kind="danger" icon="stop" size="lg" block onClick={onStop}>
              Stop
            </Button>
            <button
              className="btn btn--icon btn--ghost"
              style={{
                background: "oklch(1 0 0 / 0.08)",
                borderColor: "oklch(1 0 0 / 0.16)",
                color: "white",
              }}
            >
              <Icon name="pause" size={15} />
            </button>
          </>
        )}

        {state === "review" && (
          <>
            <Button kind="ghost" icon="play" onClick={onPlayback}>
              Play back
            </Button>
            <Button kind="ghost" icon="mic" onClick={onReRecord}>
              Re-record
            </Button>
            <Button
              kind="primary"
              iconRight="arrow"
              style={{ marginLeft: "auto" }}
              onClick={onSubmit}
            >
              Submit
            </Button>
          </>
        )}

        {state === "processing" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--ink-600)",
            }}
          >
            <span className="dotrow">
              <i className="dot is-now" />
              <i className="dot" />
              <i className="dot" />
            </span>
            <span className="small-text">Sending to speech service…</span>
          </div>
        )}
      </div>
    </div>
  );
}
