import { DONATE_URL } from "@/lib/links"

// Slim utility strip above the navbar — sets a disciplined, official tone.
export default function CommandBar() {
  return (
    <div className="bg-foreground text-white/80 text-[11px]">
      <div className="service-stripes h-0.5 w-full" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
        <p className="font-semibold uppercase tracking-[0.22em] text-white/70">
          Serving Those Who Serve
        </p>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-white/50 uppercase tracking-wider">
            Now serving Fort Riley
          </span>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold uppercase tracking-wider text-gold hover:text-gold-light transition-colors"
          >
            Donate ›
          </a>
        </div>
      </div>
    </div>
  )
}
