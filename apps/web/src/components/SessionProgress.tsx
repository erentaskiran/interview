export type SessionProgressProps = {
  current: number;
  plannedTotal: number;
  min?: number;
  max?: number;
};

export function SessionProgress({
  current,
  plannedTotal,
  min = 3,
  max = 12,
}: SessionProgressProps) {
  const dots = [];
  for (let i = 0; i < max; i++) {
    let cls = "dot";
    if (i < current - 1) cls += " is-done";
    else if (i === current - 1) cls += " is-now";
    dots.push(<i key={i} className={cls} />);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          className="mono"
          style={{ fontSize: 12, color: "var(--ink-900)", fontWeight: 500 }}
        >
          Q{current}
        </span>
        <span className="micro-text">of est. {plannedTotal}</span>
        <span
          className="mono"
          style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-500)" }}
        >
          {min}–{max} range
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
        {dots.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {d}
            {i === min - 1 && (
              <span
                style={{
                  width: 1,
                  height: 14,
                  background: "var(--ink-300)",
                  marginLeft: 2,
                  marginRight: 2,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div
        className="micro-text"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <span>AI may end after Q{min}</span>
        <span>Hard cap Q{max}</span>
      </div>
    </div>
  );
}
