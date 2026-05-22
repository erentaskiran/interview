import type { CSSProperties } from "react";

type AvatarProps = {
  name?: string;
  tone?: "a" | "b" | "c" | "d" | "e";
  size?: "sm" | "md" | "lg" | "xl";
  style?: CSSProperties;
};

export function Avatar({ name = "AB", tone = "a", size = "md", style }: AvatarProps) {
  const cls = [`av`, `av--${tone}`, size !== "md" ? `av--${size}` : ""].filter(Boolean).join(" ");
  return (
    <span className={cls} style={style}>
      {name}
    </span>
  );
}
