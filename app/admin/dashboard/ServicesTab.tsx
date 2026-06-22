'use client'

import { useState } from 'react'
import { createService, updateService, toggleServiceActive, deleteService } from '@/app/admin/actions'
import type { ServiceRow } from './types'

// ── Icons ─────────────────────────────────────────────────────────────────────
function MiniSpinner() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10.5L10.5 2l1.5 1.5L3.5 12H2v-1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3 3.5l.8 8a1 1 0 001 .9h4.4a1 1 0 001-.9l.8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ enabled, loading, onChange }: { enabled: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-60 ${enabled ? 'bg-gold' : 'bg-stone-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

// ── Service Form ──────────────────────────────────────────────────────────────
type FormState = { name: string; price: string; description: string; duration: string; sort_order: string }
const emptyForm: FormState = { name: '', price: '0', description: '', duration: 'Local rides', sort_order: '0' }

function ServiceForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial?: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  const [form, setForm] = useState<FormState>(initial ?? emptyForm)
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Ride Type Name <span className="text-red-500">*</span></label>
          <input type="text" required value={form.name} onChange={set('name')} placeholder="e.g. Medical & VA Appointments"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Availability</label>
          <input type="text" value={form.duration} onChange={set('duration')} placeholder="Local rides"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Sort Order</label>
          <input type="number" min="0" value={form.sort_order} onChange={set('sort_order')} placeholder="0"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={set('description')} placeholder="Short description…" rows={2}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.name}
          className="flex items-center gap-2 bg-foreground text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60">
          {saving ? <><MiniSpinner />Saving…</> : 'Save Ride Type'}
        </button>
        <button onClick={onCancel} className="text-sm font-medium text-muted hover:text-foreground transition-colors">Cancel</button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ServicesTab({ initialServices }: { initialServices: ServiceRow[] }) {
  const [services, setServices] = useState(initialServices)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleCreate(form: FormState) {
    setSaving(true); setSaveError(null)
    const { error } = await createService({
      name: form.name.trim(),
      price: 0, // rides are free
      description: form.description.trim(),
      duration: form.duration.trim() || 'Local rides',
      sort_order: parseInt(form.sort_order) || 0,
    })
    setSaving(false)
    if (error) { setSaveError(error); return }
    // Reload page to get fresh DB data with new ID
    window.location.reload()
  }

  async function handleUpdate(id: string, form: FormState) {
    setSaving(true); setSaveError(null)
    const { error } = await updateService(id, {
      name: form.name.trim(),
      price: 0, // rides are free
      description: form.description.trim(),
      duration: form.duration.trim() || 'Local rides',
      sort_order: parseInt(form.sort_order) || 0,
    })
    setSaving(false)
    if (error) { setSaveError(error); return }
    setServices(prev => prev.map(s => s.id === id ? {
      ...s,
      name: form.name.trim(),
      price: 0,
      description: form.description.trim(),
      duration: form.duration.trim() || 'Local rides',
      sort_order: parseInt(form.sort_order) || 0,
    } : s))
    setEditingId(null)
  }

  async function handleToggle(id: string, current: 0 | 1) {
    const next: 0 | 1 = current === 1 ? 0 : 1
    setTogglingId(id)
    const { error } = await toggleServiceActive(id, next)
    setTogglingId(null)
    if (!error) setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: next } : s))
  }

  async function handleDelete(id: string) {
    setDeletingId(id); setDeleteError(null)
    const { error } = await deleteService(id)
    setDeletingId(null); setConfirmDeleteId(null)
    if (error) { setDeleteError(error); return }
    setServices(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Ride Types</h2>
          <p className="text-sm text-muted mt-0.5">{services.length} ride type{services.length !== 1 ? 's' : ''} · changes reflect on the request form and homepage instantly</p>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setSaveError(null) }}
          className="flex items-center gap-2 bg-foreground text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors">
          <PlusIcon />Add Ride Type
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <ServiceForm saving={saving} error={saveError}
          onSave={handleCreate}
          onCancel={() => { setShowAdd(false); setSaveError(null) }} />
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 flex items-center justify-between">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center py-16 text-muted">
          <p className="font-medium text-foreground mt-2">No ride types yet</p>
          <p className="text-xs mt-1">Click &quot;Add Ride Type&quot; to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...services].sort((a, b) => a.sort_order - b.sort_order).map((service, i) => (
            <div key={service.id} className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden`}>
              {editingId === service.id ? (
                <div className="p-4">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Editing: {service.name}</p>
                  <ServiceForm
                    initial={{ name: service.name, price: String(service.price), description: service.description, duration: service.duration, sort_order: String(service.sort_order) }}
                    saving={saving} error={saveError}
                    onSave={form => handleUpdate(service.id, form)}
                    onCancel={() => { setEditingId(null); setSaveError(null) }} />
                </div>
              ) : (
                <div className={`flex items-center gap-4 px-5 py-4 ${i % 2 !== 0 ? 'bg-stone-50/30' : ''}`}>
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${service.is_active ? 'bg-green-500' : 'bg-stone-300'}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{service.name}</span>
                      <span className="font-display text-xs font-bold text-gold">Free</span>
                      <span className="text-[11px] text-muted bg-stone-100 px-2 py-0.5 rounded-full">{service.duration}</span>
                      {!service.is_active && (
                        <span className="text-[11px] font-bold text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full uppercase tracking-wide">Hidden</span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted mt-0.5 truncate">{service.description}</p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Active toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted hidden sm:block">{service.is_active ? 'Active' : 'Hidden'}</span>
                      <Toggle
                        enabled={service.is_active === 1}
                        loading={togglingId === service.id}
                        onChange={() => handleToggle(service.id, service.is_active)} />
                    </div>

                    {/* Edit */}
                    <button onClick={() => { setEditingId(service.id); setSaveError(null) }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground border border-border bg-white px-2.5 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
                      <EditIcon />Edit
                    </button>

                    {/* Delete */}
                    {confirmDeleteId === service.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-600 font-medium">Delete?</span>
                        <button onClick={() => handleDelete(service.id)} disabled={deletingId === service.id}
                          className="text-xs font-semibold text-white bg-red-500 px-2.5 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50">
                          {deletingId === service.id ? 'Deleting…' : 'Yes'}
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-muted hover:text-foreground">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(service.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 bg-white px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
