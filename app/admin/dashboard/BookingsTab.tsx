'use client'

import React, { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { BookingWithSlot, Role } from './types'

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-muted uppercase tracking-wide">{label}</p>
      <p className="text-foreground mt-0.5 break-words">{value || <span className="text-stone-400">—</span>}</p>
    </div>
  )
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// A request carries its own date/time; fall back to a legacy slot if present.
function rideDateOf(b: BookingWithSlot): string {
  return b.ride_date ?? b.slot?.date ?? ''
}
function rideTimeOf(b: BookingWithSlot): string {
  return b.pickup_time ?? b.slot?.time ?? ''
}

function ChevronToggle({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={`transition-transform ${open ? 'rotate-90' : ''}`}>
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 2v3M14 2v3M2 8h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function ClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function AlertIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4M10 13h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function MiniSpinner() {
  return <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}

function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{label}</p>
        <p className="font-display text-2xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed:  'bg-green-50  text-green-700  border-green-200',
    pending:    'bg-amber-50  text-amber-700  border-amber-200',
    cancelled:  'bg-red-50    text-red-700    border-red-200',
    completed:  'bg-blue-50   text-blue-700   border-blue-200',
  }
  const dots: Record<string, string> = {
    confirmed: 'bg-green-500', pending: 'bg-amber-500',
    cancelled: 'bg-red-500',  completed: 'bg-blue-500',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${styles[status] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? 'bg-stone-400'}`} />
      {status}
    </span>
  )
}

export default function BookingsTab({
  bookings: initialBookings,
  openSlotsToday,
  today,
  role,
  otaAccess = true,
}: {
  bookings: BookingWithSlot[]
  openSlotsToday: number
  today: string
  role: Role
  otaAccess?: boolean
}) {
  // Admin with no OTA access — show locked state
  if (role === 'admin' && !otaAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-border flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#6E6560" strokeWidth="1.5"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="#6E6560" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">Access Restricted</h3>
          <p className="text-sm text-muted max-w-sm">
            Your access to the Ride Requests widget has been disabled.
            Please contact the Master admin to re-enable it.
          </p>
        </div>
      </div>
    )
  }
  const [bookings, setBookings] = useState(initialBookings)
  const [filterDate, setFilterDate] = useState('')
  const [actioning, setActioning] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const todaysBk = bookings.filter(b => rideDateOf(b) === today)
    return {
      todaysBookings: todaysBk.length,
      totalRequests: bookings.length,
      todaysConfirmed: todaysBk.filter(b => b.status === 'confirmed' || b.status === 'completed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
    }
  }, [bookings, today])

  const filtered = useMemo(() => {
    const list = filterDate ? bookings.filter(b => rideDateOf(b) === filterDate) : [...bookings]
    return list.sort((a, b) => {
      const da = rideDateOf(a) + rideTimeOf(a)
      const db = rideDateOf(b) + rideTimeOf(b)
      return db.localeCompare(da)
    })
  }, [bookings, filterDate])

  async function updateStatus(id: string, status: string) {
    setActioning(id + ':' + status)
    setActionError(null)
    const updateData: Record<string, unknown> = { status }
    const { error } = await supabase.from('bookings').update(updateData).eq('id', id)
    if (error) {
      setActionError('Failed to update booking. Please try again.')
    } else {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    }
    setActioning(null)
  }

  function ActionButtons({ booking }: { booking: BookingWithSlot }) {
    const { id, status } = booking
    const isActioning = actioning?.startsWith(id)

    if (status === 'completed' || status === 'cancelled') {
      return <span className="text-xs text-muted">—</span>
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Confirm: master only, only for pending */}
        {role === 'master' && status === 'pending' && (
          <button
            onClick={() => updateStatus(id, 'confirmed')}
            disabled={!!actioning}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-foreground text-white px-2.5 py-1.5 rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {actioning === id + ':confirmed' ? <MiniSpinner /> : <CheckIcon />}
            Confirm
          </button>
        )}
        {/* Complete: both roles, only for confirmed */}
        {status === 'confirmed' && (
          <button
            onClick={() => updateStatus(id, 'completed')}
            disabled={!!actioning}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actioning === id + ':completed' ? <MiniSpinner /> : <CheckIcon />}
            Complete
          </button>
        )}
        {/* Cancel: both roles, pending or confirmed */}
        {(status === 'pending' || status === 'confirmed') && (
          <button
            onClick={() => updateStatus(id, 'cancelled')}
            disabled={!!actioning}
            className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-red-200 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {actioning === id + ':cancelled' ? <MiniSpinner /> : null}
            Cancel
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">
          Today — {formatDate(today)}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Rides" value={stats.todaysBookings}
            sub={`${stats.todaysBookings} ride request${stats.todaysBookings !== 1 ? 's' : ''}`}
            icon={<CalendarIcon />} accent="bg-blue-50 text-blue-600" />
          <StatCard label="Total Requests" value={stats.totalRequests} sub="All time"
            icon={<ClockIcon />} accent="bg-green-50 text-green-600" />
          <StatCard label="Confirmed Rides" value={stats.todaysConfirmed} sub="Confirmed + completed"
            icon={<CalendarIcon />} accent="bg-amber-50 text-amber-600" />
          <StatCard label="Pending Requests" value={stats.pending} sub="Awaiting confirmation"
            icon={<AlertIcon />} accent="bg-red-50 text-red-500" />
        </div>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700">
          {actionError}
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Bookings table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Bookings</h2>
            <p className="text-sm text-muted mt-0.5">
              {filterDate
                ? `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} on ${formatDate(filterDate)}`
                : `${filtered.length} total booking${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="date-filter" className="text-xs font-semibold text-muted uppercase tracking-wide shrink-0">Filter by date</label>
            <input
              id="date-filter"
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-xs font-semibold text-muted hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <CalendarIcon />
              <p className="mt-3 font-medium">
                {filterDate ? `No ride requests for ${formatDate(filterDate)}` : 'No ride requests yet'}
              </p>
              <p className="text-xs mt-1">
                {filterDate ? 'Try a different date or clear the filter.' : 'Requests will appear here once riders start booking.'}
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="bg-stone-50 border-b border-border">
                  {['', 'Time', 'Date', 'Rider', 'Phone', 'Reason', 'Pickup → Destination', 'Status', 'Action'].map((h, hi) => (
                    <th key={hi} className="text-left text-[11px] font-bold text-muted uppercase tracking-widest px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking, i) => {
                  const open = expandedId === booking.id
                  const d = rideDateOf(booking)
                  const t = rideTimeOf(booking)
                  return (
                    <React.Fragment key={booking.id}>
                      <tr className={`border-b border-border/50 hover:bg-stone-50/50 transition-colors ${open ? 'bg-amber-50/30' : i % 2 !== 0 ? 'bg-stone-50/30' : ''}`}>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setExpandedId(open ? null : booking.id)}
                            className="text-muted hover:text-foreground transition-colors"
                            aria-label={open ? 'Hide details' : 'Show details'}
                          >
                            <ChevronToggle open={open} />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-foreground whitespace-nowrap">{t ? formatTime(t) : '—'}</td>
                        <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">{d ? formatDate(d) : '—'}</td>
                        <td className="px-4 py-4 text-sm font-medium text-foreground">{booking.customer_name}</td>
                        <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">{booking.phone}</td>
                        <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">{booking.service}</td>
                        <td className="px-4 py-4 text-sm text-foreground">
                          {booking.pickup_location || booking.destination
                            ? `${booking.pickup_location ?? '—'} → ${booking.destination ?? '—'}`
                            : <span className="text-muted">—</span>}
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-4 py-4"><ActionButtons booking={booking} /></td>
                      </tr>
                      {open && (
                        <tr className="bg-amber-50/30 border-b border-border/50">
                          <td />
                          <td colSpan={8} className="px-4 pb-5 pt-1">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm bg-white border border-border rounded-sm p-4">
                              <Detail label="Email" value={booking.email} />
                              <Detail label="Rider Type" value={booking.rider_type} />
                              <Detail label="DoD ID" value={booking.dod_id} />
                              <Detail label="Other Passengers" value={booking.passengers} />
                              <Detail label="Pickup Location" value={booking.pickup_location} />
                              <Detail label="Destination" value={booking.destination} />
                              <Detail label="Special Notes" value={booking.special_notes} />
                              <Detail label="E-Signature" value={booking.signature} />
                              <Detail label="Agreement" value={booking.agreement ? 'Accepted' : 'Not accepted'} />
                              <Detail label="Submitted" value={new Date(booking.created_at).toLocaleString('en-US')} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
