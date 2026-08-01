// Compact KPI tile for the admin dashboard's overview row.
export const StatTile = ({ label, value, colorVar, icon: Icon }) => {
  const accent = colorVar ? `var(${colorVar})` : "var(--primary)";
  return (
    <div
      className="card relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ padding: "0.875rem 1rem" }}
    >
      {/* Accent strip along the top */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: accent }}
      />

      <div className="flex items-center justify-between gap-3">
        {/* Left: icon + label */}
        <div className="flex min-w-0 items-center gap-1.5">
          {Icon && (
            <Icon
              size={14}
              style={{ color: accent }}
              className="shrink-0 opacity-70"
            />
          )}
          <span className="block truncate text-[0.65rem] font-bold tracking-wider uppercase text-(--text-light)">
            {label}
          </span>
        </div>

        {/* Right: the number */}
        <strong
          className="shrink-0 text-[1.5rem] leading-none font-extrabold"
          style={{ color: colorVar ? `var(${colorVar})` : "var(--text-main)" }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
};