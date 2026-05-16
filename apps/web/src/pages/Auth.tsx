import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Field, Input } from "../components/Input";
import { Icon } from "../components/Icon";
import { Wave } from "../components/Wave";
import { Wordmark } from "../components/Wordmark";

export type AuthMode = "login" | "register";

type AuthSubmitPayload = {
  email: string;
  password: string;
  displayName?: string;
};

type AuthPageProps = {
  mode: AuthMode;
  loading?: boolean;
  error?: string | null;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (mode: AuthMode, payload: AuthSubmitPayload) => Promise<void>;
};

export default function AuthPage({
  mode,
  loading,
  error,
  onModeChange,
  onSubmit
}: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const activeError = localError ?? error ?? null;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 8 && password.length <= 100;
  const displayNameValid =
    mode === "login" || (displayName.trim().length >= 2 && displayName.trim().length <= 60);

  const canSubmit = useMemo(() => {
    if (!emailValid || !passwordValid) {
      return false;
    }
    if (!displayNameValid) {
      return false;
    }
    return true;
  }, [displayNameValid, emailValid, passwordValid]);

  const handleSubmit = async () => {
    setLocalError(null);
    if (!canSubmit) {
      if (!emailValid) {
        setLocalError("Please enter a valid email address.");
        return;
      }
      if (!passwordValid) {
        setLocalError("Password must be between 8 and 100 characters.");
        return;
      }
      if (!displayNameValid) {
        setLocalError("Display name must be between 2 and 60 characters.");
        return;
      }
      setLocalError("Please complete all required fields.");
      return;
    }

    await onSubmit(mode, {
      email: email.trim(),
      password,
      ...(mode === "register" ? { displayName: displayName.trim() } : {})
    });
  };

  return (
    <div
      className="page page--bare"
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--bg)"
      }}
    >
      <div
        style={{
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          background: "var(--ink-900)",
          color: "var(--surface)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Wordmark size={20} color="var(--surface)" />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            maxWidth: 420
          }}
        >
          <div className="eyebrow" style={{ color: "var(--acc)" }}>
            Adaptive AI interviews
          </div>
          <h1
            className="h-display"
            style={{
              color: "var(--surface)",
              fontWeight: 500,
              fontSize: 42,
              lineHeight: 1.05,
              textWrap: "pretty"
            }}
          >
            Practice harder questions, calmly.
          </h1>
          <p
            className="body-text"
            style={{ color: "oklch(0.85 0.012 78)", fontSize: 15, maxWidth: 380 }}
          >
            AInterview runs voice-first mock interviews that adapt to your answers.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            {[
              ["Adaptive runtime", "AI picks 3-12 questions and stops when signal is enough."],
              ["Real voice loop", "Deepgram TTS asks, STT transcribes your answer."],
              ["Template library", "Save and like community interview templates."]
            ].map(([title, body]) => (
              <div key={title} style={{ display: "flex", gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: "var(--acc)",
                    color: "var(--ink-900)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    marginTop: 1
                  }}
                >
                  <Icon name="check" size={13} stroke={2.4} />
                </span>
                <div>
                  <div style={{ color: "var(--surface)", fontSize: 13.5, fontWeight: 500 }}>
                    {title}
                  </div>
                  <div style={{ color: "oklch(0.7 0.012 78)", fontSize: 12.5 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: -60,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.06,
            color: "var(--surface)"
          }}
        >
          <Wave bars={40} max={140} seed={4} />
        </div>
      </div>

      <div
        style={{
          padding: "48px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: "100%",
            marginInline: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: 3,
              background: "var(--surface-2)",
              borderRadius: 999,
              border: "1px solid var(--ink-200)"
            }}
          >
            <button
              className={`btn btn--sm ${mode === "login" ? "btn--primary" : "btn--quiet"}`}
              style={{ borderRadius: 999, height: 28 }}
              onClick={() => onModeChange("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`btn btn--sm ${mode === "register" ? "btn--primary" : "btn--quiet"}`}
              style={{ borderRadius: 999, height: 28 }}
              onClick={() => onModeChange("register")}
              type="button"
            >
              Create account
            </button>
          </div>

          <div>
            <div className="h1" style={{ fontWeight: 500 }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </div>
          </div>

          <Field label="Email">
            <Input value={email} onChange={setEmail} icon="user" type="email" />
          </Field>

          <Field label="Password">
            <Input value={password} onChange={setPassword} icon="settings" type="password" />
          </Field>

          {mode === "register" && (
            <Field label="Display name">
              <Input value={displayName} onChange={setDisplayName} icon="pen" />
            </Field>
          )}

          {activeError && (
            <div
              className="card"
              style={{
                padding: 10,
                borderColor: "oklch(0.85 0.1 28)",
                background: "var(--err-soft)",
                color: "var(--err)",
                fontSize: 12
              }}
            >
              {activeError}
            </div>
          )}

          <Button
            kind="primary"
            size="lg"
            block
            iconRight="arrow"
            onClick={() => {
              void handleSubmit();
            }}
            type="button"
            loading={Boolean(loading)}
            disabled={!canSubmit}
            style={{ justifyContent: "center" }}
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
