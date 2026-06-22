import HeroCTAs from "@/components/HeroCTAs"
import Emblem from "@/components/Emblem"

export default function Hero() {
  return (
    <section className="relative overflow-hidden" id="hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row min-h-[84vh] lg:min-h-[80vh]">

          {/* Left — content */}
          <div className="flex flex-col justify-center py-16 lg:py-0 lg:w-[58%] lg:pr-12">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-7">
              <div className="h-3 w-1 bg-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-[0.22em]">
                Serving Those Who Serve
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground uppercase leading-[0.98] mb-6">
              No Soldier
              <br />
              Left <span className="text-gold">Behind.</span>
              <br />
              No Family Stranded.
            </h1>

            {/* Mission (verbatim) */}
            <p className="text-muted text-lg leading-relaxed max-w-lg mb-3">
              Ensuring that no soldier or military family feels stuck, isolated, or
              left behind because of transportation barriers.
            </p>
            <p className="text-foreground/80 text-sm font-semibold italic max-w-md mb-9">
              Creating mobility, connection, and hope — one ride at a time.
            </p>

            {/* CTAs */}
            <HeroCTAs />

            {/* Trust bar */}
            <div className="flex items-center gap-0 mt-12 pt-9 border-t border-border divide-x divide-border">
              {[
                { value: "100%", label: "Free of Charge" },
                { value: "Fort Riley", label: "Now Serving" },
                { value: "Veteran", label: "Founded & Led" },
              ].map((stat) => (
                <div key={stat.label} className="px-5 first:pl-0">
                  <p className="font-display text-2xl font-bold text-foreground uppercase tracking-wide">{stat.value}</p>
                  <p className="text-[11px] text-muted mt-0.5 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dark command panel (desktop only) */}
          <div className="hidden lg:flex lg:w-[42%] relative items-center justify-center bg-foreground command-grid overflow-hidden my-10 ml-8">
            {/* Campaign stripe down the left edge */}
            <div className="service-stripes absolute left-0 top-0 h-full w-1.5" />

            {/* Corner rank marks */}
            <div className="absolute top-10 right-10 w-16 h-16 border-t-2 border-r-2 border-gold/40" />
            <div className="absolute bottom-10 left-12 w-16 h-16 border-b-2 border-l-2 border-gold/40" />

            {/* Central crest + motto */}
            <div className="relative flex flex-col items-center gap-7 px-12 text-center">
              <Emblem className="w-40 h-40" />
              <div className="border-t border-white/10 pt-6 w-full">
                <p className="font-display text-white text-xl uppercase tracking-[0.18em] leading-snug">
                  Forge Forward
                </p>
                <p className="text-white/45 text-[11px] mt-2 tracking-[0.25em] uppercase">
                  Transit Foundation
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
