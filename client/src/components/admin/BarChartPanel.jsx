// Minimal horizontal bar chart for admin analytics — no charting library,
// each bar is directly labeled so it never depends on color alone.
export const BarChartPanel = ({ title, data, emptyLabel = "No data yet." }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="card border border-(--border-color) p-5">
      <h3 className="mb-4 text-[0.95rem] font-bold text-(--text-main)">
        {title}
      </h3>
      {total === 0 ? (
        <p className="py-6 text-center text-[0.85rem] text-(--text-light)">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-[0.78rem] font-medium text-(--text-muted)">
                {d.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-(--bg-app)">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(d.value / max) * 100}%`,
                    backgroundColor: `var(${d.colorVar})`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-[0.8rem] font-bold text-(--text-main)">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
