import type { CSSProperties } from "react";

type WaveProps = {
  bars?: number;
  color?: string;
  max?: number;
  seed?: number;
  style?: CSSProperties;
};

export function Wave({ bars = 28, color = "currentColor", max = 16, seed = 1, style }: WaveProps) {
  const heights: number[] = [];
  let s = seed * 9301;
  for (let i = 0; i < bars; i++) {
    s = (s * 9301 + 49297) % 233280;
    heights.push(3 + (s / 233280) * max);
  }
  return (
    <span className="wave" style={{ color, ...style }}>
      {heights.map((h, i) => (
        <i key={i} style={{ height: h }} />
      ))}
    </span>
  );
}
