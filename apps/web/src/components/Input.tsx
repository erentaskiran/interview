import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type InputProps = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  suffix?: ReactNode;
  size?: "md" | "lg";
  type?: "text" | "email" | "password";
  error?: boolean;
  disabled?: boolean;
  focus?: boolean;
  style?: React.CSSProperties;
};

export function Input({
  value,
  onChange,
  placeholder,
  icon,
  suffix,
  size = "md",
  type = "text",
  error,
  disabled,
  focus,
  style,
}: InputProps) {
  const cls = ["input"];
  if (size === "lg") cls.push("input--lg");
  if (error) cls.push("input--err");
  if (disabled) cls.push("input--disabled");
  if (focus) cls.push("input--focus");

  return (
    <div className={cls.join(" ")} style={style}>
      {icon && <Icon name={icon} size={14} style={{ color: "var(--ink-500)" }} />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={disabled}
      />
      {suffix && <span className="micro-text">{suffix}</span>}
    </div>
  );
}

export type FieldProps = {
  label?: ReactNode;
  hint?: string;
  error?: boolean;
  optional?: boolean;
  children: ReactNode;
};

export function Field({ label, hint, error, optional, children }: FieldProps) {
  return (
    <div className="field">
      {label && (
        <div className="label">
          <span>{label}</span>
          {optional && <span className="label__hint">Optional</span>}
        </div>
      )}
      {children}
      {hint && <div className={`hint${error ? " hint--err" : ""}`}>{hint}</div>}
    </div>
  );
}
