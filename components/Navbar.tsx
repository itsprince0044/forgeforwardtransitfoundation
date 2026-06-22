"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useBooking } from "@/context/BookingContext"
import { useGallery } from "@/context/GalleryContext"
import { DONATE_URL } from "@/lib/links"
import Emblem from "@/components/Emblem"

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const navLinks = [
  { label: "How We Help", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Our Impact", href: "#impact" },
  { label: "About", href: "#about" },
]

const linkClass =
  "text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-foreground transition-colors relative after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 after:bg-gold after:transition-all hover:after:w-full"

export default function Navbar() {
  const { open: openBooking } = useBooking()
  const { open: openGallery } = useGallery()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      } border-b-2 border-foreground/10`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Forge Forward Transit Foundation — home"
          >
            <Emblem className="w-9 h-9" />
            <span className="font-display text-base sm:text-lg font-bold text-foreground uppercase tracking-wide leading-none">
              Forge Forward<span className="hidden sm:inline"> Transit Foundation</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) =>
              link.label === "Our Impact" ? (
                <button key="impact" onClick={openGallery} className={linkClass}>
                  Our Impact
                </button>
              ) : (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              )
            )}
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light transition-colors"
            >
              Donate
            </a>
            <button
              onClick={openBooking}
              className="ml-1 bg-foreground text-white text-xs font-bold uppercase tracking-[0.12em] px-5 py-3 rounded-sm hover:bg-slate-700 transition-colors"
            >
              Request a Ride
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 rounded text-muted hover:text-foreground transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } border-t border-border bg-white`}
      >
        <div className="px-4 pt-3 pb-5 flex flex-col gap-1">
          {navLinks.map((link) =>
            link.label === "Our Impact" ? (
              <button
                key="impact"
                onClick={() => { setOpen(false); openGallery() }}
                className="text-sm font-semibold uppercase tracking-wide text-muted hover:text-foreground py-2.5 border-b border-border/50 transition-colors text-left"
              >
                Our Impact
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold uppercase tracking-wide text-muted hover:text-foreground py-2.5 border-b border-border/50 transition-colors"
              >
                {link.label}
              </Link>
          ))}
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="text-sm font-bold uppercase tracking-wide text-gold py-2.5 border-b border-border/50 transition-colors"
          >
            Donate
          </a>
          <button
            onClick={() => { setOpen(false); openBooking() }}
            className="mt-3 bg-foreground text-white text-sm font-bold uppercase tracking-wide px-5 py-3 rounded-sm text-center hover:bg-slate-700 transition-colors w-full"
          >
            Request a Ride
          </button>
        </div>
      </div>
    </header>
  )
}
