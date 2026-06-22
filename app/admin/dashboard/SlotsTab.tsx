'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Slot } from '@/types'

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function MiniSpinner() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3 3.5l.8 8a1 1 0 001 .9h4.4a1 1 0 001-.9l.8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
function CalendarIcon() {
  return <svg width="40" height="40" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 2v3M14 2v3M2 8h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}

export default function SlotsTab({ today }: { today: string }) {
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [newTime, setNewTime] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadSlots = useCallback(async (date: string) => {
    setLoading(true)
    setLoadError(null)
    setAddError(null)
    setDeleteError(null)
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('date', date)
      .order('time')
    setLoading(false)
    if (error) { setLoadError('Failed to load slots.'); return }
    setSlots(data ?? [])
  }, [])

  useEffect(() => { loadSlots(selectedDate) }, [selectedDate, loadSlots])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTime) return
    setAdding(true)
    setAddError(null)

    const { data, error } = await supabase
      .from('slots')
      .insert({ date: selectedDate, time: newTime, is_booked: false })
      .select()
      .single()

    setAdding(false)
    if (error) {
      setAddError(error.code === '23505' ? 'A slot already exists at that time.' : error.message)
      return
    }
    setSlots(prev => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)))
    setNewTime('')
  }

  async function handleDelete(slot: Slot) {
    if (slot.is_booked) return
    setDeletingId(slot.id)
    setDeleteError(null)
    const { error } = await supabase.from('slots').delete().eq('id', slot.id)
    setDeletingId(null)
    if (error) { setDeleteError('Failed to delete slot.'); return }
    setSlots(prev => prev.filter(s => s.id !== slot.id))
  }

  const available = slots.filter(s => !s.is_booked).length
  const booked = slots.filter(s => s.is_booked).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Time Slot Management</h2>
        <p className="text-sm text-muted mt-0.5">Add or remove pickup time slots. Changes appear instantly on the ride request form.</p>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
        />
        {selectedDate && (
          <p className="text-sm text-muted mt-2">{formatDateLong(selectedDate)}</p>
        )}
      </div>

      {/* Add slot form */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-bold text-foreground mb-4">Add a Slot</h3>
        <form onSubmit={handleAdd} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Time</label>
            <input
              type="time"
              required
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newTime}
            className="flex items-center gap-2 bg-gold text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-60"
          >
            {adding ? <><MiniSpinner />Adding…</> : <><PlusIcon />Add Slot</>}
          </button>
        </form>
        {addError && (
          <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4.5v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            {addError}
          </p>
        )}
      </div>

      {/* Slots list */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {loading ? 'Loading slots…' : `${slots.length} slot${slots.length !== 1 ? 's' : ''} on this date`}
            </p>
            {!loading && slots.length > 0 && (
              <p className="text-xs text-muted mt-0.5">{available} available · {booked} booked</p>
            )}
          </div>
          {loading && <MiniSpinner />}
        </div>

        {deleteError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 flex items-center justify-between">
            {deleteError}
            <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {loadError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">{loadError}</div>
        )}

        {!loading && slots.length === 0 && !loadError ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <CalendarIcon />
            <p className="mt-3 font-medium text-foreground">No slots for this date</p>
            <p className="text-xs mt-1">Use the form above to add time slots.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-foreground tabular-nums">{formatTime(slot.time)}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${slot.is_booked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${slot.is_booked ? 'bg-red-500' : 'bg-green-500'}`} />
                    {slot.is_booked ? 'Booked' : 'Available'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(slot)}
                  disabled={slot.is_booked || deletingId === slot.id}
                  title={slot.is_booked ? 'Cannot delete a booked slot' : 'Delete slot'}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deletingId === slot.id ? <MiniSpinner /> : <TrashIcon />}
                  {deletingId === slot.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
