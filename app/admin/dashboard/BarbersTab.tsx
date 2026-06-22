'use client'

import { useState } from 'react'
import { createAdminAccount, deleteAdminAccount, upsertWidgetAccess } from '@/app/admin/actions'
import type { Profile, UserDetail } from './types'

// ── Icons ─────────────────────────────────────────────────────────────────────

function MiniSpinner() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3 3.5l.8 8a1 1 0 001 .9h4.4a1 1 0 001-.9l.8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function PeopleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.2" stroke="#B8860B" strokeWidth="1.6"/><circle cx="17" cy="9.5" r="2.4" stroke="#16263B" strokeWidth="1.6"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="#B8860B" strokeWidth="1.6" strokeLinecap="round"/><path d="M16 19c.2-2.4 1.9-4 4-4 1.3 0 2.4.6 3.2 1.6" stroke="#16263B" strokeWidth="1.6" strokeLinecap="round"/></svg>
}
function WidgetIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  loading,
  onChange,
}: {
  enabled: boolean
  loading: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      onClick={() => !loading && onChange(!enabled)}
      disabled={loading}
      aria-label={enabled ? 'Disable widget' : 'Enable widget'}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60 disabled:cursor-not-allowed ${
        enabled ? 'bg-gold' : 'bg-stone-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </span>
      )}
    </button>
  )
}

// ── Widget Row ────────────────────────────────────────────────────────────────

function WidgetRow({
  adminId,
  adminName,
  details,
}: {
  adminId: string
  adminName: string
  details: UserDetail[]
}) {
  const [localDetails, setLocalDetails] = useState<UserDetail[]>(details)
  const [toggling, setToggling] = useState<string | null>(null) // description being toggled
  const [toggleError, setToggleError] = useState<string | null>(null)

  // Ride Requests widget - find or default to OFF
  const otaDetail = localDetails.find(d => d.description === 'Ride Requests')
  const otaEnabled = otaDetail?.status === 1

  async function handleToggle(description: string, currentStatus: 0 | 1) {
    const newStatus: 0 | 1 = currentStatus === 1 ? 0 : 1
    setToggling(description)
    setToggleError(null)

    const { error } = await upsertWidgetAccess(adminId, description, newStatus)
    setToggling(null)

    if (error) {
      setToggleError(error)
      return
    }

    setLocalDetails(prev => {
      const exists = prev.find(d => d.description === description)
      if (exists) {
        return prev.map(d => d.description === description ? { ...d, status: newStatus } : d)
      }
      return [...prev, {
        id: crypto.randomUUID(),
        user_id: adminId,
        description,
        status: newStatus,
        created_at: new Date().toISOString(),
      }]
    })
  }

  return (
    <div className="px-5 py-3 bg-stone-50/60 border-t border-dashed border-border/60">
      <div className="flex items-center gap-2 mb-2.5">
        <WidgetIcon />
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Widget Access for {adminName}
        </span>
      </div>

      {toggleError && (
        <p className="text-xs text-red-600 mb-2">{toggleError}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Ride Requests toggle */}
        <div className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-2.5 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Ride Requests</p>
            <p className="text-[10px] text-muted">Dubai OTA booking widget</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${otaEnabled ? 'text-green-600' : 'text-stone-400'}`}>
              {otaEnabled ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch
              enabled={otaEnabled}
              loading={toggling === 'Ride Requests'}
              onChange={() => handleToggle('Ride Requests', otaDetail?.status ?? 0)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BarbersTab({
  initialBarbers,
  allUserDetails,
}: {
  initialBarbers: Profile[]
  allUserDetails: UserDetail[]
}) {
  const [barbers, setBarbers] = useState(initialBarbers)
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function toggleExpanded(id: string) {
    setExpandedWidgets(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    const { error } = await createAdminAccount(form.email.trim(), form.password, form.name.trim())
    setCreating(false)

    if (error) {
      setCreateError(error)
      return
    }

    const newAdmin: Profile = {
      id: crypto.randomUUID(),
      email: form.email.trim(),
      full_name: form.name.trim() || null,
      role: 'admin',
      created_at: new Date().toISOString(),
    }
    setBarbers(prev => [newAdmin, ...prev])
    setForm({ name: '', email: '', password: '' })
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setDeleteError(null)
    const { error } = await deleteAdminAccount(id)
    setDeletingId(null)
    setConfirmDeleteId(null)
    if (error) {
      setDeleteError(error)
    } else {
      setBarbers(prev => prev.filter(b => b.id !== id))
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Coordinators</h2>
          <p className="text-sm text-muted mt-0.5">{barbers.length} coordinator{barbers.length !== 1 ? 's' : ''} on your team</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setCreateError(null) }}
          className="flex items-center gap-2 bg-foreground text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
        >
          <PlusIcon />
          Add Coordinator
        </button>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-5">New Coordinator Account</h3>

          {createError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
              {createError}
              <button onClick={() => setCreateError(null)} className="text-red-400 hover:text-red-600 ml-3">✕</button>
            </div>
          )}

          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                placeholder="coordinator@forgeforwardtransit.org"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-foreground text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60"
              >
                {creating ? <><MiniSpinner /> Creating…</> : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setCreateError(null); setForm({ name: '', email: '', password: '' }) }}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete error ── */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 flex items-center justify-between">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Admins list ── */}
      {barbers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center py-16 text-muted">
          <PeopleIcon />
          <p className="mt-4 font-medium text-foreground">No coordinators yet</p>
          <p className="text-xs mt-1">Click &quot;Add Coordinator&quot; to create your first coordinator account.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">

          {/* ── Table header ── */}
          <div className="bg-stone-50 border-b border-border grid grid-cols-[1fr_1fr_auto_auto_auto] gap-0">
            {['Coordinator', 'Email', 'Added', 'Widgets', 'Action'].map(h => (
              <div key={h} className="text-left text-[11px] font-bold text-muted uppercase tracking-widest px-5 py-3">{h}</div>
            ))}
          </div>

          {/* ── Table rows ── */}
          {barbers.map((barber, i) => {
            const adminDetails = allUserDetails.filter(d => d.user_id === barber.id)
            const otaOn = adminDetails.find(d => d.description === 'Ride Requests')?.status === 1
            const isExpanded = expandedWidgets.has(barber.id)

            return (
              <div key={barber.id} className={`border-b border-border/50 last:border-0 ${i % 2 !== 0 ? 'bg-stone-50/30' : ''}`}>
                {/* Main row */}
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-0 hover:bg-stone-50/50 transition-colors">
                  {/* Admin name */}
                  <div className="px-5 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                      {(barber.full_name ?? barber.email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{barber.full_name ?? '—'}</span>
                  </div>
                  {/* Email */}
                  <div className="px-5 py-4 flex items-center text-sm text-muted">{barber.email}</div>
                  {/* Added */}
                  <div className="px-5 py-4 flex items-center text-sm text-muted whitespace-nowrap">{formatDate(barber.created_at)}</div>
                  {/* Widget status badge + toggle button */}
                  <div className="px-5 py-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      otaOn
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-stone-50 text-stone-500 border-stone-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${otaOn ? 'bg-green-500' : 'bg-stone-400'}`} />
                      OTA {otaOn ? 'On' : 'Off'}
                    </span>
                    <button
                      onClick={() => toggleExpanded(barber.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-lg hover:bg-gold/10 transition-colors"
                    >
                      <WidgetIcon />
                      {isExpanded ? 'Hide' : 'Manage'}
                    </button>
                  </div>
                  {/* Action */}
                  <div className="px-5 py-4 flex items-center">
                    {confirmDeleteId === barber.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 font-medium">Confirm?</span>
                        <button
                          onClick={() => handleDelete(barber.id)}
                          disabled={deletingId === barber.id}
                          className="text-xs font-semibold text-white bg-red-500 px-2.5 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === barber.id ? 'Deleting…' : 'Yes'}
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-muted hover:text-foreground">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(barber.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Widget panel — expandable */}
                {isExpanded && (
                  <WidgetRow
                    adminId={barber.id}
                    adminName={barber.full_name ?? barber.email}
                    details={adminDetails}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
