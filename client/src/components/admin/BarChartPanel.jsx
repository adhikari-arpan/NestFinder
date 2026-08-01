// Minimal horizontal bar chart + donut for admin analytics — no charting
// library, each bar is directly labeled so it never depends on color alone.
export const BarChartPanel = ({ title, icon: Icon, data, emptyLabel = "No data yet." }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // --- Donut geometry ---
  const R = 40;                    // radius
  const C = 2 * Math.PI * R;       // circumference
  let offset = 0;                  // running start position for each segment

  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const frac = total > 0 ? d.value / total : 0;
      const seg = {
        ...d,
        dash: frac * C,
        offset: offset,
      };
      offset += frac * C;
      return seg;
    });

  return (
    <div className="card border border-white/10 p-6 transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] text-white shadow-sm">
              <Icon size={16} />
            </span>
          )}
          <h3 className="text-[0.95rem] font-bold text-(--text-main)">{title}</h3>
        </div>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-[0.85rem] text-(--text-light)">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex items-center gap-6">
          {/* Left: bars */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {data.map((d) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-(--text-main)">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: `var(${d.colorVar})` }}
                      />
                      {d.label}
                    </span>
                    <span className="text-[0.78rem] font-bold text-(--text-main)">
                      {d.value}
                      <span className="ml-1 font-medium text-(--text-light)">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(d.value / max) * 100}%`,
                        background: `linear-gradient(90deg, var(${d.colorVar}), color-mix(in srgb, var(${d.colorVar}) 65%, white))`,
                        boxShadow: `0 0 8px color-mix(in srgb, var(${d.colorVar}) 40%, transparent)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: donut chart */}
          <div className="relative hidden shrink-0 sm:block">
            <svg width="120" height="120" viewBox="0 0 100 100">
              {/* Track ring */}
              <circle
                cx="50" cy="50" r={R}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="12"
              />
              {/* Segments */}
              {segments.map((s) => (
                <circle
                  key={s.label}
                  cx="50" cy="50" r={R}
                  fill="none"
                  stroke={`var(${s.colorVar})`}
                  strokeWidth="12"
                  strokeDasharray={`${s.dash} ${C - s.dash}`}
                  strokeDashoffset={-s.offset}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dasharray 700ms ease-out" }}
                />
              ))}
            </svg>
            {/* Center total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-[1.35rem] leading-none font-extrabold text-(--text-main)">
                {total}
              </strong>
              <span className="mt-0.5 text-[0.6rem] font-bold tracking-wider uppercase text-(--text-light)">
                Total
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};