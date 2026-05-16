import type { ReactNode } from "react";

type ChipProps = {
  kind?: "accent" | "ok" | "ink" | null | undefined;
  dot?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export function Chip({ kind, dot, children, style, className }: ChipProps) {
  const cls = ["chip", kind ? `chip--${kind}` : "", dot ? "chip--dot" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}
