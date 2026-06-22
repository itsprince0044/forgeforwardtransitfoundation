import BookButton from "@/components/BookButton"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Service } from "@/types"

// ── Icons ──────────────────────────────────────────────────────────────────────

function MedicalIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="7" width="22" height="18" rx="3" stroke="#B8860B" strokeWidth="2" />
      <path d="M16 12v8M12 16h8" stroke="#16263B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function WorkIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="22" height="15" rx="2.5" stroke="#B8860B" strokeWidth="2" />
      <path d="M12 11V8a2 2 0 012-2h4a2 2 0 012 2v3" stroke="#16263B" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="18" x2="27" y2="18" stroke="#16263B" strokeWidth="2" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="4" stroke="#B8860B" strokeWidth="2" />
      <circle cx="22" cy="13" r="3" stroke="#16263B" strokeWidth="2" />
      <path d="M4 26c0-4 3.5-7 7-7s7 3 7 7" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 26c.3-3 2.4-5 5-5 1.6 0 3 .8 4 2" stroke="#16263B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function VanIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 19V9h13l5 5h4a2 2 0 012 2v3" stroke="#B8860B" strokeWidth="2" strokeLinejoin="round" />
      <line x1="3" y1="19" x2="27" y2="19" stroke="#16263B" strokeWidth="2" />
      <circle cx="9" cy="22" r="2.5" stroke="#16263B" strokeWidth="2" />
      <circle cx="21" cy="22" r="2.5" stroke="#16263B" strokeWidth="2" />
    </svg>
  )
}

// Cycle through icons for any number of ride types
const ICONS = [<MedicalIcon key="m"/>, <WorkIcon key="w"/>, <CommunityIcon key="c"/>, <VanIcon key="v"/>]

// ── Component ──────────────────────────────────────────────────────────────────

export default async function Services() {
  // Fetch active ride types from the DB (server component). Guarded so a
  // missing or unreachable database never breaks the page — we fall back
  // to the static list below.
  let dbServices: Service[] = []
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', 1)
      .order('sort_order', { ascending: true })
    dbServices = (data ?? []) as Service[]
  } catch {
    dbServices = []
  }

  // Static fallback so the homepage always looks complete, even before the
  // database is seeded. Mirrors the seed in scripts/setup-complete.sql.
  const FALLBACK: Pick<Service, 'name' | 'description' | 'duration'>[] = [
    { name: 'Medical & VA Appointments', description: 'Safe, on-time rides to medical, dental, and VA appointments so recovery and care never wait.', duration: 'Local rides' },
    { name: 'Work & Errands', description: 'Transportation to work, interviews, groceries, and daily errands to keep life moving forward.', duration: 'Local rides' },
    { name: 'Community & Family', description: 'Rides to school events, base services, and family activities — because connection matters.', duration: 'Local rides' },
  ]

  const services = dbServices.length > 0
    ? dbServices
    : FALLBACK.map((s, i) => ({ ...s, id: `fallback-${i}`, price: 0, is_active: 1, sort_order: i, created_at: '' } as Service))

  // Mark the middle one (or second) as featured
  const featuredIndex = services.length >= 3 ? 1 : 0

  return (
    <section id="services" className="py-20 sm:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-3 w-1 bg-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-[0.22em]">Why Soldiers Use Forge Forward</span>
            <div className="h-3 w-1 bg-gold" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground uppercase mb-4">How We Help</h2>
          <p className="text-muted text-base leading-relaxed">
            Safe, affordable, and dependable transportation for soldiers and military
            families who may not have reliable access to a vehicle. Our mission is bigger
            than transportation — it&apos;s about improving morale, reducing isolation, creating
            opportunities, and building a stronger military community.
          </p>
        </div>

        {/* Cards grid */}
        <div className={`grid grid-cols-1 gap-6 ${services.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {services.map((service, idx) => {
            const featured = idx === featuredIndex && services.length >= 2
            return (
              <div
                key={service.id}
                className={`relative flex flex-col rounded-sm border p-7 transition-shadow hover:shadow-lg ${
                  featured ? 'bg-foreground border-foreground text-white shadow-xl' : 'bg-card border-border'
                }`}
              >
                {/* Top rank accent */}
                <div className="service-stripes absolute left-0 top-0 h-1 w-full opacity-90" />

                {featured && (
                  <span className="absolute top-5 right-5 bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                    Most Requested
                  </span>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-5 mt-2 ${featured ? 'bg-white/10' : 'bg-slate-50 border border-border'}`}>
                  {ICONS[idx % ICONS.length]}
                </div>

                {/* Name + description */}
                <h3 className={`font-display text-xl font-bold uppercase tracking-wide mb-1 ${featured ? 'text-white' : 'text-foreground'}`}>
                  {service.name}
                </h3>
                <p className={`text-sm leading-relaxed mb-5 ${featured ? 'text-white/60' : 'text-muted'}`}>
                  {service.description}
                </p>

                {/* Duration */}
                <ul className="flex flex-col gap-2 mb-7">
                  <li className={`flex items-center gap-2 text-sm ${featured ? 'text-white/80' : 'text-muted'}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke={featured ? '#D4A017' : '#B8860B'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {service.duration}
                  </li>
                </ul>

                {/* Cost + CTA */}
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className={`font-display text-2xl font-bold uppercase ${featured ? 'text-gold-light' : 'text-gold'}`}>
                      Free
                    </p>
                    <p className={`text-[11px] uppercase tracking-wide ${featured ? 'text-white/50' : 'text-muted'}`}>
                      No cost, ever
                    </p>
                  </div>
                  <BookButton
                    className={`text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors ${
                      featured
                        ? 'bg-gold text-white hover:bg-gold-light'
                        : 'border-2 border-foreground text-foreground hover:bg-foreground hover:text-white'
                    }`}
                  >
                    Request
                  </BookButton>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
