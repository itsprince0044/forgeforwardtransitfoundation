'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Impact stories ────────────────────────────────────────────────────────────

interface Story {
  stat: string
  tag: string
  name: string
  description: string
}

const STORIES: Story[] = [
  {
    stat: 'Never Missed',
    tag: 'Medical',
    name: 'Rides to Care',
    description:
      'A soldier recovering from surgery had no way to reach weekly physical therapy. We made sure every appointment was covered — on time, every time, free of charge.',
  },
  {
    stat: 'Back to Work',
    tag: 'Employment',
    name: 'Steady Income',
    description:
      'When a military spouse landed a new job but had no car, daily rides bridged the gap until the family got back on their feet.',
  },
  {
    stat: 'Family First',
    tag: 'Community',
    name: 'Reunited',
    description:
      'Transportation barriers can isolate families on base. Our rides help service members get to school events, errands, and time that matters most.',
  },
  {
    stat: '0 DUIs',
    tag: 'Safety',
    name: 'Safe Rides Home',
    description:
      'A safe ride is always a phone call away. By removing the need to drive impaired, we help keep our service members and the community safe.',
  },
  {
    stat: 'Fort Riley',
    tag: 'Now Serving',
    name: 'Boots on the Ground',
    description:
      'Our mission is live and growing at Fort Riley, with the goal of expanding to bases nationwide so no soldier is ever left without a ride.',
  },
  {
    stat: 'Veteran-Led',
    tag: 'Our Roots',
    name: 'Built by Those Who Served',
    description:
      'Forge Forward was founded by people with firsthand military experience who understand the cost of being stranded — and refuse to let it happen to others.',
  },
  {
    stat: '100% Free',
    tag: 'Always',
    name: 'No Cost, Ever',
    description:
      'Every ride is provided at no charge to service members and their families, funded entirely by the generosity of our donors and community.',
  },
  {
    stat: 'Your Turn',
    tag: 'Get Involved',
    name: 'Drive the Mission',
    description:
      'Donate, volunteer, or spread the word. Every contribution puts another service member or family on the road to where they need to be.',
  },
]

// ── Icons ────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M14 4L7 11l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M8 4l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RouteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3" stroke="#B8860B" strokeWidth="1.8" />
      <circle cx="21" cy="21" r="3" stroke="white" strokeWidth="1.8" />
      <path d="M7 10v4a4 4 0 004 4h3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 3" />
    </svg>
  )
}

// ── Lightbox (story detail) ───────────────────────────────────────────────────

function Lightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const item = STORIES[index]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Close">
        <CloseIcon />
      </button>

      {/* Prev */}
      <button onClick={(e) => { e.stopPropagation(); onPrev() }} className="absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Previous">
        <ChevronLeft />
      </button>

      {/* Next */}
      <button onClick={(e) => { e.stopPropagation(); onNext() }} className="absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Next">
        <ChevronRight />
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl w-full text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-12">
          <p className="font-display text-5xl sm:text-6xl font-bold text-gold mb-3">{item.stat}</p>
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-px w-6 bg-gold" />
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">{item.tag}</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{item.name}</h3>
          <p className="text-white/70 leading-relaxed text-sm sm:text-base">{item.description}</p>
        </div>
        <p className="text-white/30 text-xs tracking-widest uppercase">{index + 1} / {STORIES.length}</p>
        <div className="flex items-center gap-1.5">
          {STORIES.map((_, i) => (
            <div key={i} className={`rounded-full transition-all ${i === index ? 'w-5 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-white/25'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Impact Modal ──────────────────────────────────────────────────────────────

export default function GalleryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handlePrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + STORIES.length) % STORIES.length))
  }, [])

  const handleNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % STORIES.length))
  }, [])

  // Close on Escape (only when lightbox is not open)
  useEffect(() => {
    if (!isOpen || lightboxIndex !== null) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, lightboxIndex, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset lightbox when modal closes
  useEffect(() => {
    if (!isOpen) setLightboxIndex(null)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Impact overlay */}
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950" id="impact">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-gold" />
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Mission in Action</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Our Impact</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close impact"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-white/40 text-sm text-center pt-5 px-4 shrink-0">
          Tap any card to read the story behind the mission.
        </p>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {STORIES.map((item, i) => (
              <button
                key={item.name}
                onClick={() => setLightboxIndex(i)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 hover:border-gold/40 transition-all duration-300 flex flex-col items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={`Read ${item.name}`}
              >
                {/* Number + Read hint */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-white/20 font-display text-2xl font-bold leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/10 group-hover:bg-gold/20 rounded-full px-2.5 py-1 transition-colors duration-300">
                    <span className="text-white/50 group-hover:text-gold text-[10px] font-semibold uppercase tracking-wide transition-colors duration-300">
                      Read
                    </span>
                  </div>
                </div>

                {/* Stat */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-gold/40 flex items-center justify-center transition-colors duration-300">
                    <RouteIcon />
                  </div>
                  <p className="font-display text-white text-lg font-bold leading-tight group-hover:text-gold transition-colors duration-300">
                    {item.stat}
                  </p>
                </div>

                {/* Name + tag */}
                <div className="w-full">
                  <span className="text-gold/50 text-[9px] font-bold uppercase tracking-widest">{item.tag}</span>
                  <p className="text-white font-display text-sm font-bold leading-tight mt-1">{item.name}</p>
                </div>

                {/* Gold glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 40px rgba(184,134,11,0.07)' }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox on top */}
      {lightboxIndex !== null && (
        <Lightbox
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  )
}
