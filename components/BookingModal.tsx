'use client'

import { useState, useEffect } from 'react'
import { createRideRequest } from '@/lib/booking'

type Step = 0 | 1 | 2 | 3 // 0 Your Info · 1 Ride Details · 2 Agreement · 3 Success

// ── Form options (from the official Ride Request form) ───────────────────────

const RIDER_TYPES = ['Single Soldier', 'Military Family', 'Other']
const REASONS = [
  'Grocery Shopping',
  'Medical Appointment',
  'Airport',
  'Personal Errands',
  'Family Needs',
  'Other',
]
const AGREEMENTS = [
  'I understand Forge Forward Transit Foundation is a nonprofit and rides are provided free of charge, based on driver availability.',
  'I agree to treat my driver and others with respect, and to be ready at my pickup location at the scheduled time.',
  'I understand rides are not guaranteed and depend on availability, and that each additional passenger must submit their own request.',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function formatDateLong(iso: string): string {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Icons ─────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
function ChevronLeft() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Spinner({ className = '' }: { className?: string }) {
  return <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}
function CheckCircle() {
  return <svg width="60" height="60" viewBox="0 0 56 56" fill="none" aria-hidden="true"><circle cx="28" cy="28" r="28" fill="#B8860B" fillOpacity="0.12" /><circle cx="28" cy="28" r="20" fill="#B8860B" /><path d="M19 28l7 7 11-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

// ── Field primitives ──────────────────────────────────────────────────────────

const labelCls = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide'
const inputCls = 'w-full border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors'

function Req() {
  return <span className="text-red-500">*</span>
}

function Field({ label, required, help, children }: {
  label: string; required?: boolean; help?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelCls}>{label} {required && <Req />}</label>
      {help && <p className="text-[11px] text-muted -mt-1 mb-1.5">{help}</p>}
      {children}
    </div>
  )
}

function ChoiceGroup({ options, value, onChange, columns = 1 }: {
  options: string[]; value: string; onChange: (v: string) => void; columns?: number
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {options.map(opt => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`text-left text-sm px-4 py-3 rounded-sm border-2 transition-all ${
              active ? 'border-foreground bg-foreground text-white font-semibold' : 'border-border bg-white text-foreground hover:border-foreground/40'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Your Info', 'Ride Details', 'Agreement']

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center px-6 py-4 border-b border-border">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 min-w-[2rem]">
            <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold transition-colors ${i < step ? 'bg-gold text-white' : i === step ? 'bg-foreground text-white' : 'bg-stone-100 text-stone-400'}`}>
              {i < step ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (i + 1)}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase ${i <= step ? 'text-foreground' : 'text-stone-400'}`}>{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 mb-4 transition-colors ${i < step ? 'bg-gold' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Form state ─────────────────────────────────────────────────────────────────

interface FormValues {
  email: string
  fullName: string
  phone: string
  riderType: string
  dodId: string
  rideDate: string
  pickupTime: string
  pickupLocation: string
  destination: string
  reason: string
  passengers: string
  specialNotes: string
  agree: boolean[]
  signature: string
}

const EMPTY: FormValues = {
  email: '', fullName: '', phone: '', riderType: '', dodId: '',
  rideDate: '', pickupTime: '', pickupLocation: '', destination: '',
  reason: '', passengers: '', specialNotes: '',
  agree: [false, false, false], signature: '',
}

// ── Main modal ──────────────────────────────────────────────────────────────────

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<FormValues>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (patch: Partial<FormValues>) => setForm(f => ({ ...f, ...patch }))

  // Reset after close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => { setStep(0); setForm(EMPTY); setError(null); setSubmitting(false) }, 250)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Escape + scroll lock
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  function validateStep(s: Step): string | null {
    if (s === 0) {
      if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid email address.'
      if (form.fullName.trim().length < 2) return 'Please enter your full name.'
      if (form.phone.trim().length < 7) return 'Please enter a valid phone number.'
      if (!form.riderType) return 'Please select whether you are a single soldier, military family, or other.'
      if (!form.dodId.trim()) return 'Please enter your DoD ID number.'
    }
    if (s === 1) {
      if (!form.rideDate) return 'Please choose the date of your requested ride.'
      if (form.rideDate < todayKey()) return 'The ride date cannot be in the past.'
      if (!form.pickupTime) return 'Please choose a pickup time.'
      if (!form.pickupLocation.trim()) return 'Please enter your pickup location.'
      if (!form.destination.trim()) return 'Please enter your destination.'
      if (!form.reason) return 'Please select a reason for transportation.'
      if (!form.passengers) return 'Please let us know if anyone else will be riding with you.'
    }
    if (s === 2) {
      if (!form.agree.every(Boolean)) return 'Please acknowledge all parts of the transportation agreement.'
      if (!form.signature.trim()) return 'Please type your full name as an electronic signature.'
      if (form.signature.trim().toLowerCase() !== form.fullName.trim().toLowerCase())
        return 'Your signature must match the full name you entered.'
    }
    return null
  }

  function next() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError(null)
    setStep(s => (s + 1) as Step)
  }

  function back() {
    setError(null)
    setStep(s => (s - 1) as Step)
  }

  async function handleSubmit() {
    const err = validateStep(2)
    if (err) { setError(err); return }
    setSubmitting(true); setError(null)
    const { error: submitErr } = await createRideRequest({
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      riderType: form.riderType,
      dodId: form.dodId.trim(),
      rideDate: form.rideDate,
      pickupTime: form.pickupTime,
      pickupLocation: form.pickupLocation.trim(),
      destination: form.destination.trim(),
      reason: form.reason,
      passengers: form.passengers,
      specialNotes: form.specialNotes.trim() || undefined,
      agreement: form.agree.every(Boolean),
      signature: form.signature.trim(),
    })
    setSubmitting(false)
    if (submitErr) { setError('Something went wrong submitting your request. Please try again.'); return }
    setStep(3)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step !== 3 ? onClose : undefined} aria-hidden="true" />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-sm rounded-t-2xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* campaign stripe */}
        <div className="service-stripes h-1 w-full shrink-0" />

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-wide leading-tight">Request a Ride</h2>
            {step !== 3 && (
              <p className="text-[11px] text-muted mt-0.5">Free transportation within ~25 miles of Fort Riley.</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-sm text-muted hover:text-foreground hover:bg-stone-100 transition-colors" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {step !== 3 && <StepIndicator step={step} />}

        <div className="px-6 py-6 flex-1">
          {/* ── Step 0 — Your Info ── */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Email Address" required>
                <input type="email" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="you@example.com" className={inputCls} />
              </Field>
              <Field label="Full Name" required>
                <input type="text" value={form.fullName} onChange={e => set({ fullName: e.target.value })} placeholder="First and last name" className={inputCls} />
              </Field>
              <Field label="Phone Number" required>
                <input type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })} placeholder="+1 (555) 000-0000" className={inputCls} />
              </Field>
              <Field label="Are you" required>
                <ChoiceGroup options={RIDER_TYPES} value={form.riderType} onChange={v => set({ riderType: v })} columns={2} />
              </Field>
              <Field label="DoD ID Number (Full DODID)" required>
                <input type="text" inputMode="numeric" value={form.dodId} onChange={e => set({ dodId: e.target.value })} placeholder="10-digit DoD ID" className={inputCls} />
              </Field>
            </div>
          )}

          {/* ── Step 1 — Ride Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Ride" required>
                  <input type="date" min={todayKey()} value={form.rideDate} onChange={e => set({ rideDate: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Pickup Time" required>
                  <input type="time" value={form.pickupTime} onChange={e => set({ pickupTime: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Pickup Location" required help="Include full address with city and zip code.">
                <input type="text" value={form.pickupLocation} onChange={e => set({ pickupLocation: e.target.value })} placeholder="123 Main St, Junction City, KS 66441" className={inputCls} />
              </Field>
              <Field label="Destination" required help="Include full address with city and zip code.">
                <input type="text" value={form.destination} onChange={e => set({ destination: e.target.value })} placeholder="Address you need to reach" className={inputCls} />
              </Field>
              <Field label="Reason for Transportation" required>
                <ChoiceGroup options={REASONS} value={form.reason} onChange={v => set({ reason: v })} columns={2} />
              </Field>
              <Field label="Will anyone else be riding with you?" required help="Each passenger must submit their own request for safety and accountability.">
                <ChoiceGroup options={['Yes', 'No']} value={form.passengers} onChange={v => set({ passengers: v })} columns={2} />
              </Field>
              <Field label="Special Notes or Accommodations Needed">
                <textarea rows={3} value={form.specialNotes} onChange={e => set({ specialNotes: e.target.value })} placeholder="e.g., wheelchair access, time constraints, car seat needed" className={`${inputCls} resize-none`} />
              </Field>
            </div>
          )}

          {/* ── Step 2 — Agreement ── */}
          {step === 2 && (
            <div className="space-y-5">
              <Field label="Transportation Agreement" required>
                <div className="space-y-2.5">
                  {AGREEMENTS.map((text, i) => (
                    <label key={i} className={`flex items-start gap-3 p-3 rounded-sm border-2 cursor-pointer transition-colors ${form.agree[i] ? 'border-gold bg-amber-50/40' : 'border-border hover:border-foreground/30'}`}>
                      <input
                        type="checkbox"
                        checked={form.agree[i]}
                        onChange={e => {
                          const a = [...form.agree]; a[i] = e.target.checked; set({ agree: a })
                        }}
                        className="mt-0.5 w-4 h-4 accent-gold shrink-0"
                      />
                      <span className="text-sm text-foreground leading-snug">{text}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Electronic Signature" required help="Type your full name to acknowledge and agree to the terms.">
                <input type="text" value={form.signature} onChange={e => set({ signature: e.target.value })} placeholder={form.fullName || 'Your full name'} className={inputCls} />
              </Field>
            </div>
          )}

          {/* ── Step 3 — Success ── */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-4 gap-5">
              <CheckCircle />
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-wide mb-2">Request Received</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Thank you, <span className="font-semibold text-foreground">{form.fullName}</span>. Your ride request has been
                  sent to our coordinators. <span className="font-semibold text-foreground">A coordinator will contact you
                  {form.phone ? ` at ${form.phone}` : form.email ? ` at ${form.email}` : ''} to confirm your ride.</span>
                </p>
              </div>
              <div className="w-full bg-stone-50 border border-border rounded-sm px-5 py-4 text-sm space-y-2 text-left">
                {[
                  ['Date', formatDateLong(form.rideDate)],
                  ['Pickup Time', formatTime(form.pickupTime)],
                  ['Reason', form.reason],
                  ['Pickup', form.pickupLocation],
                  ['Destination', form.destination],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted shrink-0">{label}</span>
                    <span className="font-medium text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted">Rides are provided free of charge, based on availability.</p>
              <button onClick={onClose} className="w-full border-2 border-foreground text-foreground font-bold uppercase tracking-wider py-3 rounded-sm hover:bg-foreground hover:text-white transition-colors text-sm">
                Done
              </button>
            </div>
          )}

          {/* Error */}
          {error && step !== 3 && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* Footer nav */}
        {step !== 3 && (
          <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button onClick={back} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground transition-colors">
                <ChevronLeft /> Back
              </button>
            ) : <span />}

            {step < 2 ? (
              <button onClick={next} className="bg-foreground text-white font-bold uppercase tracking-wider text-sm px-7 py-3 rounded-sm hover:bg-slate-700 transition-colors">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="inline-flex items-center justify-center gap-2 bg-gold text-white font-bold uppercase tracking-wider text-sm px-7 py-3 rounded-sm hover:bg-gold-light transition-colors disabled:opacity-60">
                {submitting ? <><Spinner className="h-4 w-4 text-white" /> Submitting…</> : 'Submit Request'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
