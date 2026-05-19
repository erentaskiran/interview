// tokens.jsx — Design-token preview artboards.

const tokenPad = 28;

const TokenFrame = ({ title, kicker, children, style }) => (
  <div
    className="ai"
    style={{
      width: "100%",
      height: "100%",
      padding: tokenPad,
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      ...style,
    }}
  >
    {(title || kicker) && (
      <div>
        {kicker && (
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {kicker}
          </div>
        )}
        {title && (
          <div className="h2" style={{ fontWeight: 500 }}>
            {title}
          </div>
        )}
      </div>
    )}
    {children}
  </div>
);

// ── Colors ──────────────────────────────────────────────
const Swatch = ({ name, cssvar, sample, ink = "var(--ink-900)", desc }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div
      style={{
        height: 86,
        background: sample,
        borderRadius: 10,
        border: "1px solid var(--ink-200)",
        position: "relative",
      }}
    >
      <span
        className="mono"
        style={{
          position: "absolute",
          bottom: 8,
          left: 10,
          fontSize: 10.5,
          color: ink,
          opacity: 0.8,
        }}
      >
        {name}
      </span>
    </div>
    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-600)" }}>
      {cssvar}
    </div>
    {desc && <div className="micro">{desc}</div>}
  </div>
);

const TokensColor = () => (
  <TokenFrame kicker="01 · Tokens" title="Color palette">
    <div className="body" style={{ maxWidth: 460 }}>
      A warm-neutral system. Cream surfaces; ink-warm-black for type. Mustard for accent — used
      sparingly on score badges, recording state, primary CTAs of voice flow.
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
      <Swatch name="bg" cssvar="--bg" sample="oklch(0.975 0.012 78)" desc="Page" />
      <Swatch name="surface" cssvar="--surface" sample="#FFFFFF" desc="Card" />
      <Swatch name="surface-2" cssvar="--surface-2" sample="oklch(0.965 0.013 78)" desc="Sunken" />
      <Swatch name="surface-3" cssvar="--surface-3" sample="oklch(0.945 0.015 78)" desc="Deeper" />
      <Swatch name="tint" cssvar="--tint" sample="oklch(0.955 0.018 78)" desc="Wash" />
      <Swatch name="ink-100" cssvar="--ink-100" sample="oklch(0.965 0.012 78)" desc="Hairline" />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
      <Swatch
        name="ink-900"
        cssvar="--ink-900"
        sample="oklch(0.22 0.012 60)"
        ink="#fff"
        desc="Type"
      />
      <Swatch
        name="ink-700"
        cssvar="--ink-700"
        sample="oklch(0.42 0.012 60)"
        ink="#fff"
        desc="Body"
      />
      <Swatch
        name="ink-600"
        cssvar="--ink-600"
        sample="oklch(0.55 0.012 60)"
        ink="#fff"
        desc="Secondary"
      />
      <Swatch
        name="ink-500"
        cssvar="--ink-500"
        sample="oklch(0.65 0.012 60)"
        ink="#fff"
        desc="Muted"
      />
      <Swatch name="ink-300" cssvar="--ink-300" sample="oklch(0.88 0.014 75)" desc="Hairline" />
      <Swatch name="ink-200" cssvar="--ink-200" sample="oklch(0.93 0.014 75)" desc="Border" />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
      <Swatch name="acc" cssvar="--acc" sample="oklch(0.74 0.13 78)" desc="Accent · mustard" />
      <Swatch
        name="acc-deep"
        cssvar="--acc-deep"
        sample="oklch(0.55 0.12 70)"
        ink="#fff"
        desc="On cream"
      />
      <Swatch name="acc-soft" cssvar="--acc-soft" sample="oklch(0.93 0.06 85)" desc="Wash" />
      <Swatch name="ok" cssvar="--ok" sample="oklch(0.62 0.11 150)" ink="#fff" desc="Success" />
      <Swatch name="warn" cssvar="--warn" sample="oklch(0.72 0.13 70)" desc="Warning" />
      <Swatch name="err" cssvar="--err" sample="oklch(0.58 0.16 28)" ink="#fff" desc="Danger" />
    </div>
  </TokenFrame>
);

// ── Typography ──────────────────────────────────────────
const TypeRow = ({ name, size, weight, tracking, lh, family = "sans", children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "110px 1fr 220px",
      alignItems: "baseline",
      gap: 18,
      padding: "14px 0",
      borderTop: "1px solid var(--ink-200)",
    }}
  >
    <div className="mono" style={{ fontSize: 11, color: "var(--ink-600)" }}>
      {name}
    </div>
    <div
      style={{
        fontFamily: family === "mono" ? "var(--f-mono)" : "var(--f-sans)",
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: lh,
        color: "var(--ink-900)",
      }}
    >
      {children}
    </div>
    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-500)" }}>
      {size}/{lh} · {weight}
      {tracking ? " · " + tracking : ""}
    </div>
  </div>
);

const TokensType = () => (
  <TokenFrame kicker="02 · Tokens" title="Typography">
    <div className="body" style={{ maxWidth: 520 }}>
      Geist + Geist Mono. One sans family, one mono. Numbers and identifiers (scores, codes,
      durations) live in mono with tabular figures.
    </div>
    <div>
      <TypeRow name="display" size="36px" weight="500" tracking="-0.025em" lh="1.08">
        Practice harder questions, calmly.
      </TypeRow>
      <TypeRow name="h1" size="26px" weight="500" tracking="-0.022em" lh="1.15">
        Senior Frontend — Behavioral round
      </TypeRow>
      <TypeRow name="h2" size="19px" weight="500" tracking="-0.015em" lh="1.25">
        Tell me about a time…
      </TypeRow>
      <TypeRow name="h3" size="15px" weight="600" tracking="-0.01em" lh="1.3">
        Rubric coverage
      </TypeRow>
      <TypeRow name="body" size="13.5px" weight="400" tracking="-0.005em" lh="1.55">
        Your answer covered ownership clearly but lacked a measurable outcome — the AI flagged this
        as a follow-up area.
      </TypeRow>
      <TypeRow name="small" size="12px" weight="400" tracking="0" lh="1.5">
        3 of an estimated 5–7 questions
      </TypeRow>
      <TypeRow name="micro" size="11px" weight="500" tracking=".08em" lh="1.4">
        UPDATED 4M AGO
      </TypeRow>
      <TypeRow name="mono" family="mono" size="13px" weight="500" tracking="0" lh="1.4">
        SESS_8K42P · 00:04:12
      </TypeRow>
    </div>
  </TokenFrame>
);

// ── Spacing ─────────────────────────────────────────────
const TokensSpacing = () => {
  const steps = [
    { name: "2xs", val: 4 },
    { name: "xs", val: 6 },
    { name: "sm", val: 8 },
    { name: "md", val: 12 },
    { name: "lg", val: 16 },
    { name: "xl", val: 24 },
    { name: "2xl", val: 32 },
    { name: "3xl", val: 48 },
  ];
  return (
    <TokenFrame kicker="03 · Tokens" title="Spacing scale">
      <div className="body">8-based scale with two off-grid steps (6, 12) for tight chrome.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s) => (
          <div
            key={s.name}
            style={{
              display: "grid",
              gridTemplateColumns: "46px 64px 1fr",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-700)" }}>
              {s.name}
            </span>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-500)" }}>
              {s.val}px
            </span>
            <span
              style={{
                height: 12,
                width: s.val * 4,
                background: "var(--ink-900)",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>
    </TokenFrame>
  );
};

// ── Radius ──────────────────────────────────────────────
const TokensRadius = () => {
  const steps = [
    { name: "xs", val: 4 },
    { name: "sm", val: 6 },
    { name: "md", val: 10 },
    { name: "lg", val: 14 },
    { name: "xl", val: 20 },
    { name: "2xl", val: 28 },
  ];
  return (
    <TokenFrame kicker="04 · Tokens" title="Radius">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {steps.map((s) => (
          <div
            key={s.name}
            style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "1.2",
                borderRadius: s.val,
                background: "var(--surface-2)",
                border: "1px solid var(--ink-200)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: s.val,
                  borderTop: "2px solid var(--ink-900)",
                  borderLeft: "2px solid var(--ink-900)",
                  width: 28,
                  height: 28,
                  top: 6,
                  left: 6,
                  borderRight: 0,
                  borderBottom: 0,
                }}
              />
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-700)" }}>
              {s.name}
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-500)" }}>
              {s.val}px
            </div>
          </div>
        ))}
      </div>
      <div className="body" style={{ marginTop: 6 }}>
        Buttons & inputs{" "}
        <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-700)" }}>
          md (10)
        </span>{" "}
        · Cards{" "}
        <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-700)" }}>
          lg (14)
        </span>{" "}
        · Hero / session card{" "}
        <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-700)" }}>
          xl (20)
        </span>
        .
      </div>
    </TokenFrame>
  );
};

// ── Shadows ─────────────────────────────────────────────
const TokensShadow = () => {
  const items = [
    { name: "xs", sh: "var(--shadow-xs)", desc: "List rows" },
    { name: "sm", sh: "var(--shadow-sm)", desc: "Cards (default)" },
    { name: "md", sh: "var(--shadow-md)", desc: "Floating chips, audio dock" },
    { name: "lg", sh: "var(--shadow-lg)", desc: "Modals" },
    { name: "pop", sh: "var(--shadow-pop)", desc: "Menus / popovers" },
  ];
  return (
    <TokenFrame kicker="05 · Tokens" title="Elevation">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {items.map((s) => (
          <div key={s.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                height: 70,
                borderRadius: 12,
                background: "var(--surface)",
                boxShadow: s.sh,
                border: "1px solid var(--ink-100)",
              }}
            />
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-700)" }}>
              {s.name}
            </div>
            <div className="micro">{s.desc}</div>
          </div>
        ))}
      </div>
    </TokenFrame>
  );
};

// ── Brand wordmark display ──────────────────────────────
const BrandCard = () => (
  <TokenFrame kicker="Brand" title="Wordmark">
    <div className="body" style={{ maxWidth: 380 }}>
      Sound-meter mark + grotesque wordmark. The bars echo the voice-meter we use during recording.
    </div>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Wordmark size={28} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Wordmark size={18} />
        <Wordmark size={14} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: 18,
          background: "var(--ink-900)",
          borderRadius: 14,
        }}
      >
        <span style={{ color: "var(--surface)" }}>
          <Wordmark size={18} color="currentColor" />
        </span>
      </div>
    </div>
  </TokenFrame>
);

Object.assign(window, {
  TokensColor,
  TokensType,
  TokensSpacing,
  TokensRadius,
  TokensShadow,
  BrandCard,
});
