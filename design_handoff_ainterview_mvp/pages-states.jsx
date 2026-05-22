// pages-states.jsx — loading, empty, error, mobile note.

const StatesFrame = ({ title, kicker, children }) => (
  <div
    className="ai"
    style={{
      width: "100%",
      height: "100%",
      padding: 24,
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    <div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        {kicker}
      </div>
      <div className="h2" style={{ fontWeight: 500 }}>
        {title}
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
  </div>
);

// ── Loading ─────────────────────────────────────────────
const StateLoading = () => (
  <StatesFrame kicker="States · 01" title="Loading">
    <div className="body">Skeleton echoes the real card shape — never spinners on lists.</div>

    {/* Skeleton card row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="card"
          style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}
        >
          <span className="sk" style={{ height: 18, width: 70 }} />
          <span className="sk" style={{ height: 14, width: "90%" }} />
          <span className="sk" style={{ height: 14, width: "70%" }} />
          <span className="sk" style={{ height: 1, width: "100%" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="sk" style={{ height: 22, width: 22, borderRadius: "50%" }} />
            <span className="sk" style={{ height: 12, width: 90 }} />
          </div>
        </div>
      ))}
    </div>

    {/* AI generating answer */}
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <span className="dotrow" style={{ alignItems: "flex-end" }}>
        <i className="dot is-now" style={{ width: 8, height: 8 }} />
        <i className="dot is-done" style={{ opacity: 0.6 }} />
        <i className="dot" />
      </span>
      <span className="small" style={{ color: "var(--ink-700)" }}>
        AI is choosing the next question…
      </span>
      <span className="mono micro" style={{ marginLeft: "auto" }}>
        2 of est. 6
      </span>
    </div>

    {/* Speech processing inline */}
    <div
      className="card"
      style={{
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface-2)",
      }}
    >
      <Wave bars={20} max={14} color="var(--ink-500)" />
      <span className="small" style={{ color: "var(--ink-700)" }}>
        Transcribing your answer with Deepgram
      </span>
      <span className="mono micro" style={{ marginLeft: "auto" }}>
        3s
      </span>
    </div>
  </StatesFrame>
);

// ── Empty ───────────────────────────────────────────────
const StateEmpty = () => (
  <StatesFrame kicker="States · 02" title="Empty">
    <div className="body">Always a verb. Never just "no items".</div>

    {/* No sessions */}
    <div
      className="card"
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "var(--surface-2)",
          border: "1px dashed var(--ink-300)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-500)",
        }}
      >
        <Icon name="headset" size={22} />
      </div>
      <div className="h3">No sessions yet</div>
      <div className="body" style={{ maxWidth: 320 }}>
        Pick a template from Discover, or write one yourself. Your first session takes about 8
        minutes.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Button kind="primary" icon="compass">
          Browse templates
        </Button>
        <Button kind="ghost" icon="plus">
          Create one
        </Button>
      </div>
    </div>

    {/* No search results */}
    <div
      className="card card--flush"
      style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}
    >
      <Icon name="search" size={18} style={{ color: "var(--ink-500)" }} />
      <div style={{ flex: 1 }}>
        <div className="small" style={{ fontWeight: 500, color: "var(--ink-900)" }}>
          No templates match "graph databases"
        </div>
        <div className="micro">Try a broader term, or create the rubric you wish existed.</div>
      </div>
      <Button kind="ghost" size="sm" icon="plus">
        Create
      </Button>
    </div>
  </StatesFrame>
);

// ── Error ───────────────────────────────────────────────
const StateError = () => (
  <StatesFrame kicker="States · 03" title="Error">
    <div className="body">
      Always actionable. Tell the user what went wrong and what they can do next.
    </div>

    {/* Inline banner */}
    <div
      className="card"
      style={{
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--err-soft)",
        borderColor: "oklch(0.85 0.1 28)",
      }}
    >
      <Icon name="bolt" size={16} style={{ color: "var(--err)" }} />
      <div style={{ flex: 1 }}>
        <div className="small" style={{ fontWeight: 500, color: "var(--ink-900)" }}>
          Speech service unreachable
        </div>
        <div className="micro">
          We couldn't transcribe your answer. Your audio is saved locally — retry to upload again.
        </div>
      </div>
      <Button kind="ghost" size="sm" icon="play">
        Retry
      </Button>
    </div>

    {/* Page-level */}
    <div
      className="card"
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "var(--err-soft)",
          color: "var(--err)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="close" size={22} stroke={2} />
      </div>
      <div className="h3">Couldn't score this session</div>
      <div className="body" style={{ maxWidth: 360 }}>
        The AI rejected the malformed response from your last turn. Your transcript is safe — you
        can retry scoring or export the raw answers.
      </div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--ink-500)",
          background: "var(--surface-2)",
          padding: "4px 8px",
          borderRadius: 6,
        }}
      >
        err_score_bad_response · sess_8k42p
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Button kind="primary" icon="play">
          Retry scoring
        </Button>
        <Button kind="ghost" icon="download">
          Export raw
        </Button>
      </div>
    </div>

    {/* Form error */}
    <div className="card card--flush" style={{ padding: 14 }}>
      <Field label="Email" error hint="That email is already in use. Try signing in instead.">
        <Input value="maya@craft.io" error />
      </Field>
    </div>
  </StatesFrame>
);

// ── Mobile reference ────────────────────────────────────
const StateMobile = () => (
  <StatesFrame kicker="States · 04" title="Mobile behavior">
    <div className="body">
      Desktop-first for MVP. The session, discovery, and result pages collapse to a single column at
      &lt; 720px. Sidebar becomes a sheet behind a menu button.
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {[
        {
          title: "Discovery",
          body: (
            <>
              <span className="sk" style={{ height: 14, width: "70%" }} />
              <span className="sk" style={{ height: 24, width: "100%" }} />
              <span className="sk" style={{ height: 90, width: "100%", borderRadius: 12 }} />
              <span className="sk" style={{ height: 90, width: "100%", borderRadius: 12 }} />
            </>
          ),
        },
        {
          title: "Session",
          body: (
            <>
              <div
                style={{
                  background: "var(--ink-900)",
                  color: "var(--surface)",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <div className="mono" style={{ fontSize: 10, color: "var(--acc)" }}>
                  Q4 of est. 6
                </div>
                <div style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                  Describe a time you had to influence…
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--acc)",
                }}
              >
                <Wave bars={28} max={36} seed={9} />
              </div>
              <button
                className="btn btn--accent"
                style={{ width: "100%", height: 36, borderRadius: 999 }}
              >
                <Icon name="stop" size={13} /> Stop &amp; submit
              </button>
            </>
          ),
        },
        {
          title: "Result",
          body: (
            <>
              <div
                className="gauge"
                style={{ width: 56, height: 56, "--p": 0.78, alignSelf: "center" }}
              >
                <span className="gauge__val" style={{ fontSize: 14 }}>
                  78
                </span>
              </div>
              <span className="sk" style={{ height: 14, width: "90%" }} />
              <span className="sk" style={{ height: 60, width: "100%", borderRadius: 8 }} />
              <span className="sk" style={{ height: 32, width: "100%", borderRadius: 999 }} />
            </>
          ),
        },
      ].map(({ title, body }) => (
        <div key={title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="micro upper">{title}</div>
          <div
            style={{
              width: "100%",
              aspectRatio: "9 / 16",
              background: "var(--surface-2)",
              border: "1px solid var(--ink-200)",
              borderRadius: 18,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Icon name="more" size={14} style={{ color: "var(--ink-500)" }} />
              <Wordmark size={10} />
              <Icon name="user" size={12} style={{ marginLeft: "auto", color: "var(--ink-500)" }} />
            </div>
            {body}
          </div>
        </div>
      ))}
    </div>

    <div
      className="card card--flush"
      style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}
    >
      {[
        ["Recorder", "Fixed bottom-sheet, 56px hit target"],
        ["Sidebar", "Sheet from left, scrim"],
        ["Tabs", "Horizontal scroll, no chevrons"],
      ].map(([k, v]) => (
        <div key={k}>
          <div className="micro upper">{k}</div>
          <div className="small" style={{ marginTop: 2 }}>
            {v}
          </div>
        </div>
      ))}
    </div>
  </StatesFrame>
);

Object.assign(window, { StateLoading, StateEmpty, StateError, StateMobile });
