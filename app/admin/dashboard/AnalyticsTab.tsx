'use client'

import { useMemo } from 'react'
import type { BookingWithSlot } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function TrendIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 14l5-5 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 6h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function UsersIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M1 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="14" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M17 17c0-2.761-1.343-4-3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  period,
  count,
  revenue,
  accent,
}: {
  period: string
  count: number
  revenue: number
  accent: { bg: string; text: string; border: string }
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
      <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border w-fit ${accent.bg} ${accent.text} ${accent.border}`}>
        <TrendIcon />
        {period}
      </div>
      <div>
        <p className="font-display text-5xl font-bold text-foreground leading-none">{count}</p>
        <p className="text-sm text-muted mt-1.5">ride request{count !== 1 ? 's' : ''}</p>
      </div>
      <div className="pt-4 border-t border-border">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-0.5">Rides Provided</p>
        <p className="font-display text-xl font-bold text-gold">{revenue.toLocaleString()}</p>
        <p className="text-xs text-muted">confirmed + completed</p>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AnalyticsTab({ bookings }: { bookings: BookingWithSlot[] }) {
  const today = toDateKey(new Date())

  const weekAgoDate = new Date()
  weekAgoDate.setDate(weekAgoDate.getDate() - 6) // last 7 days inclusive
  const weekAgo = toDateKey(weekAgoDate)

  const now = new Date()
  const monthStart = toDateKey(new Date(now.getFullYear(), now.getMonth(), 1))

  const { daily, weekly, monthly, repeating } = useMemo(() => {
    const paidStatuses = ['confirmed', 'completed']

    const inRange = (date: string | undefined, from: string, to: string) =>
      !!date && date >= from && date <= to

    // A request carries its own ride_date; fall back to a legacy slot if present.
    const dateOf = (b: BookingWithSlot) => b.ride_date ?? b.slot?.date ?? undefined

    const daily   = bookings.filter(b => dateOf(b) === today)
    const weekly  = bookings.filter(b => inRange(dateOf(b), weekAgo, today))
    const monthly = bookings.filter(b => inRange(dateOf(b), monthStart, today))

    // Count of confirmed/completed rides (rides are free, so we track rides, not revenue)
    const revenue = (list: BookingWithSlot[]) =>
      list.filter(b => paidStatuses.includes(b.status)).length

    // Repeating customers — grouped by phone number
    const phoneMap = new Map<string, BookingWithSlot[]>()
    bookings.forEach(b => {
      const key = b.phone.trim()
      if (!phoneMap.has(key)) phoneMap.set(key, [])
      phoneMap.get(key)!.push(b)
    })

    const repeating = Array.from(phoneMap.entries())
      .filter(([, bks]) => bks.length > 1)
      .map(([phone, bks]) => {
        const sorted = [...bks].sort((a, b) =>
          (b.slot?.date ?? '') > (a.slot?.date ?? '') ? 1 : -1
        )
        return {
          phone,
          name: sorted[0].customer_name,
          count: bks.length,
          lastVisit: sorted[0].slot?.date ?? '',
          services: [...new Set(bks.map(b => b.service))],
          totalSpent: bks.filter(b => paidStatuses.includes(b.status)).length,
        }
      })
      .sort((a, b) => b.count - a.count)

    return {
      daily:   { count: daily.length,   revenue: revenue(daily) },
      weekly:  { count: weekly.length,  revenue: revenue(weekly) },
      monthly: { count: monthly.length, revenue: revenue(monthly) },
      repeating,
    }
  }, [bookings, today, weekAgo, monthStart])

  const accents = {
    blue:  { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
    green: { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
  }

  return (
    <div className="space-y-10">

      {/* ── Ride Overview ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest">Ride Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard period="Today"      count={daily.count}   revenue={daily.revenue}   accent={accents.blue} />
          <StatCard period="This Week"  count={weekly.count}  revenue={weekly.revenue}  accent={accents.amber} />
          <StatCard period="This Month" count={monthly.count} revenue={monthly.revenue} accent={accents.green} />
        </div>
      </div>

      {/* ── Repeating Customers ── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <UsersIcon />
              <h2 className="font-display text-xl font-bold text-foreground">Frequent Riders</h2>
            </div>
            <p className="text-sm text-muted">
              {repeating.length > 0
                ? `${repeating.length} rider${repeating.length !== 1 ? 's' : ''} have requested more than one ride`
                : 'Riders who request more than once will appear here'}
            </p>
          </div>
          {repeating.length > 0 && (
            <div className="bg-gold/10 border border-gold/20 rounded-xl px-4 py-2 text-center">
              <p className="font-display text-2xl font-bold text-gold">{repeating.length}</p>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">Loyal</p>
            </div>
          )}
        </div>

        {repeating.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted gap-2">
            <UsersIcon />
            <p className="font-medium text-foreground mt-2">No frequent riders yet</p>
            <p className="text-xs">They&apos;ll appear here once someone requests more than one ride.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-stone-50 border-b border-border">
                  {['Rider', 'Phone', 'Rides', 'Last Ride', 'Ride Types', 'Completed'].map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-muted uppercase tracking-widest px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repeating.map((c, i) => (
                  <tr
                    key={c.phone}
                    className={`border-b border-border/50 last:border-0 hover:bg-stone-50/50 transition-colors ${i % 2 !== 0 ? 'bg-stone-50/30' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                          {c.name[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted whitespace-nowrap">{c.phone}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full">
                        {c.count}×
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted whitespace-nowrap">
                      {c.lastVisit ? formatDate(c.lastVisit) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted max-w-[180px]">
                      <span className="line-clamp-1">{c.services.join(', ')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-display font-bold text-sm text-gold">{c.totalSpent}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
