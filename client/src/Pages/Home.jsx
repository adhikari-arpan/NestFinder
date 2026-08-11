import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import {
  Sparkles,
  Shield,
  ArrowRight,
  Map,
  ChevronDown,
  CheckCircle,
  SlidersHorizontal,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import pagodaSkyline from "../assets/pagoda.png";

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
// Fades + slides content in the first time it scrolls into view, instead of
// everything below the hero just sitting there statically fully-rendered.
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Animated Canvas ──────────────────────────────────────────────────────────
const NetworkBackground = ({ theme }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const isDark = theme === "dark";
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? "99,102,241" : "16,185,129",
    }));
    const houses = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 14 + 10,
      opacity: Math.random() * 0.1 + 0.05,
    }));
    const drawHouse = (x, y, size, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = "rgba(99,102,241,1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(x - size * 0.7, y, size * 1.4, size * 1.1);
      ctx.strokeRect(x - size * 0.2, y + size * 0.5, size * 0.4, size * 0.6);
      ctx.restore();
    };
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });
      houses.forEach((h, index) => {
        h.x += h.vx;
        h.y += h.vy + Math.sin(Date.now() / 800 + index) * 0.4;
        if (h.x < 0 || h.x > canvas.width) h.vx *= -1;
        if (h.y < 0 || h.y > canvas.height) h.vy *= -1;
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isDark ? 0.18 : 0.1);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      dots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.color},${isDark ? 0.55 : 0.35})`;
        ctx.fill();
      });
      houses.forEach((h) => drawHouse(h.x, h.y, h.size, h.opacity));
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 size-full"
    />
  );
};

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  {
    icon: <SlidersHorizontal size={22} />,
    color: "var(--primary)",
    bg: "var(--primary-light)",
    title: "Set Your Preferences",
    desc: "Tell us your budget, room type, sharing preference, and the location you care about — like your college or workplace.",
  },
  {
    icon: <Sparkles size={22} />,
    color: "var(--accent)",
    bg: "var(--accent-light)",
    title: "Get AI-Matched Rooms",
    desc: "Our recommendation engine scores every verified listing against what you're looking for, so the best matches rise to the top.",
  },
  {
    icon: <MessageCircle size={22} />,
    color: "var(--secondary)",
    bg: "var(--secondary-light)",
    title: "Contact & Move In",
    desc: "Reach out directly to the verified landlord — no brokers, no commissions, no middlemen.",
  },
];

const HowItWorks = ({ isDark }) => (
  <section
    className="relative overflow-hidden py-16"
    style={{
      background: isDark
        ? "linear-gradient(180deg,#090d16 0%,#0d1222 100%)"
        : "linear-gradient(180deg,#f8faff 0%,#ffffff 100%)",
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)"}`,
    }}
  >
    <NetworkBackground theme={isDark ? "dark" : "light"} />
    <div className="relative z-1 container">
      <Reveal className="mx-auto mb-10 max-w-160 text-center">
        <p className="mb-4 text-[0.78rem] font-bold tracking-[0.14em] text-(--primary) uppercase">
          HOW IT WORKS
        </p>
        <h2
          className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-extrabold"
          style={{
            color: isDark ? "#f1f5f9" : "#0f172a",
            fontFamily: "var(--font-display)",
          }}
        >
          Three steps to your next room
        </h2>
      </Reveal>

      <div className="how-it-works-row">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.12} className="how-it-works-step">
            <div
              className="how-it-works-number"
              style={{
                background: step.bg,
                color: step.color,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {i + 1}
            </div>
            <div
              className="feature-icon-wrapper"
              style={{
                backgroundColor: step.bg,
                color: step.color,
                "--icon-delay": `${i * 0.3}s`,
              }}
            >
              {step.icon}
            </div>
            <h3
              className="m-0 text-[1.1rem] font-bold"
              style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
            >
              {step.title}
            </h3>
            <p
              className="m-0 text-[0.93rem] leading-[1.7]"
              style={{ color: isDark ? "#94a3b8" : "#475569" }}
            >
              {step.desc}
            </p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// ─── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Is NestFinder free to use?",
    a: "Creating an account and browsing listings is free. Unlocking precise distance-based search around a specific location (like your college) requires a small one-time radius access fee, valid for 48 hours.",
  },
  {
    q: "How are landlords verified?",
    a: "Every landlord completes a KYC verification process — submitting identity documents and address details — before they're allowed to post a room listing.",
  },
  {
    q: "How does the AI recommendation work?",
    a: "You set your budget, room type, and amenity preferences, and our matching model scores every verified listing by how closely it fits what you're looking for.",
  },
  {
    q: "How do payments work, and are they safe?",
    a: "Payments are made via eSewa/Fonepay QR code. You upload a screenshot as proof, and an admin manually verifies it before access is granted — no card details are ever stored.",
  },
  {
    q: "Can I contact landlords directly?",
    a: "Yes — once you find a room you like, you can reach out to the verified landlord directly, with zero broker commissions or hidden fees.",
  },
  {
    q: "What if I need help or run into an issue?",
    a: "Use the Support Hub link in the footer any time — it opens a pre-drafted email to our tech support team.",
  },
];

const FAQItem = ({ item, isOpen, onToggle, isDark }) => (
  <div
    className="faq-item"
    style={{
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "var(--border-color)",
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      className="faq-question"
      style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
    >
      <span>{item.q}</span>
      <ChevronDown
        size={18}
        style={{
          color: "var(--primary)",
          flexShrink: 0,
          transition: "transform 0.3s ease",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      />
    </button>
    {isOpen && (
      <p
        className="animate-fade-in m-0 pb-5 text-[0.93rem] leading-[1.7]"
        style={{ color: isDark ? "#94a3b8" : "#475569" }}
      >
        {item.a}
      </p>
    )}
  </div>
);

const FAQSection = ({ isDark }) => {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{
        background: isDark
          ? "linear-gradient(180deg,#0d1222 0%,#090d16 100%)"
          : "linear-gradient(180deg,#ffffff 0%,#f8faff 100%)",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)"}`,
      }}
    >
      <NetworkBackground theme={isDark ? "dark" : "light"} />
      <div className="relative z-1 container">
        <Reveal className="mx-auto mb-10 max-w-160 text-center">
          <div
            className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
          >
            <HelpCircle size={22} />
          </div>
          <p className="mb-4 text-[0.78rem] font-bold tracking-[0.14em] text-(--primary) uppercase">
            GOT QUESTIONS?
          </p>
          <h2
            className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-extrabold"
            style={{
              color: isDark ? "#f1f5f9" : "#0f172a",
              fontFamily: "var(--font-display)",
            }}
          >
            Frequently Asked Questions
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto max-w-160">
          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={item.q}
                item={item}
                isDark={isDark}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Home = () => {
  const navigate = useNavigate();
  const { currentUser, theme } = useContext(AppContext);

  useEffect(() => {
    if (currentUser?.role === "tenant") navigate("/dashboard/tenant");
    else if (currentUser?.role === "landlord") navigate("/dashboard/landlord");
    else if (currentUser?.role === "admin") navigate("/dashboard/admin");
  }, [currentUser, navigate]);

  const isDark = theme === "dark";

  // ── GUEST VIEW ──────────────────────────────────────────────────────────────
  if (!currentUser)
    return (
      <div className="flex flex-col text-(--text-main)">
        {/* ── HERO SECTION ── */}
        <section
          className={[
            "relative flex min-h-[calc(100vh-70px)] flex-col justify-center",
            "px-6 pt-16 pb-20",
            isDark
              ? "bg-[linear-gradient(135deg,#090d16_0%,#0d1222_60%,#0a1a12_100%)]"
              : "bg-[linear-gradient(135deg,#f0f4ff_0%,#fafbff_100%)]",
          ].join(" ")}
        >
          <NetworkBackground theme={theme} />

          {/* Skyline Silhouette */}
          <div
            className="skyline-svg-container"
            style={{
              transform: "scaleX(-1) scaleY(0.8)",
              transformOrigin: "bottom center",
            }}
          >
            <div
              className="skyline-fill skyline-mask"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "100%",
                WebkitMaskImage: `url(${pagodaSkyline})`,
                WebkitMaskSize: "100% auto",
                WebkitMaskPosition: "bottom center",
                WebkitMaskRepeat: "no-repeat",
                maskImage: `url(${pagodaSkyline})`,
                maskSize: "100% auto",
                maskPosition: "bottom center",
                maskRepeat: "no-repeat",
              }}
            ></div>
          </div>

          {/* Ambient orbs */}
          <div
            className="pointer-events-none absolute top-[15%] left-[8%] z-1 size-100 rounded-full"
            style={{
              background: isDark
                ? "rgba(99,102,241,0.1)"
                : "rgba(99,102,241,0.06)",
              filter: "blur(100px)",
            }}
          />
          <div
            className="pointer-events-none absolute right-[8%] bottom-[20%] z-1 size-80 rounded-full"
            style={{
              background: isDark
                ? "rgba(16,185,129,0.08)"
                : "rgba(16,185,129,0.05)",
              filter: "blur(90px)",
            }}
          />

          {/* Hero content Grid */}
          <div className="hero-grid relative z-5">
            {/* Left Column */}
            <div className="hero-content-left animate-fade-in">
              <span className="hero-badge hero-badge-left">
                🏠 Nepal's Rental Network
              </span>

              <h1
                className="hero-headline m-0 text-left"
                style={{ textAlign: "left" }}
              >
                Find your <span className="gradient-text">perfect Nest</span>
              </h1>

              <p
                className="hero-sub m-0 text-left"
                style={{
                  marginLeft: 0,
                  textAlign: "left",
                  color: isDark ? "#ffffff" : undefined,
                }}
              >
                Verified rooms across Kathmandu valley. AI-powered
                recommendations. Map-based search.
              </p>

              {/* Feature pills */}
              <div className="pills-container-left">
                {[
                  "✅ Verified listings",
                  "🤖 AI match scoring",
                  "🗺️ Map-based search",
                  "📞 Direct landlord contact",
                ].map((f, i) => (
                  <span
                    key={i}
                    className="feature-pill-card"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(99,102,241,0.07)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.15)"}`,
                      color: isDark ? "#ffffff" : "#4338ca",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/auth"
                className="hero-cta-btn mt-4"
                style={{ textDecoration: "none" }}
              >
                Get Started • Sign In <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right Column: Photo Stack */}
            <div className="photo-stack-container animate-fade-in">
              {/* Card 1 */}
              <div className="stacked-card stacked-card-1">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80"
                  alt="Room 1"
                />
                <div className="card-overlay-info">
                  <div></div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="stacked-card stacked-card-2">
                <img
                  src="https://images.unsplash.com/photo-1502672260266-1c1de2d9d543?auto=format&fit=crop&w=400&q=80"
                  alt="Room 2"
                />
                <div className="card-overlay-info">
                  <div></div>
                </div>
              </div>
              {/* Card 3 (Front) */}
              <div className="stacked-card stacked-card-3">
                <img
                  src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80"
                  alt="Room 3"
                />
                <div className="absolute top-3 left-3 flex gap-1">
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur-sm"
                    style={{ background: "rgba(16,185,129,0.9)" }}
                  >
                    <CheckCircle size={10} /> Verified
                  </span>
                </div>
                <div className="card-overlay-info flex-col items-start gap-1">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-white">
                      A Cozy Room is Awaiting You...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="scroll-hint relative z-5"
            style={{ marginTop: "1rem", color: isDark ? "#ffffff" : "#000000" }}
          >
            <ChevronDown size={20} />
            <span>Scroll to explore features</span>
          </div>

          {/* Stats bar */}
          <div
            className="relative z-5 container mt-14 w-full"
            style={{ marginBottom: "40px" }}
          >
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">Active Listings</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">3</div>
                <div className="stat-label">Cities Covered</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Verified Landlords</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section
          className="relative overflow-hidden py-16"
          style={{
            background: isDark
              ? "linear-gradient(180deg,#0d1222 0%,#090d16 100%)"
              : "linear-gradient(180deg,#ffffff 0%,#f8faff 100%)",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.08)"}`,
          }}
        >
          <NetworkBackground theme={theme} />

          {/* Orbs */}
          <div
            className="pointer-events-none absolute -top-20 left-[10%] size-95 rounded-full"
            style={{
              background: "rgba(99,102,241,0.06)",
              filter: "blur(90px)",
            }}
          />
          <div
            className="pointer-events-none absolute right-[10%] -bottom-16 size-80 rounded-full"
            style={{
              background: "rgba(16,185,129,0.05)",
              filter: "blur(80px)",
            }}
          />

          <div
            className="relative z-1 container"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            {/* Section header */}
            <Reveal
              className="text-center"
              delay={0}
            >
              <div
                style={{
                  marginBottom: "32px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: "640px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <p className="mb-4 text-[0.78rem] font-bold tracking-[0.14em] text-(--primary) uppercase">
                  WHY NESTFINDER?
                </p>
                <h2
                  className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-extrabold"
                  style={{
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    fontFamily: "var(--font-display)",
                    marginBottom: "20px",
                  }}
                >
                  Everything you need to find
                  <br />
                  your ideal room
                </h2>
                <p
                  className="mx-auto max-w-130 text-center text-[1.05rem]"
                  style={{
                    color: isDark ? "#94a3b8" : "#475569",
                    lineHeight: "1.9",
                    marginTop: "0px",
                  }}
                >
                  NestFinder combines interactive maps, AI recommendations and
                  verified listings so you can find your perfect place —
                  efficiently and safely.
                </p>
              </div>
            </Reveal>

            {/* Feature cards */}
            <div className="features-grid-layout">
              {[
                {
                  icon: <Map size={24} />,
                  color: "var(--primary)",
                  bg: "var(--primary-light)",
                  border: "var(--primary)",
                  shadow: "rgba(99,102,241,0.1)",
                  title: "Map-Based Room Discovery",
                  desc: "Locate flats, rooms, and sharing configurations visually on our interactive open map. Select places instantly based on proximity to colleges and transit points.",
                },
                {
                  icon: <Sparkles size={24} />,
                  color: "var(--accent)",
                  bg: "var(--accent-light)",
                  border: "var(--accent)",
                  shadow: "rgba(245,158,11,0.1)",
                  title: "AI Similarity Matching",
                  desc: "Specify your exact requirements for max budget, WiFi, and amenities. Our matching algorithm returns percentage scores for all available listings instantly.",
                },
                {
                  icon: <Shield size={24} />,
                  color: "var(--secondary)",
                  bg: "var(--secondary-light)",
                  border: "var(--secondary)",
                  shadow: "rgba(16,185,129,0.1)",
                  title: "Verified Direct Contact",
                  desc: "Every landlord undergoes verification. Reach out directly via telephone or messages with zero broker commissions and no hidden fees whatsoever.",
                },
              ].map(({ icon, color, bg, border, shadow, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.12}>
                  <div
                    className="feature-redesign-card glass"
                    style={{
                      borderLeft: `4px solid ${border}`,
                      boxShadow: `0 8px 30px ${shadow}`,
                    }}
                  >
                    <div
                      className="feature-icon-wrapper"
                      style={{
                        backgroundColor: bg,
                        color,
                        boxShadow: `0 0 15px ${shadow}`,
                        "--icon-delay": `${i * 0.3}s`,
                      }}
                    >
                      {icon}
                    </div>
                    <h3
                      className="m-0 text-[1.15rem] font-bold"
                      style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
                    >
                      {title}
                    </h3>
                    <p
                      className="m-0 text-[0.93rem] leading-[1.7]"
                      style={{ color: isDark ? "#94a3b8" : "#475569" }}
                    >
                      {desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Bottom CTA */}
            <Reveal delay={0.15} className="mt-10 text-center">
              <Link
                to="/auth"
                className="hero-cta-btn"
                style={{
                  textDecoration: "none",
                  position: "relative",
                  bottom: "20px",
                }}
              >
                Start Finding Rooms <ArrowRight size={18} />
              </Link>
            </Reveal>
          </div>
        </section>

        <HowItWorks isDark={isDark} />
        <FAQSection isDark={isDark} />
      </div>
    );

  return null;
};
