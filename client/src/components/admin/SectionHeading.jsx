export const SectionHeading = ({ children, icon: Icon }) => (
  <div className="mb-10 flex items-center gap-4">
    {/* Icon chip */}
    {Icon && (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-(--primary) to-[#7c3aed] text-white shadow-md">
        <Icon size={18} />
      </span>
    )}

    <h2 className="m-0 shrink-0 text-[1.35rem] font-extrabold tracking-tight text-(--text-main)">
      {children}
    </h2>

    {/* Gradient rule filling the remaining width */}
    <div className="h-px flex-1 bg-linear-to-r from-(--primary)/40 via-white/10 to-transparent" />
  </div>
);
