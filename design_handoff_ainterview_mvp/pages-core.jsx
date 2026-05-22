// pages-core.jsx — Login/Register · Discovery · Template Detail · Create Template · Profile

// ──────────────────────────────────────────────────────────────
// 1 · Auth — split-screen
// ──────────────────────────────────────────────────────────────
const PageAuth = ({ mode = "login" }) => (
  <div
    className="ai"
    style={{
      width: "100%",
      height: "100%",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--bg)",
    }}
  >
    {/* Left — marketing pane */}
    <div
      style={{
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        background: "var(--ink-900)",
        color: "var(--surface)",
        position: "relative",
        overflow: "hidden",
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
          maxWidth: 420,
        }}
      >
        <div className="eyebrow" style={{ color: "oklch(0.74 0.13 78)" }}>
          Adaptive AI interviews
        </div>
        <h1
          className="h-display"
          style={{
            color: "var(--surface)",
            fontWeight: 500,
            fontSize: 42,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            textWrap: "pretty",
          }}
        >
          Practice harder questions, calmly.
        </h1>
        <p
          className="body"
          style={{ color: "oklch(0.85 0.012 78)", fontSize: 15, lineHeight: 1.55, maxWidth: 380 }}
        >
          AInterview runs voice-first mock interviews that adapt to your answers. No fixed question
          count — the AI decides when it has enough signal.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
          {[
            ["Adaptive runtime", "AI picks 3–12 questions and stops when it has enough signal."],
            ["Real voice loop", "Deepgram TTS asks, you answer aloud, STT transcribes."],
            ["Shareable rubrics", "Save and like the best community templates."],
          ].map(([t, d]) => (
            <div key={t} style={{ display: "flex", gap: 12 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "oklch(0.74 0.13 78)",
                  color: "var(--ink-900)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                  marginTop: 1,
                }}
              >
                <Icon name="check" size={13} stroke={2.4} />
              </span>
              <div>
                <div style={{ color: "var(--surface)", fontSize: 13.5, fontWeight: 500 }}>{t}</div>
                <div style={{ color: "oklch(0.7 0.012 78)", fontSize: 12.5, lineHeight: 1.5 }}>
                  {d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="micro mono"
        style={{ color: "oklch(0.7 0.012 78)", display: "flex", justifyContent: "space-between" }}
      >
        <span>ainterview.app</span>
        <span>v0.4 · MVP</span>
      </div>

      {/* decorative waveform */}
      <div
        style={{
          position: "absolute",
          right: -60,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06,
          color: "var(--surface)",
        }}
      >
        <Wave bars={40} max={140} seed={4} />
      </div>
    </div>

    {/* Right — form */}
    <div
      style={{
        padding: "48px 64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 380,
          width: "100%",
          marginInline: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: 3,
            background: "var(--surface-2)",
            borderRadius: 999,
            border: "1px solid var(--ink-200)",
          }}
        >
          <span
            className={`btn btn--sm ${mode === "login" ? "btn--primary" : "btn--quiet"}`}
            style={{ borderRadius: 999, height: 28 }}
          >
            Sign in
          </span>
          <span
            className={`btn btn--sm ${mode === "register" ? "btn--primary" : "btn--quiet"}`}
            style={{ borderRadius: 999, height: 28 }}
          >
            Create account
          </span>
        </div>
        <div>
          <div className="h1" style={{ fontWeight: 500 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            {mode === "login"
              ? "Sign in to keep practicing. Your sessions stay private."
              : "Free during MVP. No card needed."}
          </div>
        </div>
        <Field label="Email">
          <Input value="maya@craft.io" icon="user" />
        </Field>
        <Field
          label={
            <span style={{ display: "flex", width: "100%" }}>
              <span>Password</span>
              <span
                className="label__hint"
                style={{ marginLeft: "auto", color: "var(--acc-deep)" }}
              >
                Forgot?
              </span>
            </span>
          }
        >
          <Input value="••••••••••••" icon="settings" focus suffix="show" />
        </Field>
        {mode === "register" && (
          <Field label="Display name">
            <Input value="" placeholder="How others will see you" icon="pen" />
          </Field>
        )}
        <Button kind="primary" size="lg" block iconRight="arrow">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ height: 1, background: "var(--ink-200)" }} />{" "}
          <span className="micro">or</span>{" "}
          <span style={{ height: 1, background: "var(--ink-200)" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button kind="ghost" block icon="user">
            Google
          </Button>
          <Button kind="ghost" block icon="user">
            GitHub
          </Button>
        </div>
        <div className="micro" style={{ textAlign: "center", marginTop: 4 }}>
          By continuing you agree to the{" "}
          <a style={{ color: "var(--ink-800)", borderBottom: "1px solid var(--ink-300)" }}>terms</a>{" "}
          and{" "}
          <a style={{ color: "var(--ink-800)", borderBottom: "1px solid var(--ink-300)" }}>
            privacy policy
          </a>
          .
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// 2 · Discovery
// ──────────────────────────────────────────────────────────────
const PageDiscovery = () => {
  const cats = ["All", "Engineering", "Product", "Design", "Founder", "Data", "Sales"];
  const cards = [
    {
      title: "Behavioral round for senior IC engineers",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "412",
      range: "6–8 Q",
      liked: true,
    },
    {
      title: "Product sense — 0→1 launch deep dive",
      author: "Theo Brandt",
      category: "Product",
      likes: "318",
      range: "5–7 Q",
      hot: true,
    },
    {
      title: "Staff design crit · portfolio walk",
      author: "Sena Yıldız",
      category: "Design",
      likes: "201",
      range: "4–6 Q",
    },
    {
      title: "Founding engineer trial — values fit",
      author: "Ravi Menon",
      category: "Founder",
      likes: "98",
      range: "3–5 Q",
    },
    {
      title: "Data infra system design with trade-offs",
      author: "Jonas Reuter",
      category: "Engineering",
      likes: "276",
      range: "4–6 Q",
    },
    {
      title: "Strategic narrative for enterprise sales",
      author: "Camille Roux",
      category: "Sales",
      likes: "184",
      range: "4–6 Q",
    },
    {
      title: "Conflict & feedback for new EMs",
      author: "Asha Iyer",
      category: "Engineering",
      likes: "155",
      range: "5–7 Q",
      liked: true,
    },
    {
      title: "Design ops · workflow & rituals",
      author: "Mads Pedersen",
      category: "Design",
      likes: "94",
      range: "3–5 Q",
    },
  ];

  return (
    <div className="ai page">
      <Sidebar active="discover" />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <div
          className="main main--scroll"
          style={{ display: "flex", flexDirection: "column", gap: 22 }}
        >
          {/* Hero */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Discover · 1,284 templates
              </div>
              <h1
                className="h-display"
                style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.025em" }}
              >
                Pick a rubric. <span style={{ color: "var(--acc-deep)" }}>Practice out loud.</span>
              </h1>
              <div className="body" style={{ maxWidth: 520, marginTop: 8 }}>
                The AI runs adaptive interviews — typically 3–12 questions — and stops when it has
                enough signal.
              </div>
            </div>
            <Button kind="accent" icon="plus" size="lg">
              New template
            </Button>
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {cats.map((c, i) => (
              <span
                key={c}
                className={`chip${i === 1 ? " chip--ink" : ""}`}
                style={{ cursor: "pointer" }}
              >
                {c}
              </span>
            ))}
            <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8 }}>
              <Button kind="ghost" size="sm" icon="filter">
                Filter
              </Button>
              <Button kind="ghost" size="sm" icon="layers" iconRight="chevron">
                Sort · Trending
              </Button>
            </span>
          </div>

          {/* Featured banner */}
          <div
            className="card card--ink"
            style={{
              padding: 22,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 18,
              alignItems: "center",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
                zIndex: 1,
              }}
            >
              <span className="eyebrow" style={{ color: "oklch(0.74 0.13 78)" }}>
                Editor's pick · this week
              </span>
              <div
                className="h2"
                style={{ color: "var(--surface)", fontWeight: 500, fontSize: 22 }}
              >
                Behavioral · founder-led startups
              </div>
              <div className="small" style={{ color: "oklch(0.78 0.012 78)", maxWidth: 480 }}>
                A 5-question rubric from Theo Brandt focused on bias-for-action and lived ambiguity.
                The AI may extend up to 8 if your answers stay generic.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <Avatar name="TB" tone="b" size="sm" />
                <span className="small" style={{ color: "oklch(0.85 0.012 78)" }}>
                  Theo Brandt · 1.2k starts this week
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button kind="accent" icon="play">
                Start
              </Button>
              <Button
                kind="ghost"
                style={{ borderColor: "oklch(1 0 0 / 0.18)", color: "var(--surface)" }}
                icon="bookmark"
              >
                Save
              </Button>
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 360,
                opacity: 0.08,
                color: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 20,
              }}
            >
              <Wave bars={50} max={120} seed={9} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="h2" style={{ fontWeight: 500 }}>
              Trending in Engineering
            </div>
            <span className="micro" style={{ color: "var(--ink-500)" }}>
              Updated 4m ago
            </span>
            <a
              className="small"
              style={{
                marginLeft: "auto",
                color: "var(--ink-700)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              See all <Icon name="arrow" size={12} />
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {cards.map((c, i) => (
              <TemplateCard key={i} {...c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// 3 · Template Detail
// ──────────────────────────────────────────────────────────────
const PageTemplateDetail = () => (
  <div className="ai page">
    <Sidebar active="discover" />
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Topbar crumb={["Discover", "Engineering", "Behavioral round"]} />
      <div
        className="main main--scroll"
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}
      >
        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Chip kind="accent" dot>
                Engineering
              </Chip>
              <Chip dot>Behavioral</Chip>
              <Chip dot>Senior · Staff</Chip>
            </div>
            <h1
              className="h-display"
              style={{
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: "-0.025em",
                textWrap: "balance",
              }}
            >
              Behavioral round for senior IC engineers
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 14,
                color: "var(--ink-600)",
              }}
            >
              <Avatar name="DA" tone="d" size="sm" />
              <span className="body" style={{ color: "var(--ink-800)" }}>
                Dilara Aksoy
              </span>
              <span className="micro">·</span>
              <span className="micro">Updated 2 days ago</span>
              <span className="micro">·</span>
              <span className="micro mono">412 ♥ · 3.2k starts</span>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="h3" style={{ marginBottom: 8 }}>
              About this rubric
            </div>
            <p className="body" style={{ marginBottom: 12 }}>
              Six core behaviors I look for when interviewing senior ICs at growth-stage companies.
              The AI asks one question at a time, follows up when an answer is vague, and stops once
              it has enough signal across all six axes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                "Ownership",
                "Trade-offs",
                "Influence",
                "Conflict",
                "Outcomes",
                "Self-awareness",
              ].map((x) => (
                <div
                  key={x}
                  className="card card--flush"
                  style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Icon name="target" size={14} style={{ color: "var(--acc-deep)" }} />
                  <span className="small" style={{ color: "var(--ink-800)", fontWeight: 500 }}>
                    {x}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="h3" style={{ marginBottom: 12 }}>
              System instruction
            </div>
            <div className="card" style={{ padding: 16, background: "var(--surface-2)" }}>
              <p
                className="mono"
                style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-800)" }}
              >
                You are a calm, senior engineering manager. Ask one behavioral question at a time,
                focused on the rubric below. If an answer is vague, ask one follow-up — never two in
                a row. Aim for 6 questions; you may finish at 4 if signal is strong, or extend to 8
                if answers stay generic.
              </p>
            </div>
          </div>

          <div>
            <div
              className="h3"
              style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}
            >
              Sample questions <Chip>Generated by AI</Chip>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Tell me about a project where you owned a decision that was unpopular with your team.",
                "Describe a trade-off you made between code quality and a hard deadline.",
                "Walk me through a time you had to influence a more senior engineer without authority.",
              ].map((q, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <span
                    className="mono"
                    style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}
                  >
                    0{i + 1}
                  </span>
                  <span className="body" style={{ color: "var(--ink-900)" }}>
                    {q}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
          }}
        >
          <div
            className="card"
            style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                Adaptive session
              </div>
              <div className="h2" style={{ fontWeight: 500 }}>
                ~6 questions · 12 min
              </div>
              <div className="small" style={{ marginTop: 4 }}>
                Range 4–8 · AI may finish early
              </div>
            </div>
            <div className="bar is-acc">
              <i style={{ width: "50%" }} />
            </div>
            <Button kind="primary" size="lg" block icon="play" iconRight="arrow">
              Start interview
            </Button>
            <div style={{ display: "flex", gap: 8 }}>
              <Button kind="ghost" block icon="heart">
                Like · 412
              </Button>
              <IconBtn name="bookmark" />
              <IconBtn name="more" />
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="micro upper" style={{ marginBottom: 10 }}>
              Author
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name="DA" tone="d" size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h3">Dilara Aksoy</div>
                <div className="micro">14 templates · 2.1k followers</div>
              </div>
              <Button kind="ghost" size="sm">
                Follow
              </Button>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="micro upper" style={{ marginBottom: 10 }}>
              Recent runs
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Maya H.", "7 Q · 82", "a"],
                ["Jin Park", "5 Q · 71", "c"],
                ["Lior K.", "8 Q · 64", "e"],
              ].map(([n, m, t], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar
                    name={n
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                    tone={t}
                    size="sm"
                  />
                  <span className="small" style={{ color: "var(--ink-800)" }}>
                    {n}
                  </span>
                  <span className="mono micro" style={{ marginLeft: "auto" }}>
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// 4 · Create Template
// ──────────────────────────────────────────────────────────────
const PageCreate = () => (
  <div className="ai page">
    <Sidebar active="create" />
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Topbar
        crumb={["My templates", "New template"]}
        actions={
          <>
            <Button kind="quiet" size="sm">
              Save draft
            </Button>
            <Button kind="primary" size="sm" icon="check">
              Publish
            </Button>
          </>
        }
      />
      <div
        className="main main--scroll"
        style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}
      >
        {/* Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Step 1 of 3 · Identity
            </div>
            <h1 className="h1" style={{ fontWeight: 500 }}>
              Create a new template
            </h1>
          </div>

          <div
            className="card"
            style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}
          >
            <Field label="Title" hint="A short, action-led name people can scan.">
              <Input value="Behavioral round for senior IC engineers" focus />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Category">
                <div className="input" style={{ justifyContent: "space-between" }}>
                  <span>Engineering</span>
                  <Icon name="chevron" size={14} style={{ color: "var(--ink-500)" }} />
                </div>
              </Field>
              <Field label="Seniority">
                <div className="input" style={{ justifyContent: "space-between" }}>
                  <span>Senior · Staff</span>
                  <Icon name="chevron" size={14} style={{ color: "var(--ink-500)" }} />
                </div>
              </Field>
            </div>
            <Field
              label="Description"
              hint="Describe what this rubric is for and who should run it."
            >
              <textarea
                className="textarea"
                rows="3"
                readOnly
                defaultValue="Six core behaviors I look for when interviewing senior ICs at growth-stage companies. The AI follows up when answers are vague."
              />
            </Field>
          </div>

          <div
            className="card"
            style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="h3">
                System instruction <Chip>AI prompt</Chip>
              </div>
              <span className="mono micro" style={{ marginLeft: "auto" }}>
                312 / 2000
              </span>
            </div>
            <div className="card card--flush" style={{ padding: 14 }}>
              <p
                className="mono"
                style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-800)" }}
              >
                You are a calm, senior engineering manager. Ask one behavioral question at a time,
                focused on the rubric below. If an answer is vague, ask one follow-up — never two in
                a row. Aim for 6 questions; you may finish at 4 if signal is strong, or extend to 8
                if answers stay generic.
              </p>
            </div>
            <Field label="Rubric axes" hint="The AI will weight follow-ups by these.">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  "Ownership",
                  "Trade-offs",
                  "Influence",
                  "Conflict",
                  "Outcomes",
                  "Self-awareness",
                ].map((x) => (
                  <span key={x} className="chip" style={{ paddingRight: 4 }}>
                    {x}
                    <button
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "var(--ink-200)",
                        color: "var(--ink-700)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="close" size={9} stroke={2} />
                    </button>
                  </span>
                ))}
                <button
                  className="chip"
                  style={{
                    background: "transparent",
                    borderStyle: "dashed",
                    color: "var(--ink-600)",
                  }}
                >
                  <Icon name="plus" size={11} /> Add axis
                </button>
              </div>
            </Field>
          </div>

          <div
            className="card"
            style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="h3">Question range</div>
            <div className="body">
              Set how many questions the AI may ask. It chooses a target inside this range, and
              stops early if it has enough signal.
            </div>
            <div
              className="card card--flush"
              style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 18 }}
            >
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>
                min 3
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "var(--ink-200)",
                  borderRadius: 999,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "20%",
                    right: "40%",
                    top: 0,
                    bottom: 0,
                    background: "var(--ink-900)",
                    borderRadius: 999,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "20%",
                    top: -5,
                    width: 16,
                    height: 16,
                    background: "var(--surface)",
                    border: "2px solid var(--ink-900)",
                    borderRadius: 999,
                    transform: "translateX(-50%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "60%",
                    top: -5,
                    width: 16,
                    height: 16,
                    background: "var(--surface)",
                    border: "2px solid var(--ink-900)",
                    borderRadius: 999,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>
                max 12
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 13,
                  color: "var(--ink-900)",
                  fontWeight: 500,
                  minWidth: 56,
                  textAlign: "right",
                }}
              >
                4 – 8
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button kind="quiet" icon="arrowL">
              Back
            </Button>
            <div className="micro">Step 1 of 3</div>
            <Button kind="primary" iconRight="arrow">
              Continue to preview
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
          }}
        >
          <div className="micro upper">Live preview</div>
          <TemplateCard
            title="Behavioral round for senior IC engineers"
            author="Maya Hoxha"
            category="Engineering"
            likes="0"
            range="4–8 Q"
          />
          <div
            className="card card--flush"
            style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div className="micro upper">Visibility</div>
            <label className="small" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "var(--ink-900)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--surface)",
                }}
              >
                <Icon name="check" size={11} stroke={2.6} />
              </span>
              <span>
                <b style={{ fontWeight: 500, color: "var(--ink-900)" }}>Public</b> — anyone can find
                and run this
              </span>
            </label>
            <label
              className="small"
              style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-600)" }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  border: "1.5px solid var(--ink-300)",
                }}
              />
              <span>Unlisted — only those with link</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// 5 · Profile
// ──────────────────────────────────────────────────────────────
const PageProfile = () => {
  const tabs = ["Templates · 14", "Liked · 32", "Followers · 2.1k", "Following · 184"];
  const cards = [
    {
      title: "Behavioral round for senior IC engineers",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "412",
      range: "6–8 Q",
    },
    {
      title: "System design — caching trade-offs",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "298",
      range: "4–6 Q",
    },
    {
      title: "Conflict & feedback for new EMs",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "155",
      range: "5–7 Q",
      liked: true,
    },
    {
      title: "Resilience & reliability scenarios",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "104",
      range: "3–5 Q",
    },
    {
      title: "On-call & incident post-mortems",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "88",
      range: "3–5 Q",
    },
    {
      title: "Refactor or rewrite — judgement call",
      author: "Dilara Aksoy",
      category: "Engineering",
      likes: "72",
      range: "4–6 Q",
    },
  ];
  return (
    <div className="ai page">
      <Sidebar active="profile" />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar crumb={["People", "Dilara Aksoy"]} />
        <div
          className="main main--scroll"
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Header */}
          <div
            className="card"
            style={{
              padding: 24,
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center",
              gap: 22,
            }}
          >
            <Avatar name="DA" tone="d" size="xl" />
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                Engineering coach
              </div>
              <div className="h1" style={{ fontWeight: 500 }}>
                Dilara Aksoy
              </div>
              <div className="body" style={{ marginTop: 6, maxWidth: 540 }}>
                Engineering manager at a payments unicorn. Writes behavioral rubrics for the people
                who'd rather practice than prep.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
                <span className="small">
                  <b style={{ color: "var(--ink-900)", fontWeight: 500 }}>14</b> templates
                </span>
                <span className="vr" style={{ height: 14 }} />
                <span className="small">
                  <b style={{ color: "var(--ink-900)", fontWeight: 500 }}>2,184</b> followers
                </span>
                <span className="vr" style={{ height: 14 }} />
                <span className="small">
                  <b style={{ color: "var(--ink-900)", fontWeight: 500 }}>184</b> following
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button kind="primary" icon="plus">
                Follow
              </Button>
              <IconBtn name="chat" />
              <IconBtn name="more" />
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid var(--ink-200)",
            }}
          >
            {tabs.map((t, i) => (
              <span
                key={t}
                style={{
                  padding: "10px 14px",
                  fontSize: 13.5,
                  fontWeight: i === 0 ? 500 : 400,
                  color: i === 0 ? "var(--ink-900)" : "var(--ink-600)",
                  borderBottom: i === 0 ? "2px solid var(--ink-900)" : "2px solid transparent",
                  marginBottom: -1,
                  cursor: "pointer",
                }}
              >
                {t}
              </span>
            ))}
            <span style={{ marginLeft: "auto" }}>
              <Button kind="ghost" size="sm" icon="grid" iconRight="chevron">
                Grid
              </Button>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {cards.map((c, i) => (
              <TemplateCard key={i} {...c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PageAuth, PageDiscovery, PageTemplateDetail, PageCreate, PageProfile });
