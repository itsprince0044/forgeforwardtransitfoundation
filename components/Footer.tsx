import Link from "next/link"
import GalleryButton from "@/components/GalleryButton"
import Emblem from "@/components/Emblem"
import { DONATE_URL, SOCIAL_LINKS } from "@/lib/links"

const socials: { label: string; href: string; path: string }[] = [
  { label: "Facebook", href: SOCIAL_LINKS.facebook, path: "M13 7h2V4h-2c-1.7 0-3 1.3-3 3v2H8v3h2v6h3v-6h2l1-3h-3V7c0-.6.4-1 1-1z" },
  { label: "Instagram", href: SOCIAL_LINKS.instagram, path: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5-1.5a1 1 0 100 2 1 1 0 000-2z" },
  { label: "X", href: SOCIAL_LINKS.x, path: "M4 4l7 9-7 7h2l6-6 4.5 6H21l-7.3-9.7L20.5 4h-2l-5.6 5.6L8.8 4H4z" },
  { label: "TikTok", href: SOCIAL_LINKS.tiktok, path: "M14 4c.4 2.3 1.9 3.9 4 4.2v3c-1.5 0-2.9-.5-4-1.3V15a5.5 5.5 0 11-5.5-5.5c.3 0 .7 0 1 .1v3.1a2.5 2.5 0 101.5 2.3V4h3z" },
]

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/70">
      {/* Top campaign stripe */}
      <div className="service-stripes h-1 w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <Emblem className="w-10 h-10" />
            <div>
              <p className="font-display text-white font-bold uppercase tracking-wide leading-none">
                Forge Forward Transit Foundation
              </p>
              <p className="text-[11px] text-gold uppercase tracking-[0.22em] mt-1">Serving Those Who Serve</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
            <Link href="#services" className="hover:text-white transition-colors">How We Help</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <GalleryButton className="hover:text-white transition-colors uppercase tracking-wider">Our Impact</GalleryButton>
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light transition-colors">Donate</a>
          </nav>
        </div>

        {/* Social row */}
        <div className="mt-8 flex items-center justify-center sm:justify-start gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-9 h-9 rounded-sm border border-white/15 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/50 transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>
            &copy; {new Date().getFullYear()} Forge Forward Transit Foundation. A nonprofit serving those who serve.
          </p>
          <Link
            href="/admin/login"
            className="hover:text-white/70 transition-colors uppercase tracking-wider"
          >
            Coordinator login
          </Link>
        </div>
      </div>
    </footer>
  )
}
