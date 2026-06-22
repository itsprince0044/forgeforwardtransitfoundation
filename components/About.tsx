import { DONATE_URL } from "@/lib/links"
import Emblem from "@/components/Emblem"

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl sm:text-4xl font-bold text-gold uppercase">{value}</p>
      <p className="text-[11px] text-white/50 mt-1 tracking-wider uppercase">{label}</p>
    </div>
  )
}

export default function About() {
  return (
    <section id="about" className="relative bg-foreground command-grid text-white py-20 sm:py-28 overflow-hidden">
      {/* top campaign stripe */}
      <div className="service-stripes absolute top-0 left-0 h-1 w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Mission copy */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-3 w-1 bg-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-[0.22em]">Our Mission</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase mb-6 leading-[1.05]">
              No soldier or family should feel stuck, isolated, or left behind.
            </h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                Forge Forward Transit Foundation was founded by people with firsthand
                military experience who saw a simple, costly problem: transportation
                barriers leave service members and their families isolated — missing
                medical appointments, job opportunities, and time with loved ones.
              </p>
              <p>
                We provide free and reduced-cost rides that restore mobility, reduce
                isolation, and help prevent DUI-related incidents on and around base.
                We&apos;re proudly serving <span className="text-white font-semibold">Fort Riley</span> today,
                with a mission to expand nationwide.
              </p>
            </div>

            <div className="mt-8 mb-8 border-l-2 border-gold pl-4">
              <p className="font-display text-lg uppercase tracking-wide text-white">
                Creating mobility, connection, and hope — one ride at a time.
              </p>
            </div>

            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold text-white font-bold uppercase tracking-wider px-7 py-4 rounded-sm hover:bg-gold-light transition-colors text-sm"
            >
              Support Our Mission on GoFundMe
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Stats / values panel */}
          <div className="rounded-sm border border-white/10 bg-white/[0.03] p-8 sm:p-10">
            <div className="flex justify-center mb-8">
              <Emblem className="w-20 h-20" />
            </div>
            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-white/10">
              <StatBlock value="100%" label="Free for Service Members" />
              <StatBlock value="Fort Riley" label="Currently Serving" />
              <StatBlock value="Veteran" label="Founded & Led" />
              <StatBlock value="Nationwide" label="Expansion Goal" />
            </div>
            <ul className="mt-8 space-y-4">
              {[
                "Safe rides to medical, dental, and VA appointments",
                "Transportation to work, interviews, and errands",
                "Connection to community, family, and base services",
                "Reducing isolation and DUI-related incidents",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0">
                    <rect x="1" y="1" width="16" height="16" rx="2" fill="#B8860B" fillOpacity="0.18" />
                    <path d="M5 9.2l2.6 2.6L13 6.5" stroke="#D4A017" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
