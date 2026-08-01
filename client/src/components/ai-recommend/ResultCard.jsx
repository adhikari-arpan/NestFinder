import { Link } from "react-router-dom";
import { Sparkles, Check } from "lucide-react";

const BREAKDOWN_FIELDS = [
  { key: "semantic", label: "Semantic Fit" },
  { key: "budget", label: "Budget" },
  { key: "amenity", label: "Amenities" },
  { key: "proximity", label: "Proximity" },
  { key: "city", label: "City" },
  { key: "roomType", label: "Room Type" },
  { key: "sharing", label: "Sharing" },
];

export const ResultCard = ({ item, reasons }) => {
  return (
    <div className="card overflow-hidden rounded-lg) bg-(--bg-card) p-0 shadow-lg transition-all duration-300 hover:border-(--primary) hover:shadow-xl">
      <div className="grid h-full grid-cols-1 md:grid-cols-[350px_1fr]">
        {/* Image side */}
        <div className="relative h-62.5 overflow-hidden md:h-full">
          <img
            src={item.images[0]}
            className="size-full object-cover transition-transform duration-500 hover:scale-105"
            alt={item.title}
          />
          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border-2 border-white/20 bg-linear-to-r from-(--primary) to-[#7c3aed] px-4 py-2 text-[1rem] font-extrabold text-white shadow-lg">
            <Sparkles size={16} />
            {item.matchScore}% Match
          </div>
        </div>

        {/* Details side */}
        <div className="flex flex-col justify-between p-8">
          <div className="text-left">
            <div className="mb-2 flex items-start justify-between">
              <span className="rounded-full bg-(--primary-light) px-3 py-1 text-[0.8rem] font-bold tracking-wider text-(--primary) uppercase">
                {item.sharing} • {item.type}
              </span>
              <strong className="text-[1.4rem] font-extrabold text-(--text-main)">
                Rs. {item.price.toLocaleString("en-IN")}/mo
              </strong>
            </div>

            <h4 className="my-2 text-[1.5rem] leading-tight font-extrabold">
              <Link
                to={`/room/${item.id}`}
                className="text-(--text-main) transition-colors hover:text-(--primary)"
              >
                {item.title}
              </Link>
            </h4>
            <p className="mb-4 flex items-center gap-1 text-[0.95rem] text-(--text-muted)">
              📍 {item.location}
            </p>

            {/* Match Reasons - Rule Based Fallback Only */}
            {!item.breakdown && (
              <div className="mt-4 flex flex-col gap-3 rounded-md)] border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.05)] p-4">
                <strong className="text-[0.85rem] tracking-wider text-(--text-muted) uppercase">
                  Why it matches:
                </strong>
                {reasons.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${r.positive ? "text-(--secondary)" : "text-(--danger)"}`}
                  >
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white ${r.positive ? "bg-(--secondary)" : "bg-(--danger)"}`}
                    >
                      {r.positive ? <Check size={14} /> : "✕"}
                    </span>
                    <span className="text-[1.05rem] leading-snug font-medium">
                      {r.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI factor breakdown — only present when results came from Flask */}
          {item.breakdown && (
            <div className="mt-4 rounded-md) border border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.05)] p-4">
              <strong className="text-[0.85rem] tracking-wider text-(--text-muted) uppercase">
                AI Score Breakdown:
              </strong>
              <div className="mt-3 flex flex-col gap-2">
                {BREAKDOWN_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-[0.8rem] font-medium">
                      {f.label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--border-color)">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--secondary) transition-all duration-500"
                        style={{ width: `${item.breakdown[f.key]}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-[0.8rem] font-bold">
                      {item.breakdown[f.key]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end pt-6">
            <Link
              to={`/room/${item.id}`}
              className="btn btn-primary rounded-full px-8 py-3 text-[1.05rem] font-bold shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              View Room Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
