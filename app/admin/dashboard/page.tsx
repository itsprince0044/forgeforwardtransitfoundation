import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'
import type { Role, UserDetail, ServiceRow } from './types'

export const metadata = {
  title: 'Coordinator Dashboard — Forge Forward Transit Foundation',
  robots: 'noindex, nofollow',
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const today = new Date().toISOString().split('T')[0]

  // Role detection — fall back to 'master' for existing admin without a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role: Role = (profile?.role as Role) ?? 'master'

  // All bookings with slot info
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, slot:slots(date, time)')
    .order('created_at', { ascending: false })

  // Admin list (master uses this; admins don't see this tab)
  const { data: barbers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: false })

  // All services (master manages these)
  const { data: servicesData } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
  const allServices: ServiceRow[] = (servicesData ?? []) as ServiceRow[]

  // Widget access settings
  // Master fetches all rows (to manage each admin's access)
  // Admin fetches only their own rows (to check their own access)
  const { data: userDetails } = await supabase
    .from('user_details')
    .select('*')
    .order('created_at', { ascending: true })

  const allUserDetails: UserDetail[] = (userDetails ?? []) as UserDetail[]

  // Compute OTA access for the current admin user
  // Master always has access; admin checks their own user_details row
  const otaAccess =
    role === 'master' ||
    allUserDetails.some(
      d => d.user_id === user.id && d.description === 'Ride Requests' && d.status === 1
    )

  return (
    <DashboardClient
      adminEmail={user.email ?? ''}
      adminName={profile?.full_name ?? null}
      role={role}
      allBookings={bookings ?? []}
      today={today}
      initialBarbers={barbers ?? []}
      allUserDetails={allUserDetails}
      otaAccess={otaAccess}
      allServices={allServices}
    />
  )
}
