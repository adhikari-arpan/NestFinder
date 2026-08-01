// Compact KPI tile for the admin dashboard's overview row.
export const StatTile = ({ label, value, colorVar }) => (
  <div className="card border border-(--border-color) px-4 py-3.5 text-center">
    <span
      className="block text-[0.65rem] font-bold tracking-wide uppercase"
      style={{ color: colorVar ? `var(${colorVar})` : "var(--text-light)" }}
    >
      {label}
    </span>
    <strong
      className="mt-1 block text-[1.35rem]"
      style={{ color: colorVar ? `var(${colorVar})` : "var(--text-main)" }}
    >
      {value}
    </strong>
  </div>
);
