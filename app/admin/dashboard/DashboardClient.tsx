'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BookingsTab from './BookingsTab'
import BarbersTab from './BarbersTab'
import SlotsTab from './SlotsTab'
import AnalyticsTab from './AnalyticsTab'
import ServicesTab from './ServicesTab'
import type { BookingWithSlot, Profile, Role, UserDetail, ServiceRow } from './types'

// ── Icons ─────────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 2.5l11 3.8v8.2c0 6.9-4.7 12.4-11 14.8C9.7 26.9 5 21.4 5 14.5V6.3l11-3.8z" fill="#16263B" stroke="#B8860B" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="12" cy="11.5" r="1.9" fill="#B8860B"/><circle cx="20" cy="20.5" r="1.9" fill="#fff"/><path d="M12 13.4v2.1a3 3 0 003 3h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
}
function LogOutIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function BookingsTabIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 3V2M11 3V2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function BarbersTabIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function SlotsTabIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function AnalyticsTabIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 12l3-4 3 2 3-5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/></svg>
}
function ServicesTabIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'bookings' | 'barbers' | 'slots' | 'analytics' | 'services'

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardClient({
  adminEmail,
  adminName,
  role,
  allBookings,
  openSlotsToday,
  today,
  initialBarbers,
  allUserDetails,
  otaAccess,
  allServices,
}: {
  adminEmail: string
  adminName: string | null
  role: Role
  allBookings: BookingWithSlot[]
  openSlotsToday: number
  today: string
  initialBarbers: Profile[]
  allUserDetails: UserDetail[]
  otaAccess: boolean
  allServices: ServiceRow[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('bookings')
  const [signingOut, setSigningOut] = useState(false)

  const isMaster = role === 'master'

  const tabs: { id: Tab; label: string; icon: React.ReactNode; masterOnly?: boolean }[] = [
    { id: 'bookings',  label: 'Ride Requests', icon: <BookingsTabIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsTabIcon />, masterOnly: true },
    { id: 'services',  label: 'Ride Types', icon: <ServicesTabIcon />,  masterOnly: true },
    { id: 'barbers',   label: 'Coordinators', icon: <BarbersTabIcon />, masterOnly: true },
    { id: 'slots',     label: 'Slots',     icon: <SlotsTabIcon />,     masterOnly: true },
  ]

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldIcon />
            <div>
              <p className="font-display text-lg font-bold text-foreground leading-none">Coordinator Dashboard</p>
              <p className="text-[11px] text-muted mt-0.5">Forge Forward Transit Foundation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-foreground">{adminName ?? adminEmail}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isMaster ? 'bg-gold/10 text-gold' : 'bg-blue-50 text-blue-600'}`}>
                {isMaster ? 'Master' : 'Admin'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 text-sm font-semibold text-foreground border-2 border-border px-4 py-2 rounded-lg hover:bg-stone-50 hover:border-foreground transition-colors disabled:opacity-50"
            >
              <LogOutIcon />
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab navigation ── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1" aria-label="Dashboard tabs">
            {tabs.filter(t => !t.masterOnly || isMaster).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted hover:text-foreground hover:border-stone-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={allBookings}
            openSlotsToday={openSlotsToday}
            today={today}
            role={role}
            otaAccess={otaAccess}
          />
        )}
        {activeTab === 'analytics' && isMaster && (
          <AnalyticsTab bookings={allBookings} />
        )}
        {activeTab === 'services' && isMaster && (
          <ServicesTab initialServices={allServices} />
        )}
        {activeTab === 'barbers' && isMaster && (
          <BarbersTab
            initialBarbers={initialBarbers}
            allUserDetails={allUserDetails}
          />
        )}
        {activeTab === 'slots' && isMaster && (
          <SlotsTab today={today} />
        )}
      </main>
    </div>
  )
}
