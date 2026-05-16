// pages-result.jsx — three variations of the Result screen.

// ─────────────────────────────────────────────────────────
// A · Editorial summary — strengths/weakness text-heavy, hero gauge
// ─────────────────────────────────────────────────────────
const PageResultA = () => (
  <div className="ai page">
    <Sidebar active="sessions" />
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar crumb={['Sessions', 'Behavioral round · 24 May']} actions={<><Button kind="ghost" size="sm" icon="download">Export</Button><Button kind="primary" size="sm" icon="play">Try again</Button></>} />
      <div className="main main--scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
          {/* Header */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Result · session complete</div>
            <h1 className="h-display" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', textWrap: 'balance', maxWidth: 720 }}>
              Solid signal, room to <span style={{ color: 'var(--acc-deep)' }}>land outcomes</span>.
            </h1>
            <div className="body" style={{ marginTop: 10, maxWidth: 620 }}>
              You ran 7 questions across 6 rubric axes. The AI ended after Q7 — it had enough signal on ownership and trade-offs, but flagged outcomes and conflict as thinner. Below is a read of what came through and what to sharpen next.
            </div>
          </div>

          {/* Hero card */}
          <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '120px 1fr auto', alignItems: 'center', gap: 24 }}>
            <div className="gauge" style={{ width: 120, height: 120, '--p': 0.78 }}>
              <span className="gauge__val" style={{ fontSize: 28 }}>78</span>
            </div>
            <div>
              <div className="h2" style={{ fontWeight: 500 }}>Senior-IC tier · strong behavioral fit</div>
              <div className="body" style={{ marginTop: 6 }}>
                Above the 70-band threshold for senior IC behavioral rounds. Your ownership and influence signal was the strongest the AI's seen in this template this week.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip kind="ok" dot>AI completed</Chip>
                <Chip dot>7 questions</Chip>
                <Chip dot>11m 32s</Chip>
                <Chip dot>Behavioral · senior IC</Chip>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', minWidth: 110 }}>
              <span className="micro upper">vs last run</span>
              <span className="mono" style={{ fontSize: 18, color: 'var(--ok)', fontWeight: 500 }}>+6</span>
              <span className="micro">from 72 on 14 May</span>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <div className="micro upper" style={{ color: 'var(--ok)', marginBottom: 10 }}>What landed</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Clear STAR framing', 'Every answer had a situation, action, and named outcome. The AI never had to ask "what did you actually do".'],
                ['Strong ownership signal', 'Used "I decided" 6× vs. "we" 3× in trade-off questions — the verb pattern senior interviewers listen for.'],
                ['Concrete numbers', 'You quoted incident drop (40%) and cohort size — specifics carry more weight than adjectives.'],
                ['Calm under follow-up', 'When the AI pushed on the conflict story, you didn\'t backfill — you held the original framing.'],
              ].map(([t, b]) => (
                <div key={t} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--ok-soft)', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: 2 }}>
                      <Icon name="check" size={13} stroke={2.4} />
                    </span>
                    <div>
                      <div className="h3" style={{ marginBottom: 4 }}>{t}</div>
                      <p className="body">{b}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improve */}
          <div>
            <div className="micro upper" style={{ color: 'var(--err)', marginBottom: 10 }}>What to sharpen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Outcomes missed measurement', 'In 3 of 7 answers you described impact qualitatively ("the team felt better"). Add a number, a duration, or a before/after.', 'Practice "what changed by how much"'],
                ['Conflict story drifted', 'The Q5 answer started with a vendor dispute and ended on a re-org. Land the resolution within ~60s before moving on.', 'Re-run Q5 with a 60-second timer'],
                ['Self-awareness was thin', 'The AI only saw one moment of self-critique. Senior rounds expect at least two — one in success, one in failure.', 'Try the "what would past-me do differently" prompt'],
              ].map(([t, b, cta]) => (
                <div key={t} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--err-soft)', color: 'var(--err)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: 2 }}>
                      <Icon name="bolt" size={13} stroke={2.4} />
                    </span>
                    <div>
                      <div className="h3" style={{ marginBottom: 4 }}>{t}</div>
                      <p className="body">{b}</p>
                    </div>
                  </div>
                  <Button kind="ghost" size="sm" icon="arrow" style={{ alignSelf: 'flex-start' }}>{cta}</Button>
                </div>
              ))}
            </div>
          </div>

          <div className="card card--flush" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Icon name="sparkle" size={18} style={{ color: 'var(--acc-deep)' }} />
            <span className="body" style={{ color: 'var(--ink-800)' }}>The AI built a 3-question follow-up rubric focused on outcomes & conflict. Run it next?</span>
            <Button kind="primary" size="sm" icon="play" style={{ marginLeft: 'auto' }}>Run follow-up</Button>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="micro upper" style={{ marginBottom: 12 }}>Rubric axes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Ownership', 92, 'var(--ok)'],
                ['Trade-offs', 84, 'var(--ok)'],
                ['Influence', 78, 'var(--ok)'],
                ['Conflict', 58, 'var(--warn)'],
                ['Outcomes', 64, 'var(--warn)'],
                ['Self-awareness', 48, 'var(--err)'],
              ].map(([n, v, c]) => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="small" style={{ fontWeight: 500 }}>{n}</span>
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: c, fontWeight: 500 }}>{v}</span>
                  </div>
                  <div className="bar" style={{ height: 5 }}><i style={{ width: `${v}%`, background: c }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="micro upper" style={{ marginBottom: 10 }}>Session</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Template', 'Behavioral round'], ['Run by', 'You'], ['Started', '24 May · 14:02'], ['Finished by', 'AI'], ['Duration', '11m 32s']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12 }}>
                  <span className="small" style={{ color: 'var(--ink-500)', minWidth: 80 }}>{k}</span>
                  <span className="small" style={{ color: 'var(--ink-900)', textAlign: 'right', marginLeft: 'auto' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="hr" style={{ margin: '12px 0' }} />
            <Button kind="ghost" block icon="book" size="sm">View full transcript</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// B · Rubric breakdown — chart-forward
// ─────────────────────────────────────────────────────────
const PageResultB = () => {
  const axes = [
    { n: 'Ownership', v: 92 },
    { n: 'Trade-offs', v: 84 },
    { n: 'Influence', v: 78 },
    { n: 'Outcomes', v: 64 },
    { n: 'Conflict', v: 58 },
    { n: 'Self-awareness', v: 48 },
  ];
  return (
    <div className="ai page">
      <Sidebar active="sessions" />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar crumb={['Sessions', 'Behavioral round · 24 May']} actions={<><Button kind="ghost" size="sm" icon="download">Export</Button><Button kind="primary" size="sm" icon="play">Try again</Button></>} />
        <div className="main main--scroll" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22 }}>
            <div className="gauge" style={{ width: 140, height: 140, '--p': 0.78 }}>
              <span className="gauge__val" style={{ fontSize: 34 }}>78</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Rubric breakdown · 7 questions</div>
              <div className="h1" style={{ fontWeight: 500 }}>Strong on ownership. Thin on self-awareness.</div>
              <div className="small" style={{ marginTop: 6 }}>Hover any axis row to see the answer that moved it most.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Chip kind="ok" dot>AI completed</Chip>
              <Chip dot>+6 vs last run</Chip>
            </div>
          </div>

          {/* Combined bar table */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px 1fr', gap: 18, alignItems: 'center' }}>
              <span className="micro upper">Axis</span>
              <span className="micro upper">Coverage</span>
              <span className="micro upper" style={{ textAlign: 'right' }}>Score</span>
              <span className="micro upper">Strongest moment</span>
              {axes.map((a, i) => (
                <React.Fragment key={a.n}>
                  <span className="small" style={{ fontWeight: 500 }}>{a.n}</span>
                  <div className="bar" style={{ height: 10, borderRadius: 999 }}>
                    <i style={{ width: `${a.v}%`, background: a.v >= 75 ? 'var(--ink-900)' : a.v >= 60 ? 'var(--acc)' : 'var(--err)' }} />
                  </div>
                  <span className="mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 500 }}>{a.v}</span>
                  <span className="small" style={{ color: 'var(--ink-700)' }}>{[
                    '"I owned the call to phase the migration"',
                    '"Cohort already on new rails, 40% drop"',
                    '"Brought the staff eng around by sharing trace data"',
                    '"Team morale went up" — qualitative only',
                    'Vendor dispute · drifted to re-org',
                    'Only one self-critique across 7 Q',
                  ][i]}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Two-up: timeline + recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="h3" style={{ marginBottom: 14 }}>Question-by-question</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Q1', 'Ownership', 88, '1:24'],
                  ['Q2', 'Trade-offs', 84, '1:08'],
                  ['Q3', 'Trade-offs', 80, '0:54'],
                  ['Q4', 'Influence', 78, '1:42'],
                  ['Q5', 'Conflict', 58, '2:01'],
                  ['Q6', 'Outcomes', 64, '1:18'],
                  ['Q7', 'Self-awareness', 48, '0:58'],
                ].map(([q, ax, sc, dur]) => (
                  <div key={q} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 90px 40px 56px', gap: 12, alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{q}</span>
                    <span className="small" style={{ color: 'var(--ink-800)' }}>{ax}</span>
                    <div className="bar" style={{ height: 4 }}><i style={{ width: `${sc}%`, background: sc >= 75 ? 'var(--ink-900)' : sc >= 60 ? 'var(--acc)' : 'var(--err)' }} /></div>
                    <span className="mono" style={{ fontSize: 11.5, textAlign: 'right', color: sc >= 75 ? 'var(--ink-900)' : sc >= 60 ? 'var(--acc-deep)' : 'var(--err)', fontWeight: 500 }}>{sc}</span>
                    <span className="mono micro" style={{ textAlign: 'right' }}>{dur}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="h3">Recommended drills</div>
              {[
                ['Outcome quantification', '5 prompts · 8 min', 'var(--warn)'],
                ['Conflict resolution arc', '4 prompts · 6 min', 'var(--err)'],
                ['Self-awareness · failure stories', '3 prompts · 5 min', 'var(--err)'],
              ].map(([t, d, c]) => (
                <div key={t} className="card card--flush" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="small" style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{t}</div>
                    <div className="micro">{d}</div>
                  </div>
                  <Button kind="ghost" size="sm" iconRight="arrow">Run</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// C · Coach feedback — single column, conversational, "ended early"
// ─────────────────────────────────────────────────────────
const PageResultC = () => (
  <div className="ai page">
    <Sidebar active="sessions" />
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar crumb={['Sessions', 'Behavioral round · 24 May']} actions={<><Button kind="ghost" size="sm" icon="download">Export</Button><Button kind="primary" size="sm" icon="play">Try again</Button></>} />
      <div className="main main--scroll">
        <div style={{ maxWidth: 720, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Header */}
          <div>
            <Chip kind="accent" dot style={{ marginBottom: 12 }}>You ended early · 3 of est. 6</Chip>
            <h1 className="h-display" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', textWrap: 'balance' }}>
              You stopped early — here's what the AI saw in the three answers you gave.
            </h1>
            <div className="body" style={{ marginTop: 10 }}>
              Partial scoring. The signal across ownership and trade-offs was already strong; the rest is a coach's read on what to do next, not a final grade.
            </div>
          </div>

          {/* Coach bubble */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar name="AI" tone="b" />
            <div className="bubble bubble--ai" style={{ maxWidth: '100%', borderTopLeftRadius: 4, padding: '14px 16px' }}>
              <div className="micro" style={{ marginBottom: 4, color: 'var(--ink-600)' }}>AI Coach</div>
              <p className="body" style={{ color: 'var(--ink-900)' }}>
                You opened strong. The phased-migration story was specific, owned, and quantified — that's the kind of answer that lands in a real senior round. The reason I'd push back on stopping here: I never got to see how you handle conflict or how you talk about your own mistakes. Those are the two axes that swing senior decisions.
              </p>
            </div>
          </div>

          {/* Mini gauge */}
          <div className="card" style={{ padding: 18, display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 18 }}>
            <div className="gauge" style={{ width: 76, height: 76, '--p': 0.62 }}>
              <span className="gauge__val" style={{ fontSize: 18 }}>62</span>
            </div>
            <div>
              <div className="h3" style={{ marginBottom: 4 }}>Partial score · 2 of 6 axes</div>
              <div className="small">Based on 3 questions. Not comparable to full runs — it's a soft signal, not a verdict.</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <Chip kind="ok" dot>Ownership · 92</Chip>
                <Chip kind="ok" dot>Trade-offs · 84</Chip>
                <Chip dot>Influence · 0</Chip>
                <Chip dot>Conflict · 0</Chip>
                <Chip dot>Outcomes · 0</Chip>
                <Chip dot>Self-awareness · 0</Chip>
              </div>
            </div>
          </div>

          {/* Sections */}
          {[
            { eyebrow: 'What landed', tone: 'ok', items: [
              ['Phasing the migration', 'You named the call, your reasoning, and a measurable outcome (40% incident drop). Senior interviewers will play that back to you.'],
              ['No hedging', 'You said "I decided" without softening it. Confident verbs make ownership read clearly.'],
            ] },
            { eyebrow: 'Where I lost signal', tone: 'err', items: [
              ['Conflict — unseen', "Three answers didn't have conflict in them. Try the next session with a story you'd avoid telling first."],
              ['Self-awareness — unseen', 'Same — no failure or "I\'d do this differently" came up. Worth practicing.'],
            ] },
            { eyebrow: 'Try this next', tone: 'acc', items: [
              ['Re-run on the missing axes', 'A short follow-up rubric of 3 questions covering conflict, outcomes, and self-awareness.'],
              ['Practice the 60-second close', 'Your trade-off answers ran past 90s. Try landing them in one minute flat.'],
            ] },
          ].map(sec => (
            <div key={sec.eyebrow}>
              <div className="micro upper" style={{
                color: sec.tone === 'ok' ? 'var(--ok)' : sec.tone === 'err' ? 'var(--err)' : 'var(--acc-deep)',
                marginBottom: 10,
              }}>{sec.eyebrow}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sec.items.map(([t, b]) => (
                  <div key={t} className="card" style={{ padding: 16, display: 'flex', gap: 12 }}>
                    <span style={{
                      width: 6, alignSelf: 'stretch', borderRadius: 3,
                      background: sec.tone === 'ok' ? 'var(--ok)' : sec.tone === 'err' ? 'var(--err)' : 'var(--acc)',
                      flex: '0 0 auto',
                    }} />
                    <div>
                      <div className="h3" style={{ marginBottom: 4 }}>{t}</div>
                      <p className="body">{b}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, paddingTop: 6, paddingBottom: 16 }}>
            <Button kind="primary" size="lg" icon="play">Run 3-question follow-up</Button>
            <Button kind="ghost" size="lg" icon="book">View transcript</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { PageResultA, PageResultB, PageResultC });
