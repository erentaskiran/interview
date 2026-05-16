// app.jsx — assembles all artboards into a DesignCanvas.

const App = () => {
  // Width helpers
  const PAGE_W = 1280;
  const PAGE_H = 800;

  return (
    <DesignCanvas>
      {/* ─────────── Brand & Intro ─────────── */}
      <DCSection id="brand" title="AInterview · Design language" subtitle="Soft tech · warm neutrals · mustard accent · voice-first runtime">
        <DCArtboard id="intro" label="00 · Read me first" width={520} height={360}>
          <div className="ai" style={{ width: '100%', height: '100%', padding: 32, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Wordmark size={20} />
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>MVP design pack</div>
              <div className="h1" style={{ fontWeight: 500, lineHeight: 1.15 }}>A calm, voice-first interview runtime — built around an AI that decides when it has heard enough.</div>
            </div>
            <p className="body">
              Below: the design tokens, the six spec'd components, the seven core pages, then three variations each for the two screens that earn the product — Interview Session and Result. States gallery closes the pack.
            </p>
            <div className="hr" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <span className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--acc)' }} />Geist + Geist Mono</span>
              <span className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-900)' }} />Cream surface · ink-warm-black</span>
              <span className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Mustard accent only on voice flow</span>
              <span className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--err)' }} />Live recording = inverted ink</span>
            </div>
            <div className="mono micro" style={{ marginTop: 'auto', color: 'var(--ink-500)' }}>arrow keys navigate · click any card to focus</div>
          </div>
        </DCArtboard>

        <DCArtboard id="brand" label="Wordmark" width={400} height={360}>
          <BrandCard />
        </DCArtboard>
      </DCSection>

      {/* ─────────── Tokens ─────────── */}
      <DCSection id="tokens" title="Design tokens" subtitle="Colors · type · spacing · radius · shadows">
        <DCArtboard id="colors"  label="Colors"        width={620} height={520}><TokensColor /></DCArtboard>
        <DCArtboard id="type"    label="Typography"    width={620} height={520}><TokensType /></DCArtboard>
        <DCArtboard id="spacing" label="Spacing"       width={400} height={520}><TokensSpacing /></DCArtboard>
        <DCArtboard id="radius"  label="Radius"        width={400} height={340}><TokensRadius /></DCArtboard>
        <DCArtboard id="shadow"  label="Elevation"     width={620} height={340}><TokensShadow /></DCArtboard>
      </DCSection>

      {/* ─────────── Components ─────────── */}
      <DCSection id="components" title="Components" subtitle="The six in the spec, plus the chip & avatar primitives they lean on">
        <DCArtboard id="btn"   label="Button"          width={440} height={400}><CompButton /></DCArtboard>
        <DCArtboard id="input" label="Input"           width={440} height={520}><CompInput /></DCArtboard>
        <DCArtboard id="tplc"  label="TemplateCard"    width={620} height={400}><CompTemplateCard /></DCArtboard>
        <DCArtboard id="aud"   label="AudioRecorder"   width={520} height={680}><CompAudioRecorder /></DCArtboard>
        <DCArtboard id="prog"  label="SessionProgress" width={520} height={420}><CompSessionProgress /></DCArtboard>
        <DCArtboard id="res"   label="ResultSummary"   width={620} height={440}><CompResultSummary /></DCArtboard>
      </DCSection>

      {/* ─────────── Core pages ─────────── */}
      <DCSection id="pages" title="Core pages" subtitle="Login/Register · Discovery · Template Detail · Create · Profile">
        <DCArtboard id="auth-login"    label="01 · Sign in"          width={PAGE_W} height={PAGE_H}><PageAuth mode="login" /></DCArtboard>
        <DCArtboard id="auth-register" label="01 · Create account"   width={PAGE_W} height={PAGE_H}><PageAuth mode="register" /></DCArtboard>
        <DCArtboard id="discovery"     label="02 · Discovery"        width={PAGE_W} height={PAGE_H}><PageDiscovery /></DCArtboard>
        <DCArtboard id="detail"        label="03 · Template detail"  width={PAGE_W} height={PAGE_H}><PageTemplateDetail /></DCArtboard>
        <DCArtboard id="create"        label="04 · Create template"  width={PAGE_W} height={PAGE_H}><PageCreate /></DCArtboard>
        <DCArtboard id="profile"       label="07 · Profile"          width={PAGE_W} height={PAGE_H}><PageProfile /></DCArtboard>
      </DCSection>

      {/* ─────────── Interview Session — 3 variations ─────────── */}
      <DCSection id="session" title="Interview Session · variations" subtitle="All conversation-style. Pick one, or mix bits.">
        <DCArtboard id="sess-a" label="A · Calm transcript"     width={PAGE_W} height={PAGE_H}><PageSessionA /></DCArtboard>
        <DCArtboard id="sess-b" label="B · Focus mode (dark)"   width={PAGE_W} height={PAGE_H}><PageSessionB /></DCArtboard>
        <DCArtboard id="sess-c" label="C · Split + live rubric" width={PAGE_W} height={PAGE_H}><PageSessionC /></DCArtboard>
      </DCSection>

      {/* ─────────── Result — 3 variations ─────────── */}
      <DCSection id="result" title="Result · variations" subtitle="Strengths/weakness emphasis per spec, three reads">
        <DCArtboard id="res-a" label="A · Editorial summary"  width={PAGE_W} height={PAGE_H}><PageResultA /></DCArtboard>
        <DCArtboard id="res-b" label="B · Rubric breakdown"   width={PAGE_W} height={PAGE_H}><PageResultB /></DCArtboard>
        <DCArtboard id="res-c" label="C · Coach (ended early)" width={PAGE_W} height={PAGE_H}><PageResultC /></DCArtboard>
      </DCSection>

      {/* ─────────── States ─────────── */}
      <DCSection id="states" title="States" subtitle="Loading · Empty · Error · Mobile">
        <DCArtboard id="loading" label="Loading" width={540} height={620}><StateLoading /></DCArtboard>
        <DCArtboard id="empty"   label="Empty"   width={540} height={580}><StateEmpty /></DCArtboard>
        <DCArtboard id="error"   label="Error"   width={540} height={680}><StateError /></DCArtboard>
        <DCArtboard id="mobile"  label="Mobile behavior" width={620} height={620}><StateMobile /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
