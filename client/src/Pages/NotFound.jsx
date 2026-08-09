import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { AppContext } from "../Context/AppContext";
import whiteLogo from "../assets/White_NestFinderLogo.png";
import darkLogo from "../assets/Dark_NestFinderLogo.png";

export const NotFound = () => {
  const navigate = useNavigate();
  const { theme } = useContext(AppContext);
  const logo = theme === "dark" ? darkLogo : whiteLogo;

  return (
    <div
      className="animate-fade-in container flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "70vh",
        padding: "3rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes ping {
          0% { transform: scale(0.9); opacity: 0.6; }
          70%, 100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes drift {
          0% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(-10px); }
        }
        @keyframes pop404 {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nf-house-wrap {
          position: relative;
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .nf-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid var(--primary);
          animation: ping 2.2s cubic-bezier(0,0,0.2,1) infinite;
        }
        .nf-ping-delay {
          animation-delay: 0.6s;
        }
        .nf-house-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background-color: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 3.2s ease-in-out infinite;
        }
        .nf-cloud {
          position: absolute;
          opacity: 0.5;
          animation: drift 6s ease-in-out infinite;
        }
        .nf-title {
          animation: pop404 0.5s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .nf-house-circle, .nf-ping, .nf-cloud, .nf-title {
            animation: none !important;
          }
        }
      `}</style>

      <img
        src={logo}
        alt="NestFinder"
        style={{ height: "60px", width: "auto", marginBottom: "2rem" }}
      />

      <div className="nf-house-wrap">
        <span className="nf-ping" />
        <span className="nf-ping nf-ping-delay" />
        <div className="nf-house-circle">
          <Home
            size={40}
            strokeWidth={1.8}
            style={{ color: "var(--primary)" }}
          />
        </div>
        <span
          className="nf-cloud"
          style={{ top: -6, left: -18, fontSize: "1.1rem" }}
        >
          💭
        </span>
      </div>
      <h4
        className="nf-title"
        style={{
          fontSize: "1.95rem",
          fontWeight: 800,
          margin: 0,
          color: "var(--text-main)",
          letterSpacing: "-0.02em",
        }}
      >
        404
      </h4>
      <h2
        className="nf-title"
        style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          margin: 0,
          color: "var(--text-main)",
          letterSpacing: "-0.02em",
        }}
      >
        PAGE NOT FOUND
      </h2>
      <p
        style={{
          color: "var(--text-light)",
          fontSize: "0.95rem",
          maxWidth: "420px",
          marginTop: "0.75rem",
          marginBottom: "2rem",
          lineHeight: 1.6,
        }}
      >
        This one packed up and left no forwarding address. The page you're
        looking for doesn't exist, was moved, or the link's just broken.
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>
        <Link
          to="/"
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Home size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
};
