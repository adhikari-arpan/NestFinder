import { Link } from "react-router-dom";
import {
  Target,
  Users,
  ArrowRight,
  CreditCard,
  MapPin,
  Brain,
  ShieldCheck,
  Search,
  Home,
  GraduationCap,
  Building2,
  ListChecks,
  MessageSquare,
  LayoutDashboard,
  Compass,
  CheckCircle2,
  Globe,
} from "lucide-react";
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
} from "../../components/icons/SocialIcons";
import "./About.css";

/* ============================================================
   TEAM — replace with the actual paths
   ============================================================ */
const team = [
  {
    name: "Arpan Adhikari",
    photo: "/team_img/arpan.jpeg",
    initials: "AA",
    socials: [
      {
        icon: Globe,
        label: "Website",
        url: "https://www.arpanadhikari7.com.np/",
      },
      {
        icon: Github,
        label: "GitHub",
        url: "https://github.com/adhikari-arpan",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/adhikari-arpan63/",
      },
      {
        icon: Instagram,
        label: "Instagram",
        url: "https://www.instagram.com/adhikari__arpan",
      },
      {
        icon: Facebook,
        label: "Facebook",
        url: "https://www.facebook.com/arpan.adhikari.063",
      },
    ],
  },
  {
    name: "Purnima Bhattrai",
    photo: "/team_img/Purnima.jpeg",
    initials: "PB",
    socials: [
      {
        icon: Globe,
        label: "Website",
        url: "https://www.purnimabhattrai.com.np/",
      },
      {
        icon: Github,
        label: "GitHub",
        url: "https://github.com/Purnimabhattrai",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/purnima-bhattrai-aba922356",
      },
      {
        icon: Instagram,
        label: "Instagram",
        url: "https://www.instagram.com/purnimabhattrai09/",
      },
      {
        icon: Facebook,
        label: "Facebook",
        url: "https://www.facebook.com/purnima.bhattrai.855174",
      },
    ],
  },
];

const features = [
  {
    icon: Search,
    title: "Smart Search & Filtering",
    desc: "Browse rooms and flats filtered by budget, location, room type, sharing option, and amenities — all in one place instead of scattered social media posts.",
  },
  {
    icon: MapPin,
    title: "Map-Based Discovery",
    desc: "Every listing is pinned on an interactive OpenStreetMap view. See exactly where a room sits and explore the neighborhood before you ever visit.",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    desc: "Set your preferences once — budget range, preferred location, room type — and our recommendation engine suggests the best-matching listings for you.",
  },
  {
    icon: Compass,
    title: "Nearby Services",
    desc: "Discover colleges, hospitals, markets, banks, and bus stops around each property, so you know what daily life will look like before moving in.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Our admin team monitors the platform, verifies landlords, and removes fake or outdated posts — so what you see is what actually exists.",
  },
  {
    icon: MessageSquare,
    title: "Direct Inquiries",
    desc: "Message landlords directly about a listing, save your favourites, and get notified about activity — no brokers, no middlemen.",
  },
];

const tenantSteps = [
  { title: "Create your account", desc: "Register as a tenant in seconds." },
  {
    title: "Set your preferences",
    desc: "Tell us your budget, preferred location, and room type.",
  },
  {
    title: "Search or get matched",
    desc: "Filter listings on the map, or let our AI recommend rooms for you.",
  },
  {
    title: "Explore & inquire",
    desc: "Check nearby services, view details, and contact the landlord directly.",
  },
];

const landlordSteps = [
  {
    title: "Register as a landlord",
    desc: "Create your landlord account and profile.",
  },
  {
    title: "List your property",
    desc: "Add details, pricing, amenities, and photos — pin the exact location on the map.",
  },
  {
    title: "Get verified",
    desc: "Verified listings earn tenant trust and better visibility.",
  },
  {
    title: "Connect with tenants",
    desc: "Receive and respond to inquiries from your dashboard.",
  },
];

const stack = [
  { label: "React.js + Tailwind", role: "Frontend" },
  { label: "Node.js + Express", role: "Backend API" },
  { label: "Python + scikit-learn", role: "AI Engine" },
  { label: "PostgreSQL", role: "Database" },
  { label: "OpenStreetMap", role: "Maps & Places" },
];

export const About = () => {
  return (
    <div className="animate-fade-in about-page">
      {/* ===== Hero ===== */}
      <header className="about-hero">
        <span className="about-eyebrow">
          <Home size={13} /> Nepal's Rental Network
        </span>
        <h1>
          Renting in Nepal,
          <br />
          <span className="grad">made simple &amp; trustworthy</span>
        </h1>
        <p>
          NestFinder is a map-based room finder with AI-powered recommendations
          — a single, centralized platform where landlords list rooms and flats,
          and tenants discover the right place through smart search, interactive
          maps, and personalized suggestions.
        </p>
      </header>

      {/* ===== Mission ===== */}
      <section className="about-section">
        <div className="about-section-head">
          <span className="ico ico-primary">
            <Target size={20} />
          </span>
          <h2>Why NestFinder Exists</h2>
        </div>
        <p className="about-lead">
          Finding a rental place in Nepal's cities is tough — not because there
          are no rooms, but because information about them is scattered across
          social media groups, brokers, word of mouth, and signboards. Listings
          are often outdated, biased, or impossible to verify, and tenants waste
          days comparing details and chasing landlords.
        </p>
        <p className="about-lead">
          NestFinder brings everything into one honest, centralized platform.
          Tenants search and compare with confidence, while landlords reach
          genuine renters without middlemen. Faster, fairer, and built for how
          people actually look for a home.
        </p>
      </section>

      {/* ===== Features ===== */}
      <section className="about-section">
        <div className="about-section-head">
          <span className="ico ico-secondary">
            <ListChecks size={20} />
          </span>
          <h2>What the Platform Offers</h2>
        </div>
        <div className="about-feature-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div className="about-feature" key={title}>
              <span className="tile">
                <Icon size={20} />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="about-section">
        <div className="about-section-head">
          <span className="ico ico-accent">
            <LayoutDashboard size={20} />
          </span>
          <h2>How It Works</h2>
        </div>
        <div className="about-how">
          <div className="about-how-col accent-primary">
            <div className="col-head">
              <Search size={17} /> For Tenants
            </div>
            {tenantSteps.map((s, i) => (
              <div className="about-step" key={s.title}>
                <span className="num">{i + 1}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="about-how-col accent-secondary">
            <div className="col-head">
              <Building2 size={17} /> For Landlords
            </div>
            {landlordSteps.map((s, i) => (
              <div className="about-step" key={s.title}>
                <span className="num">{i + 1}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Technology ===== */}
      <section className="about-section">
        <div className="about-section-head">
          <span className="ico ico-primary">
            <CheckCircle2 size={20} />
          </span>
          <h2>Built With Modern Technology</h2>
        </div>
        <p className="about-lead">
          NestFinder runs on a three-tier architecture: a React frontend, a
          Node.js/Express REST API, and a dedicated Python microservice for
          content-based AI recommendations — all backed by PostgreSQL and free,
          open mapping through OpenStreetMap.
        </p>
        <div className="about-stack">
          {stack.map((t) => (
            <span className="about-stack-pill" key={t.label}>
              <em>{t.role}</em> {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* ===== Team ===== */}
      <section className="about-section">
        <div className="about-section-head">
          <span className="ico ico-secondary">
            <Users size={20} />
          </span>
          <h2>Meet the Developers</h2>
        </div>
        <div className="about-team-grid">
          {team.map((member) => (
            <div className="about-team-card" key={member.name} tabIndex={0}>
              <div className="about-photo-wrap">
                <span className="about-photo-fallback" aria-hidden="true">
                  {member.initials}
                </span>
                <img
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="about-socials">
                  {member.socials.map(({ icon: Icon, label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on ${label}`}
                      title={label}
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="about-team-name">
                <h3>{member.name}</h3>
                <span>Developer</span>
              </div>
            </div>
          ))}
        </div>
        <div className="about-institute">
          <GraduationCap size={24} />
          <p>
            NestFinder is developed as a Computer Engineering minor project at{" "}
            <strong>Nepal College of Information Technology (NCIT)</strong>,
            Balkumari, Lalitpur — affiliated with Pokhara University.
          </p>
        </div>
      </section>

      {/* ===== Payment CTA ===== */}
      <div className="about-cta">
        <div className="about-cta-info">
          <CreditCard size={24} className="about-cta-icon" />
          <div>
            <p className="about-cta-title">Curious how payments work?</p>
            <p className="about-cta-subtitle">
              See listing fees for landlords and access fees for tenants.
            </p>
          </div>
        </div>
        <Link
          to="/about/payment"
          className="btn btn-outline btn-sm about-cta-link"
        >
          Payment Guide <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
