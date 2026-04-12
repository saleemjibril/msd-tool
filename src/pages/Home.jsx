import { Link } from "react-router-dom";

const stats = [
  { num: "6", label: "Roles" },
  { num: "18", label: "Capacities" },
  { num: "~15 min", label: "To complete" },
];

const infoCards = [
  { icon: "💬", title: "Communicator", desc: "Tailored messaging and reporting" },
  { icon: "🤝", title: "Relationship builder", desc: "Trust, connections, mediation" },
  { icon: "📊", title: "Businessperson", desc: "Credibility across value chains" },
  { icon: "🌱", title: "Coach & innovator", desc: "Ownership, learning, ideas" },
];

export default function Home() {
  return (
    <div
      className="relative min-h-screen font-jakarta antialiased"
      style={{
        background: "linear-gradient(160deg, #f0faf5 0%, #ffffff 60%)",
        color: "#1c2b2b",
      }}
    >
      {/* <Link
        to="/admin/login"
        className="absolute right-6 top-5 text-[13px] font-medium text-[#6b7e78] underline decoration-[#c4d0cc] underline-offset-2 hover:text-[#247a4f]"
      >
        Admin
      </Link> */}

      {/* Hero */}
      <div className="flex items-center justify-center px-6 pb-16 pt-20 max-md:pb-10 max-md:pt-12">
        <div className="w-full max-w-[640px] text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-[20px] border border-[#32c47e] bg-[#e6f7ef] px-4 py-1.5 text-[13px] font-semibold text-[#247a4f]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#32c47e]" />
            Ikore · PMP MSD Competency Tool
          </div>

          <h1 className="mb-5 font-dm-serif text-[clamp(32px,6vw,52px)] leading-[1.15] text-[#1a3d2b]">
            Market Facilitator
            <br />
            <em className="text-[#2a9e67]">Competency Survey</em>
            <br />
            for Staff &amp; Field Teams
          </h1>

          <p className="mx-auto mb-10 max-w-[480px] text-lg text-[#6b7e78]">
            Based on the MSD guide: staged questions across six facilitator roles, radar charts at
            the end, and clear next-level behaviours where you can grow.
          </p>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[28px] font-extrabold text-[#247a4f]">{s.num}</div>
                <div className="mt-0.5 text-xs font-medium text-[#6b7e78]">{s.label}</div>
              </div>
            ))}
          </div>

          <Link
            to="/survey"
            className="inline-flex items-center gap-2.5 rounded-[16px] bg-[#1e5438] px-12 py-[18px] text-[17px] font-bold text-white shadow-[0_6px_24px_rgba(26,61,43,0.12)] transition-all hover:-translate-y-0.5 hover:bg-[#247a4f] hover:shadow-[0_16px_48px_rgba(26,61,43,0.16)]"
          >
            Start survey
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* <p className="mt-4 text-[13px] text-[#6b7e78]">
            Name &amp; phone only · See your last result if you return · No OTP
          </p> */}

          {/* <div className="mx-auto mt-14 grid max-w-[600px] grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[16px] border border-[#c4d0cc] bg-white p-5 text-center shadow-[0_2px_8px_rgba(26,61,43,0.08)]"
              >
                <div className="mb-2.5 text-[28px]" aria-hidden>
                  {card.icon}
                </div>
                <div className="text-[13px] font-bold text-[#1c2b2b]">{card.title}</div>
                <div className="mt-1 text-xs text-[#6b7e78]">{card.desc}</div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      <footer className="bg-[#1a3d2b] py-5 text-center text-[13px] text-white/50">
        <strong className="text-white/80">Ikore International Development Limited</strong>
        {" · "}
        Market Systems Development · &copy; {new Date().getFullYear()}
        {" · "}
        {/* <Link to="/admin/login" className="text-white/60 underline-offset-2 hover:text-white/90 hover:underline">
          Admin
        </Link> */}
      </footer>
    </div>
  );
}
