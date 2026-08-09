import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Building2,
  ShieldCheck,
  Upload,
  CheckCircle2,
} from "lucide-react";
import {
  LISTING_FEE_RATE,
  LISTING_FEE_MIN,
  LISTING_FEE_MAX,
  DISTANCE_TIER_PRICING,
  getListingFee,
  formatNPR,
} from "../../utils/paymentUtils";
import { LISTING_VISIBILITY_DAYS } from "../../utils/listingLifecycle";

const LISTING_FEE_EXAMPLES = [4000, 25000, 50000];

const VERIFICATION_STEPS = [
  {
    icon: Upload,
    text: "Scan the eSewa / Fonepay QR code shown and pay the exact amount.",
  },
  {
    icon: Upload,
    text: "Upload a screenshot of the receipt (and transaction code, if you have one).",
  },
  {
    icon: ShieldCheck,
    text: "An admin manually reviews the proof — usually within a short while.",
  },
  {
    icon: CheckCircle2,
    text: "Once approved, the fee is cleared and your listing or access is activated.",
  },
];

export const AboutPayment = () => {
  return (
    <div
      className="animate-fade-in container"
      style={{
        padding: "2.5rem 1.5rem 5rem",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <Link
        to="/about"
        className="btn btn-outline btn-sm"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "1.5rem",
        }}
      >
        <ArrowLeft size={16} /> Back to About
      </Link>

      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}
        >
          Payment &amp; Pricing Guide
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            maxWidth: "650px",
          }}
        >
          NestFinder charges small, fair fees to keep listings genuine and the
          platform sustainable. All payments are made via eSewa / Fonepay QR and
          verified manually by an admin from your uploaded receipt screenshot —
          there's no automatic card billing.
        </p>
      </div>

      {/* For Landlords */}
      <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <Building2 size={24} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
            For Landlords — Listing Fee
          </h2>
        </div>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          Posting a new room or flat listing requires a one-time listing fee,
          charged as a percentage of the monthly rent you set. This fee doesn't
          apply when editing an existing listing.
        </p>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          Once an admin verifies your listing, it stays visible to tenants in
          search for <strong>{LISTING_VISIBILITY_DAYS} days</strong> from the
          moment it's verified — after that it's automatically removed from
          search results.
        </p>

        <div
          style={{
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            margin: "1.25rem 0",
          }}
        >
          <p style={{ fontWeight: 700, margin: "0 0 0.5rem" }}>Formula</p>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.8,
            }}
          >
            Listing Fee = {LISTING_FEE_RATE * 100}% × Monthly Rent, rounded up
            to the nearest Rs. 10
            <br />
            Minimum: {formatNPR(LISTING_FEE_MIN)} &nbsp;·&nbsp; Maximum:{" "}
            {formatNPR(LISTING_FEE_MAX)}
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "0.6rem 0.5rem" }}>Monthly Rent</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>
                  {LISTING_FEE_RATE * 100}% of Rent
                </th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Fee Charged</th>
              </tr>
            </thead>
            <tbody>
              {LISTING_FEE_EXAMPLES.map((rent) => (
                <tr
                  key={rent}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td style={{ padding: "0.6rem 0.5rem" }}>
                    {formatNPR(rent)}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.5rem",
                      color: "var(--text-light)",
                    }}
                  >
                    {formatNPR(Math.round(rent * LISTING_FEE_RATE))}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.5rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    {formatNPR(getListingFee(rent))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* For Tenants */}
      <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <Home size={24} style={{ color: "var(--secondary)" }} />
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
            For Tenants — Radius Access
          </h2>
        </div>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          By default, search results show listings without exact distance
          filtering. Paying a small one-time fee unlocks precise distance-based
          search within your chosen radius of a location (like your college) for
          <strong> 48 hours</strong>. Access can be renewed anytime after it
          expires.
        </p>

        <div style={{ overflowX: "auto", marginTop: "1.25rem" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "0.6rem 0.5rem" }}>Radius Tier</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Description</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Fee</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(DISTANCE_TIER_PRICING).map(([radius, tier]) => (
                <tr
                  key={radius}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td style={{ padding: "0.6rem 0.5rem" }}>
                    {tier.icon} {tier.label}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.5rem",
                      color: "var(--text-light)",
                    }}
                  >
                    {tier.desc}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.5rem",
                      fontWeight: 700,
                      color: "var(--secondary)",
                    }}
                  >
                    {formatNPR(tier.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification steps */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
          }}
        >
          How Payment Verification Works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {VERIFICATION_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.85rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {idx + 1}
                </div>
                <p
                  style={{
                    margin: "0.3rem 0 0",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <Icon
                    size={14}
                    style={{
                      display: "inline",
                      marginRight: "0.35rem",
                      verticalAlign: "-2px",
                      color: "var(--primary)",
                    }}
                  />
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
