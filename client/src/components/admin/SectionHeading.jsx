export const SectionHeading = ({ children, subtitle, icon: Icon }) => (
  <div className="mb-8 flex items-start gap-3">
    {/* Accent bar */}
    <div className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)]" />
    <div>
      <h2 className="flex items-center gap-2 text-[1.35rem] font-extrabold tracking-tight text-[var(--text-main)] m-0">
        {Icon && <Icon size={20} className="text-[var(--primary)]" />}
        {children}
      </h2>
      {subtitle && (
        <p className="mt-1 text-[0.82rem] text-[var(--text-light)] m-0">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);