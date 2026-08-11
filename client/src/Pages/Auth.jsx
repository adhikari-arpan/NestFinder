import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { AppContext } from "../Context/AppContext";
import whiteLogo from "../assets/White_NestFinderLogo.png";
import darkLogo from "../assets/Dark_NestFinderLogo.png";
import {
  User,
  Lock,
  Mail,
  Phone,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { CountryCodeSelect } from "../components/ui/CountryCodeSelect";
import { validatePhoneNumber } from "../utils/countryCodes";

// --- Animated Canvas Background ---
const AnimatedBackground = ({ theme }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animFrame;
    const isDark = theme === "dark";
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1.5,
      color: Math.random() > 0.5 ? "99,102,241" : "16,185,129",
    }));
    const houseNodes = Array.from({ length: 6 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 12 + 10,
      opacity: Math.random() * 0.12 + 0.06,
    }));
    const drawHouse = (ctx, x, y, size, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = isDark ? "rgba(99,102,241,1)" : "rgba(79,70,229,0.7)";
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
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      houseNodes.forEach((h) => {
        h.x += h.vx;
        h.y += h.vy;
        if (h.x < 0 || h.x > canvas.width) h.vx *= -1;
        if (h.y < 0 || h.y > canvas.height) h.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(
            nodes[i].x - nodes[j].x,
            nodes[i].y - nodes[j].y,
          );
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 130) * (isDark ? 0.18 : 0.16)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},${isDark ? 0.55 : 0.5})`;
        ctx.fill();
      });
      houseNodes.forEach((h) =>
        drawHouse(ctx, h.x, h.y, h.size, isDark ? h.opacity : h.opacity * 1.8),
      );
      animFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 size-full"
    />
  );
};

// --- Input Field ---
const InputField = ({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  right,
  isDark,
  disabled,
}) => (
  <div className="relative flex w-full items-center">
    <span className="pointer-events-none absolute top-0 left-0 flex h-full w-11 items-center justify-center">
      <Icon
        size={16}
        style={{
          color: isDark ? "rgba(255,255,255,0.4)" : "rgba(79,70,229,0.6)",
        }}
      />
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      style={{
        background: isDark
          ? "rgba(255,255,255,0.055)"
          : "rgba(99,102,241,0.05)",
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(99,102,241,0.18)"}`,
        color: isDark ? "rgba(255,255,255,0.92)" : "#1e1b4b",
        paddingLeft: "3rem",
        paddingRight: "2.75rem",
        textAlign: "left",
      }}
      className="h-13.5 w-full rounded-xl text-[0.9rem] transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
    />
    {right && <div className="absolute right-4 flex items-center">{right}</div>}
  </div>
);

export const Auth = () => {
  const { currentUser, loginUser, signupUser, theme } = useContext(AppContext);
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const logo = isDark ? darkLogo : whiteLogo;

  const [activeTab, setActiveTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryDial, setCountryDial] = useState("977");
  const [showPassword, setShowPassword] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "tenant") navigate("/dashboard/tenant");
    if (currentUser.role === "landlord") navigate("/dashboard/landlord");
    if (currentUser.role === "admin") navigate("/dashboard/admin");
  }, [currentUser, navigate]);

  // hCaptcha tokens are single-use and expire quickly, so the widget must be
  // reset after every submit attempt — success or failure — otherwise the
  // next attempt would silently be sent with a stale/already-spent token.
  const resetCaptcha = () => {
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ text: "", type: "" }); // clear previous message

    if (!captchaToken) {
      setFormMsg({ text: "Please complete the CAPTCHA.", type: "error" });
      return;
    }

    if (activeTab === "login") {
      if (!email || !password) {
        setFormMsg({
          text: "Please fill in email and password.",
          type: "error",
        });
        return;
      }
      setSubmitting(true);
      try {
        const result = await loginUser(email, password, captchaToken);
        if (result && !result.success) {
          setFormMsg({ text: result.message, type: "error" });
        }
      } finally {
        setSubmitting(false);
        resetCaptcha();
      }
    } else {
      if (!name || !email || !password || !phone) {
        setFormMsg({ text: "Please fill all signup fields.", type: "error" });
        return;
      }
      const phoneError = validatePhoneNumber(countryDial, phone);
      if (phoneError) {
        setFormMsg({ text: phoneError, type: "error" });
        return;
      }
      setSubmitting(true);
      try {
        const fullPhone = `+${countryDial}${phone.trim()}`;
        const result = await signupUser(
          email,
          password,
          name,
          fullPhone,
          selectedRole,
          captchaToken,
        );
        setFormMsg({
          text: result.message,
          type: result.success ? "success" : "error",
        });
      } finally {
        setSubmitting(false);
        resetCaptcha();
      }
    }
  };

  // Admin accounts are deliberately not self-serve — only tenant/landlord
  // can be created from this public signup form. Admins are provisioned
  // directly in the database.
  const roles = [
    { val: "tenant", label: "🙋 Tenant" },
    { val: "landlord", label: "🏢 Landlord" },
  ];
  const features = [
    { icon: "🏠", text: "Verified room listings across Kathmandu valley" },
    { icon: "🤖", text: "AI-powered recommendations for your budget" },
    { icon: "🗺️", text: "Map-based search" },
  ];
  // Describes what the system actually does rather than claiming specific
  // usage numbers (listing counts, city counts, etc.) that would need live
  // data to back up and could be challenged as fabricated in a project
  // defense otherwise.
  const stats = [
    { num: "AI", label: "Smart Recommendations" },
    { num: "GPS", label: "Map-Based Search" },
    { num: "KYC", label: "Landlord Verification" },
  ];

  // Switching between dark and white modes
  const pageBg = isDark
    ? "linear-gradient(135deg,#090d16 0%,#0d1117 60%,#0a1a12 100%)"
    : "linear-gradient(135deg,#f0f4ff 0%,#fafbff 60%,#f0fdf4 100%)";
  const cardBg = isDark ? "rgba(255,255,255,0.042)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark
    ? "rgba(255,255,255,0.09)"
    : "rgba(99,102,241,0.16)";
  const cardShadow = isDark
    ? "0 32px 80px rgba(0,0,0,0.6)"
    : "0 20px 60px rgba(99,102,241,0.13), 0 4px 20px rgba(0,0,0,0.05)";
  const tabBarBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.07)";
  const headingColor = isDark ? "rgba(255,255,255,0.92)" : "#1e1b4b";
  const subColor = isDark ? "rgba(255,255,255,0.4)" : "#4338ca";
  const switchColor = isDark ? "rgba(255,255,255,0.4)" : "#374151";
  const dividerColor = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(99,102,241,0.10)";
  const linkColor = isDark ? "#818cf8" : "#4f46e5";
  const tabInactiveColor = isDark
    ? "rgba(255,255,255,0.45)"
    : "rgba(67,56,202,0.65)";
  const roleActiveText = isDark ? "#c7d2fe" : "#4338ca";
  const roleInactiveText = isDark
    ? "rgba(255,255,255,0.45)"
    : "rgba(67,56,202,0.6)";

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: pageBg }}
    >
      <AnimatedBackground theme={theme} />

      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-1 size-175 -translate-1/2 rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%)"
            : "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)",
        }}
      />

      {/* Left panel */}
      <div className="absolute top-1/2 left-[6%] z-2 hidden max-w-65 -translate-y-1/2 flex-col gap-8 xl:flex">
        <div className="flex flex-col gap-3">
          <p
            className="text-[0.68rem] font-bold tracking-[0.18em] uppercase"
            style={{ color: isDark ? "rgba(52,211,153,0.8)" : "#059669" }}
          >
            Nepal's Rental Network
          </p>
          <h1
            className="text-[2rem] leading-[1.2] font-extrabold"
            style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#1e1b4b" }}
          >
            Find your
            <br />
            <span style={{ color: isDark ? "#818cf8" : "#4f46e5" }}>
              perfect Nest
            </span>
          </h1>
        </div>
        <div
          className="h-0.5 w-8 rounded-full"
          style={{ background: isDark ? "#818cf8" : "#4f46e5", opacity: 0.4 }}
        />
        <div className="flex flex-col gap-5">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-base">{f.icon}</span>
              <span
                className="text-[0.81rem] leading-relaxed"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#475569" }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="absolute top-1/2 right-[6%] z-2 hidden max-w-50 -translate-y-1/2 flex-col gap-7 xl:flex">
        {stats.map((s, i) => (
          <div key={i} className="text-right">
            <p
              className="text-[1.75rem] leading-none font-extrabold"
              style={{ color: isDark ? "rgba(129,140,248,0.85)" : "#4f46e5" }}
            >
              {s.num}
            </p>
            <p
              className="mt-0.5 text-[0.72rem] font-medium tracking-wide"
              style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#64748b" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div
        className="animate-modal-enter relative z-3 w-full max-w-120 rounded-2xl border backdrop-blur-2xl"
        style={{
          background: cardBg,
          borderColor: cardBorder,
          boxShadow: cardShadow,
          padding: "2.75rem 2.25rem 2.5rem",
        }}
      >
        {/* Logo */}
        <div
          className="flex flex-col items-center gap-3"
          style={{ marginBottom: "2.75rem" }}
        >
          <img
            src={logo}
            alt="NestFinder"
            style={{ height: "100px", width: "auto" }}
          />
          <h2
            className="m-0 text-[1.35rem] font-extrabold tracking-tight"
            style={{ color: headingColor }}
          >
            NestFinder
          </h2>
          <p
            className="m-0 text-[0.75rem] font-medium"
            style={{ color: subColor }}
          >
            Nepal's trusted rental platform
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1.25"
          style={{ background: tabBarBg, marginBottom: "1.75rem" }}
        >
          {["login", "signup"].map((tab) => (
            <button
              key={tab}
              type="button"
              disabled={submitting}
              onClick={() => {
                setActiveTab(tab);
                setFormMsg({ text: "", type: "" });
              }}
              className={`flex-1 cursor-pointer rounded-[9px] border-none py-3 text-[0.85rem] font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                activeTab === tab
                  ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_2px_14px_rgba(99,102,241,0.38)]"
                  : "bg-transparent hover:opacity-70"
              }`}
              style={activeTab !== tab ? { color: tabInactiveColor } : {}}
            >
              {tab === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Role selector — only relevant when creating an account */}
        {activeTab === "signup" && (
          <div className="flex gap-2.5" style={{ marginBottom: "2.25rem" }}>
            {roles.map((r) => (
              <button
                key={r.val}
                type="button"
                disabled={submitting}
                onClick={() => setSelectedRole(r.val)}
                className="flex-1 cursor-pointer rounded-xl border px-1 py-3 text-[0.82rem] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                style={
                  selectedRole === r.val
                    ? {
                        borderColor: "rgba(151, 153, 237, 0.55)",
                        background: isDark
                          ? "rgba(99,102,241,0.18)"
                          : "rgba(99,102,241,0.1)",
                        color: roleActiveText,
                      }
                    : {
                        borderColor: isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(99,102,241,0.14)",
                        background: "transparent",
                        color: roleInactiveText,
                      }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: dividerColor, marginBottom: "2.25rem" }}
        />

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          style={{ gap: "1.5rem" }}
        >
          {activeTab === "signup" && (
            <InputField
              isDark={isDark}
              icon={User}
              type="text"
              value={name}
              disabled={submitting}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          )}

          <InputField
            isDark={isDark}
            icon={Mail}
            type="email"
            value={email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
          />

          {activeTab === "signup" && (
            <div className="flex w-full items-start gap-2">
              <CountryCodeSelect
                isDark={isDark}
                value={countryDial}
                onChange={setCountryDial}
                disabled={submitting}
              />
              <div className="flex-1">
                <InputField
                  isDark={isDark}
                  icon={Phone}
                  type="tel"
                  value={phone}
                  disabled={submitting}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder={
                    countryDial === "977" ? "98XXXXXXXX" : "Phone number"
                  }
                  required
                />
              </div>
            </div>
          )}

          <InputField
            isDark={isDark}
            icon={Lock}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={submitting}
            right={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="cursor-pointer border-none bg-transparent p-0 transition-opacity hover:opacity-60"
                style={{
                  color: isDark
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(79,70,229,0.6)",
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* CAPTCHA */}
          <div className="flex justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
              theme={isDark ? "dark" : "light"}
              onVerify={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>

          {/* Success Failure Message */}
          {formMsg.text && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: 500,
                background:
                  formMsg.type === "error"
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(16,185,129,0.12)",
                border: `1px solid ${
                  formMsg.type === "error"
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(16,185,129,0.3)"
                }`,
                color: formMsg.type === "error" ? "#f87171" : "#34d399",
              }}
            >
              {formMsg.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !captchaToken}
            style={{ marginTop: "0.5rem" }}
            className="flex h-13.5 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-linear-to-r from-indigo-500 to-emerald-500 text-[0.93rem] font-bold text-white shadow-[0_4px_22px_rgba(99,102,241,0.32)] transition-all duration-200 hover:opacity-90 hover:shadow-[0_6px_28px_rgba(99,102,241,0.42)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {activeTab === "login" ? "Sign In" : "Create Account"}
            <ChevronRight size={17} />
          </button>
        </form>

        {/* Switch */}
        <p
          className="text-center text-[0.79rem] font-medium"
          style={{ color: switchColor, marginTop: "2rem" }}
        >
          {activeTab === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className="cursor-pointer border-none bg-transparent p-0 font-bold hover:underline"
                style={{ color: linkColor }}
              >
                Register here
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="cursor-pointer border-none bg-transparent p-0 font-bold hover:underline"
                style={{ color: linkColor }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {submitting && (
        <div className="modal-overlay">
          <LoadingScreen
            fullScreen={false}
            label={
              activeTab === "login"
                ? "Signing you in..."
                : "Creating your account..."
            }
          />
        </div>
      )}
    </div>
  );
};
