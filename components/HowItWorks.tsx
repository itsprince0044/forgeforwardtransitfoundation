import BookButton from "@/components/BookButton"

const STEPS = [
  {
    n: "01",
    title: "Request a Ride",
    body: "Submit a quick request — your pickup date, time, location, and where you need to go. Takes under two minutes.",
  },
  {
    n: "02",
    title: "Get Matched",
    body: "A coordinator confirms your ride and assigns a vetted driver. You'll get a confirmation by phone or email.",
  },
  {
    n: "03",
    title: "Ride With Honor",
    body: "Your driver arrives on time and gets you where you need to be — safely, reliably, and always free of charge.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-3 w-1 bg-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-[0.22em]">The Process</span>
            <div className="h-3 w-1 bg-gold" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground uppercase">How It Works</h2>
        </div>

        {/* Steps */}
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative flex flex-col bg-background border border-border rounded-sm p-7">
              {/* Big index */}
              <div className="flex items-center gap-3 mb-5">
                <span className="font-display text-5xl font-bold text-gold/25 leading-none">{step.n}</span>
                {/* forward chevron between steps */}
                {i < STEPS.length - 1 && (
                  <svg className="hidden sm:block ml-auto text-gold/40" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M5 4l7 7-7 7M11 4l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.body}</p>
              {/* bottom rank rule */}
              <div className="service-stripes h-1 w-12 mt-6 opacity-90" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <BookButton className="inline-flex items-center gap-2 bg-foreground text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-sm hover:bg-slate-700 transition-colors">
            Request a Ride
          </BookButton>
        </div>
      </div>
    </section>
  )
}
