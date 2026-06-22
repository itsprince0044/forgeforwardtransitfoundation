'use client'

import { useBooking } from '@/context/BookingContext'
import { DONATE_URL } from '@/lib/links'

export default function HeroCTAs() {
  const { open } = useBooking()
  return (
    <div className="flex flex-wrap gap-4">
      <button
        onClick={open}
        className="inline-flex items-center gap-2 bg-foreground text-white font-semibold px-7 py-3.5 rounded hover:bg-slate-700 transition-colors text-sm tracking-wide"
      >
        Request a Ride
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border-2 border-gold text-gold font-semibold px-7 py-3.5 rounded hover:bg-gold hover:text-white transition-colors text-sm tracking-wide"
      >
        Support Our Mission
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 14s-5.5-3.6-5.5-7.3A3 3 0 018 5a3 3 0 015.5 1.7C13.5 10.4 8 14 8 14z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}
