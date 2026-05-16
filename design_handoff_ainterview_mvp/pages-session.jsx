// pages-session.jsx — three variations of the Interview Session screen.
// All are conversation-style (chat bubbles + transcript flow) per spec.

// Shared header used by session screens.
const SessionHeader = ({ now = 4, planned = 6, dark }) => (
  <header style={{
    padding: '14px 22px',
    display: 'flex', alignItems: 'center', gap: 14,
    borderBottom: `1px solid ${dark ? 'oklch(1 0 0 / 0.08)' : 'var(--ink-200)'}`,
    background: dark ? 'var(--ink-900)' : 'var(--surface)',
    color: dark ? 'var(--surface)' : 'var(--ink-900)',
  }}>
    <Wordmark size={15} color={dark ? 'var(--surface)' : undefined} />
    <span style={{ height: 18, width: 1, background: dark ? 'oklch(1 0 0 / 0.12)' : 'var(--ink-200)', margin: '0 6px' }} />
    <span className="small" style={{ color: dark ? 'oklch(0.8 0.012 78)' : 'var(--ink-700)' }}>Behavioral · senior IC</span>
    <span className="mono" style={{ marginLeft: 14, fontSize: 11, color: dark ? 'oklch(0.7 0.012 78)' : 'var(--ink-500)' }}>SESS_8K42P</span>

    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i < now - 1 ? (dark ? 'var(--surface)' : 'var(--ink-900)') :
                       i === now - 1 ? 'var(--acc)' :
                       (dark ? 'oklch(1 0 0 / 0.15)' : 'var(--ink-300)'),
            boxShadow: i === now - 1 ? `0 0 0 3px ${dark ? 'oklch(0.74 0.13 78 / 0.2)' : 'var(--acc-soft)'}` : 'none',
          }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11.5, color: dark ? 'oklch(0.85 0.012 78)' : 'var(--ink-700)', fontWeight: 500 }}>Q{now}<span style={{ opacity: .6 }}> of est. {planned}</span></span>
      <span className="mono" style={{ fontSize: 11.5, color: dark ? 'oklch(0.7 0.012 78)' : 'var(--ink-500)' }}>00:04:12</span>
      <Button kind={dark ? 'ghost' : 'ghost'} size="sm" icon="close" style={dark ? { borderColor: 'oklch(1 0 0 / 0.16)', color: 'var(--surface)', background: 'transparent' } : {}}>End early</Button>
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────
// A · Calm transcript — soft bubbles, light cream, focus on words
// ─────────────────────────────────────────────────────────
const PageSessionA = () => (
  <div className="ai" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <SessionHeader now={4} planned={6} />
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', overflow: 'hidden' }}>
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 18, overflow: 'auto' }}>
        <div className="eyebrow" style={{ textAlign: 'center' }}>· interview started · 14:02 ·</div>

        <BubblePair side="ai" name="AI Interviewer" body="Tell me about a project where you owned a decision that was unpopular with your team." />
        <BubblePair side="me" name="You" body="Last summer I made the call to ship our payments migration in two phases instead of one — most of the team wanted a clean cut-over. We were six weeks behind on the original plan." duration="0:54" />
        <BubblePair side="ai" name="AI Interviewer" body="What signal made you confident it was the right trade-off? Walk me through what you weighed." />
        <BubblePair side="me" name="You" body="Two things. We had a customer cohort already on the new rails, and incident frequency had dropped 40% in that group. Cutting over the rest at once would re-introduce risk we'd already burned down." duration="1:08" />

        {/* Current Q + composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
          <BubblePair side="ai" name="AI Interviewer · Q4" body="Describe a time you had to influence a more senior engineer without authority — how did you bring them around?" highlight />
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--ink-900)', color: 'var(--surface)', borderColor: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="rec-dot" />
              <span className="mono" style={{ fontSize: 11, color: 'oklch(0.85 0.012 78)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recording · 0:42</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'oklch(0.7 0.012 78)' }}>0:42 / 3:00</span>
            </div>
            <Wave bars={70} max={28} seed={5} color="var(--acc)" style={{ width: '100%', justifyContent: 'space-between' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button kind="danger" icon="stop" size="lg">Stop &amp; submit</Button>
              <button className="btn btn--icon" style={{ background: 'oklch(1 0 0 / 0.08)', color: 'var(--surface)' }}><Icon name="pause" size={15} /></button>
              <button className="btn btn--icon" style={{ background: 'oklch(1 0 0 / 0.08)', color: 'var(--surface)' }}><Icon name="close" size={15} /></button>
              <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'oklch(0.78 0.012 78)' }}>
                <Icon name="mic" size={14} />
                <span className="micro" style={{ color: 'inherit' }}>MacBook Pro Microphone</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 28 }} />
      </div>
    </div>
  </div>
);

const BubblePair = ({ side, name, body, duration, highlight }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: side === 'me' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
    <div className="micro" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: side === 'me' ? 0 : 2, paddingRight: side === 'me' ? 2 : 0, justifyContent: side === 'me' ? 'flex-end' : 'flex-start' }}>
      {side === 'ai' && <Avatar name="AI" tone="b" size="sm" />}
      <span style={{ fontWeight: 500, color: 'var(--ink-700)' }}>{name}</span>
      {duration && <span className="mono" style={{ color: 'var(--ink-500)' }}>· spoken · {duration}</span>}
    </div>
    <div className={`bubble bubble--${side === 'me' ? 'me' : 'ai'}`} style={{
      fontSize: highlight ? 17 : 14,
      lineHeight: 1.55,
      padding: highlight ? '16px 18px' : '12px 14px',
      borderColor: highlight ? 'var(--acc)' : undefined,
      boxShadow: highlight ? '0 0 0 4px var(--acc-soft)' : 'none',
      letterSpacing: highlight ? '-0.015em' : '-0.005em',
      fontWeight: highlight ? 500 : 400,
    }}>{body}</div>
  </div>
);

// ─────────────────────────────────────────────────────────
// B · Focus mode — dark inverted, large waveform, minimal text
// ─────────────────────────────────────────────────────────
const PageSessionB = () => (
  <div className="ai" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--ink-900)', color: 'var(--surface)' }}>
    <SessionHeader now={4} planned={6} dark />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 24px 0', overflow: 'hidden', minHeight: 0 }}>
      {/* Transcript strip */}
      <div style={{ width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto', paddingBottom: 12, opacity: 0.8 }}>
        {[
          ['AI', 'Tell me about a project where you owned a decision that was unpopular with your team.'],
          ['You', 'Last summer I made the call to ship our payments migration in two phases…'],
          ['AI', 'What signal made you confident it was the right trade-off?'],
          ['You', 'Two things. We had a customer cohort already on the new rails…'],
        ].map(([who, what], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 14, alignItems: 'baseline' }}>
            <span className="mono" style={{ fontSize: 11, color: who === 'AI' ? 'var(--acc)' : 'oklch(0.78 0.012 78)' }}>{who.toUpperCase()}</span>
            <span style={{ fontSize: 13.5, color: 'oklch(0.85 0.012 78)', lineHeight: 1.5 }}>{what}</span>
          </div>
        ))}
      </div>

      {/* Question + stage */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, width: '100%', maxWidth: 900, paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Chip style={{ background: 'oklch(0.74 0.13 78 / 0.18)', color: 'var(--acc)', borderColor: 'oklch(0.74 0.13 78 / 0.25)' }}>Question 4 of est. 6</Chip>
          <Chip style={{ background: 'oklch(1 0 0 / 0.06)', color: 'oklch(0.85 0.012 78)', borderColor: 'oklch(1 0 0 / 0.1)' }}>Influence axis</Chip>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.2, textAlign: 'center', maxWidth: 760, textWrap: 'balance', color: 'var(--surface)' }}>
          Describe a time you had to influence a more senior engineer without authority — how did you bring them around?
        </h2>

        {/* big waveform */}
        <div style={{ width: '100%', maxWidth: 720, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--acc)' }}>
          <Wave bars={88} max={100} seed={7} style={{ width: '100%', justifyContent: 'space-between' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="rec-dot" />
          <span className="mono" style={{ fontSize: 12, color: 'var(--surface)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Recording · 0:42</span>
          <span className="mono" style={{ fontSize: 12, color: 'oklch(0.7 0.012 78)' }}> / 3:00</span>
        </div>
      </div>

      {/* dock */}
      <div style={{ width: '100%', maxWidth: 720, padding: '18px 0 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn--icon btn--lg" style={{ width: 56, height: 56, borderRadius: '50%', background: 'oklch(1 0 0 / 0.06)', color: 'var(--surface)' }}><Icon name="skip" size={18} /></button>
        <div style={{ flex: 1 }}>
          <Button kind="accent" size="lg" block icon="stop" style={{ height: 56, fontSize: 15, borderRadius: 999 }}>Stop &amp; submit answer</Button>
        </div>
        <button className="btn btn--icon btn--lg" style={{ width: 56, height: 56, borderRadius: '50%', background: 'oklch(1 0 0 / 0.06)', color: 'var(--surface)' }}><Icon name="pause" size={18} /></button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// C · Split — transcript + rubric coverage rail
// ─────────────────────────────────────────────────────────
const PageSessionC = () => (
  <div className="ai" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <SessionHeader now={4} planned={6} />
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 0 }}>
      {/* Conversation */}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
        <BubblePair side="ai" name="AI Interviewer" body="Tell me about a project where you owned a decision that was unpopular with your team." />
        <BubblePair side="me" name="You" body="Last summer I made the call to ship our payments migration in two phases instead of one — most of the team wanted a clean cut-over." duration="0:54" />
        <BubblePair side="ai" name="AI Interviewer" body="What signal made you confident it was the right trade-off?" />
        <BubblePair side="me" name="You" body="Two things. A cohort was already on the new rails and incidents dropped 40%." duration="0:48" />

        {/* divider + AI thinking */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-500)' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-200)' }} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI is choosing Q4 · influence</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-200)' }} />
        </div>

        <BubblePair side="ai" name="AI Interviewer · Q4" highlight body="Describe a time you had to influence a more senior engineer without authority — how did you bring them around?" />

        {/* recorder dock */}
        <div className="card card--elev" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
          <button className="btn btn--accent btn--icon btn--lg" style={{ width: 48, height: 48, borderRadius: '50%' }}>
            <Icon name="mic" size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="small" style={{ color: 'var(--ink-700)', fontWeight: 500 }}>Hold to speak or tap to start</div>
            <div className="micro mono">MacBook Pro Microphone · level OK</div>
          </div>
          <Wave bars={36} max={20} color="var(--ink-300)" style={{ width: 140, justifyContent: 'space-between' }} />
          <span className="vr" style={{ height: 28 }} />
          <Button kind="quiet" size="sm" icon="pen">Type instead</Button>
        </div>
      </div>

      {/* Rubric rail */}
      <aside style={{ background: 'var(--surface)', borderLeft: '1px solid var(--ink-200)', padding: 22, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Live rubric · AI scoring</div>
          <div className="h3">Coverage so far</div>
        </div>
        {[
          ['Ownership', 0.85, 'strong'],
          ['Trade-offs', 0.7, 'covered'],
          ['Influence', 0.15, 'asking next'],
          ['Conflict', 0, 'pending'],
          ['Outcomes', 0.55, 'partial'],
          ['Self-awareness', 0.25, 'thin'],
        ].map(([name, val, state]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="small" style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{name}</span>
              <span className="micro" style={{ marginLeft: 'auto', color: state === 'asking next' ? 'var(--acc-deep)' : 'var(--ink-500)' }}>{state}</span>
            </div>
            <div className="bar" style={{ background: state === 'asking next' ? 'var(--acc-soft)' : 'var(--ink-200)' }}>
              <i style={{ width: `${val * 100}%`, background: state === 'asking next' ? 'var(--acc)' : 'var(--ink-900)' }} />
            </div>
          </div>
        ))}

        <div className="card card--flush" style={{ padding: 12, marginTop: 8 }}>
          <div className="micro upper" style={{ marginBottom: 6 }}>Why this question</div>
          <p className="small" style={{ color: 'var(--ink-700)' }}>
            Influence is the thinnest axis (15%) after three answers. The AI will likely ask one follow-up here, then move to conflict.
          </p>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Button kind="ghost" block icon="stop">Finish now &amp; score</Button>
          <div className="micro" style={{ textAlign: 'center', marginTop: 6 }}>You can end after Q3 — minimum reached.</div>
        </div>
      </aside>
    </div>
  </div>
);

Object.assign(window, { PageSessionA, PageSessionB, PageSessionC });
