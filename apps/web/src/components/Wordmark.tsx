import type { CSSProperties } from "react";

type WordmarkProps = {
  size?: number;
  mono?: boolean;
  color?: string;
};

export function Wordmark({ size = 18, mono = false, color }: WordmarkProps) {
  const bars = [4, 9, 14, 8, 11, 5];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.45,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          color: color || "var(--acc-deep)",
        }}
      >
        {bars.map((h, i) => (
          <span
            key={i}
            style={{
              width: Math.max(2, size * 0.13),
              height: (h / 14) * size * 1.1,
              background: "currentColor",
              borderRadius: 2,
            }}
          />
        ))}
      </span>
      <span
        style={{
          fontFamily: mono
            ? "var(--f-mono)"
            : "var(--f-sans)",
          fontSize: size,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: color || "var(--ink-900)",
        }}
      >
        AInterview
      </span>
    </span>
  );
}
