// components.jsx — preview cards for the spec'd components.

const CompFrame = ({ title, kicker, children, style }) => (
  <div className="ai" style={{ width: '100%', height: '100%', padding: 24, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
    <div>
      {kicker && <div className="eyebrow" style={{ marginBottom: 4 }}>{kicker}</div>}
      <div className="h2" style={{ fontWeight: 500 }}>{title}</div>
    </div>
    {children}
  </div>
);

const CompSection = ({ label, children, cols = 'auto' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div className="micro upper">{label}</div>
    <div style={{ display: cols === 'auto' ? 'flex' : 'grid', gridTemplateColumns: cols, gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {children}
    </div>
  </div>
);

// ── Buttons ─────────────────────────────────────────────
const CompButton = () => (
  <CompFrame kicker="Component" title="Button">
    <CompSection label="Primary">
      <Button kind="primary" icon="sparkle">Start interview</Button>
      <Button kind="primary">Continue</Button>
      <Button kind="primary" size="sm">Save</Button>
      <Button kind="primary" size="lg" iconRight="arrow">Start now</Button>
    </CompSection>
    <CompSection label="Accent · used on voice flow">
      <Button kind="accent" icon="mic">Record answer</Button>
      <Button kind="accent" size="sm" icon="play">Play</Button>
    </CompSection>
    <CompSection label="Ghost & quiet">
      <Button kind="ghost" icon="upload">Import</Button>
      <Button kind="quiet">Cancel</Button>
      <Button kind="ghost" size="sm">Edit</Button>
    </CompSection>
    <CompSection label="Danger & disabled">
      <Button kind="danger" icon="stop">End session</Button>
      <button className="btn btn--primary" style={{ opacity: 0.45, pointerEvents: 'none' }}>Submit</button>
    </CompSection>
  </CompFrame>
);

// ── Inputs ──────────────────────────────────────────────
const CompInput = () => (
  <CompFrame kicker="Component" title="Input">
    <Field label="Template title">
      <Input value="Senior Frontend — Behavioral round" icon="pen" />
    </Field>
    <Field label="Search">
      <Input value="ownership questions" icon="search" focus />
    </Field>
    <Field label="Email" error hint="That email is already in use. Try signing in instead.">
      <Input value="maya@craft.io" error />
    </Field>
    <Field label="API key" optional>
      <Input value="••••••••••••" icon="settings" disabled suffix="hidden" />
    </Field>
    <Field label="Notes">
      <textarea className="textarea" rows="3" defaultValue="Focus on STAR framing. Push for measurable outcomes when missing." readOnly />
    </Field>
  </CompFrame>
);

// ── TemplateCard ────────────────────────────────────────
const TemplateCard = ({ title, author, category, likes, range, liked, hot }) => (
  <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Chip kind={category === 'Engineering' ? 'accent' : category === 'Product' ? 'ok' : null} dot>{category}</Chip>
      {hot && <span className="micro" style={{ color: 'var(--acc-deep)' }}>↑ trending</span>}
    </div>
    <div className="h3" style={{ fontWeight: 500, fontSize: 15.5, lineHeight: 1.3, letterSpacing: '-0.01em', textWrap: 'pretty' }}>{title}</div>
    <div className="small" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-600)' }}>
      <Avatar name={author.split(' ').map(s => s[0]).slice(0,2).join('')} size="sm" tone="b" />
      <span>{author}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 6, borderTop: '1px solid var(--ink-100)' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-600)' }}>{range}</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: liked ? 'var(--err)' : 'var(--ink-600)' }}>
        <Icon name="heart" size={13} stroke={liked ? 0 : 1.6} style={{ fill: liked ? 'currentColor' : 'none' }} />
        <span className="mono" style={{ fontSize: 11 }}>{likes}</span>
      </span>
    </div>
  </div>
);

const CompTemplateCard = () => (
  <CompFrame kicker="Component" title="TemplateCard">
    <div className="body">Compact card used in Discovery, profile, search results. Default · liked · trending states.</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 4 }}>
      <TemplateCard title="Behavioral round for senior IC engineers" author="Dilara Aksoy" category="Engineering" likes="412" range="6–8 Q" liked />
      <TemplateCard title="Product sense — 0→1 launch deep dive" author="Theo Brandt" category="Product" likes="318" range="5–7 Q" hot />
      <TemplateCard title="Staff design crit · portfolio walk" author="Sena Yıldız" category="Design" likes="201" range="4–6 Q" />
      <TemplateCard title="Founding engineer trial — values fit" author="Ravi Menon" category="Founder" likes="98" range="3–5 Q" />
    </div>
  </CompFrame>
);

// ── AudioRecorder ───────────────────────────────────────
const AudioRecorder = ({ state = 'idle' }) => {
  const label = {
    idle: 'Tap to record your answer',
    recording: 'Recording · 0:18',
    processing: 'Transcribing…',
    review: 'Answer captured · 1:24',
  }[state];

  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, background: state === 'recording' ? 'var(--ink-900)' : 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={state === 'recording' ? 'rec-dot' : ''}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: state === 'recording' ? 'var(--err)' :
                        state === 'review' ? 'var(--ok)' :
                        state === 'processing' ? 'var(--acc)' : 'var(--ink-300)',
          }} />
        <span className="mono" style={{ fontSize: 11, color: state === 'recording' ? 'var(--surface)' : 'var(--ink-600)', opacity: state === 'recording' ? 0.8 : 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: state === 'recording' ? 'var(--surface)' : 'var(--ink-500)', opacity: state === 'recording' ? 0.6 : 1 }}>
          {state === 'recording' ? '0:18 / 3:00' : state === 'review' ? '01:24' : '00:00'}
        </span>
      </div>
      <div style={{
        height: 56, borderRadius: 10,
        background: state === 'recording' ? 'oklch(1 0 0 / 0.06)' : 'var(--surface-2)',
        display: 'flex', alignItems: 'center', padding: '0 14px',
        color: state === 'recording' ? 'var(--surface)' : 'var(--ink-700)',
        overflow: 'hidden',
      }}>
        <Wave bars={48} max={32} seed={state === 'recording' ? 5 : 2}
          color={state === 'recording' ? 'var(--acc)' : 'var(--ink-400)'} style={{ width: '100%', justifyContent: 'space-between' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {state === 'idle' && (
          <>
            <Button kind="accent" icon="mic" size="lg" block>Record answer</Button>
          </>
        )}
        {state === 'recording' && (
          <>
            <Button kind="danger" icon="stop" size="lg" block>Stop</Button>
            <button className="btn btn--icon btn--ghost" style={{ background: 'oklch(1 0 0 / 0.08)', borderColor: 'oklch(1 0 0 / 0.16)', color: 'white' }}><Icon name="pause" size={15} /></button>
          </>
        )}
        {state === 'review' && (
          <>
            <Button kind="ghost" icon="play">Play back</Button>
            <Button kind="ghost" icon="mic">Re-record</Button>
            <Button kind="primary" iconRight="arrow" style={{ marginLeft: 'auto' }}>Submit</Button>
          </>
        )}
        {state === 'processing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-600)' }}>
            <span className="dotrow"><i className="dot is-now" /><i className="dot" /><i className="dot" /></span>
            <span className="small">Sending to speech service…</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CompAudioRecorder = () => (
  <CompFrame kicker="Component" title="AudioRecorder">
    <div className="body">Four states. Recording flips to inverted ink surface so it reads as "live" anywhere on a page.</div>
    <CompSection label="Idle">
      <div style={{ width: '100%' }}><AudioRecorder state="idle" /></div>
    </CompSection>
    <CompSection label="Recording">
      <div style={{ width: '100%' }}><AudioRecorder state="recording" /></div>
    </CompSection>
    <CompSection label="Review">
      <div style={{ width: '100%' }}><AudioRecorder state="review" /></div>
    </CompSection>
    <CompSection label="Processing">
      <div style={{ width: '100%' }}><AudioRecorder state="processing" /></div>
    </CompSection>
  </CompFrame>
);

// ── SessionProgress ─────────────────────────────────────
const SessionProgress = ({ now = 3, planned = 6, min = 3, max = 12 }) => {
  const dots = [];
  for (let i = 0; i < max; i++) {
    let cls = 'dot';
    if (i < now - 1) cls += ' is-done';
    else if (i === now - 1) cls += ' is-now';
    dots.push(<i key={i} className={cls} />);
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-900)', fontWeight: 500 }}>Q{now}</span>
        <span className="micro">of est. {planned}</span>
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-500)' }}>{min}–{max} range</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, position: 'relative' }}>
        {dots.map((d, i) => (
          <React.Fragment key={i}>
            {d}
            {i === min - 1 && <span style={{ width: 1, height: 14, background: 'var(--ink-300)', marginLeft: 2, marginRight: 2 }} />}
          </React.Fragment>
        ))}
      </div>
      <div className="micro" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>AI may end after Q{min}</span>
        <span>Hard cap Q{max}</span>
      </div>
    </div>
  );
};

const CompSessionProgress = () => (
  <CompFrame kicker="Component" title="SessionProgress">
    <div className="body">Adaptive count made visible: filled dots = answered, ring dot = active, the small notch marks the AI's earliest finish point.</div>
    <CompSection label="Just started">
      <div style={{ width: '100%' }}><SessionProgress now={1} planned={6} /></div>
    </CompSection>
    <CompSection label="Mid session">
      <div style={{ width: '100%' }}><SessionProgress now={4} planned={6} /></div>
    </CompSection>
    <CompSection label="Past minimum — AI could finish">
      <div style={{ width: '100%' }}><SessionProgress now={5} planned={6} /></div>
    </CompSection>
    <CompSection label="At hard cap">
      <div style={{ width: '100%' }}><SessionProgress now={12} planned={6} /></div>
    </CompSection>
  </CompFrame>
);

// ── ResultSummary ───────────────────────────────────────
const ResultSummary = ({ score = 78, completion = 'ai_completed' }) => {
  const reasonLabel = {
    ai_completed: 'AI completed',
    user_stopped: 'You ended early',
    failed: 'Could not score',
  }[completion];
  return (
    <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="gauge" style={{ '--p': score / 100 }}>
          <span className="gauge__val">{score}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Overall</div>
          <div className="h1" style={{ fontWeight: 500 }}>Solid signal, room to land outcomes</div>
          <div className="small" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Chip kind={completion === 'user_stopped' ? null : 'ok'} dot>{reasonLabel}</Chip>
            <span className="micro">7 questions · 11m 32s</span>
          </div>
        </div>
      </div>
      <div className="hr" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div className="micro upper" style={{ color: 'var(--ok)', marginBottom: 8 }}>Strengths</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li className="body" style={{ paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />
              Clear STAR framing — every answer had a situation, action, and named outcome.
            </li>
            <li className="body" style={{ paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />
              Strong ownership signal — used "I decided" 6× vs. "we" 3× in trade-off questions.
            </li>
          </ul>
        </div>
        <div>
          <div className="micro upper" style={{ color: 'var(--err)', marginBottom: 8 }}>Improve</div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li className="body" style={{ paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--err)' }} />
              Outcomes lacked measurement in 3 of 7 answers — add a number or a comparison.
            </li>
            <li className="body" style={{ paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--err)' }} />
              Conflict story drifted — practice landing the resolution within 60s.
            </li>
          </ul>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button kind="primary" icon="play">Try again</Button>
        <Button kind="ghost" icon="book">View transcript</Button>
        <Button kind="quiet" icon="download" style={{ marginLeft: 'auto' }}>Export</Button>
      </div>
    </div>
  );
};

const CompResultSummary = () => (
  <CompFrame kicker="Component" title="ResultSummary">
    <div className="body">Used at the top of every Result page. Score gauge, completion reason, strengths & improvements, action row.</div>
    <ResultSummary score={78} completion="ai_completed" />
  </CompFrame>
);

Object.assign(window, {
  CompButton, CompInput, CompTemplateCard, CompAudioRecorder, CompSessionProgress, CompResultSummary,
  TemplateCard, AudioRecorder, SessionProgress, ResultSummary,
});
