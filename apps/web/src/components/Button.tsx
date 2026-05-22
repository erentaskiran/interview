import type { MouseEventHandler, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type ButtonKind = "primary" | "accent" | "ghost" | "quiet" | "danger";

export type ButtonProps = {
  kind?: ButtonKind;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
};

export function Button({
  kind = "primary",
  size = "md",
  icon,
  iconRight,
  block,
  disabled,
  loading,
  children,
  onClick,
  style,
  type = "button",
}: ButtonProps) {
  const cls = ["btn", `btn--${kind}`];
  if (size === "lg") cls.push("btn--lg");
  if (size === "sm") cls.push("btn--sm");
  if (block) cls.push("btn--block");

  const iconSize = size === "lg" ? 18 : size === "sm" ? 13 : 15;

  return (
    <button
      className={cls.join(" ")}
      style={style}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}
