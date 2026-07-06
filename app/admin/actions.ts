'use server'

import { createServiceClient } from '@/lib/supabase-service'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notifyRideConfirmed, notifyRideCancelled, type NotifyBooking } from '@/lib/notify'

// ── Ride Request status updates (coordinators) ───────────────────────────────

/**
 * Updates a ride request's status and notifies the rider by email + SMS when
 * the ride is confirmed or cancelled. Requires an authenticated coordinator.
 */
export async function updateRideStatus(
  id: string,
  status: 'confirmed' | 'completed' | 'cancelled'
): Promise<{ error: string | null }> {
  // Auth check — only signed-in coordinators may change status
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Not authorized.' }

  const supabase = createServiceClient()
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { error: error.message }

  // Notify the rider — never let a failed message fail the status update.
  try {
    const b: NotifyBooking = updated
    if (status === 'confirmed') await notifyRideConfirmed(b)
    else if (status === 'cancelled') await notifyRideCancelled(b)
  } catch (e) {
    console.error('[updateRideStatus] notification failed (status still updated):', e)
  }

  return { error: null }
}

// ── Services Management (Master only) ────────────────────────────────────────

export async function createService(payload: {
  name: string
  price: number
  description: string
  duration: string
  sort_order: number
}): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('services').insert({ ...payload, is_active: 1 })
  if (error) return { error: error.message }
  return { error: null }
}

export async function updateService(
  id: string,
  payload: { name?: string; price?: number; description?: string; duration?: string; sort_order?: number }
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('services').update(payload).eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function toggleServiceActive(
  id: string,
  is_active: 0 | 1
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('services').update({ is_active }).eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteService(id: string): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}

// ── Admin Account Management ──────────────────────────────────────────────────

export async function createAdminAccount(
  email: string,
  password: string,
  fullName: string
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()

  const { data, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return { error: authError.message }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: fullName || null,
    role: 'admin',
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id)
    return { error: profileError.message }
  }

  // Auto-create the Ride Requests widget entry for new admins (enabled by default)
  await supabase.from('user_details').insert({
    user_id: data.user.id,
    description: 'Ride Requests',
    status: 1,
  })

  return { error: null }
}

export async function deleteAdminAccount(
  adminId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.auth.admin.deleteUser(adminId)
  if (error) return { error: error.message }
  return { error: null }
}

// ── Widget / user_details Management (Master only) ───────────────────────────

/**
 * Upserts a widget access row for an admin user.
 * Uses (user_id, description) as the unique key.
 */
export async function upsertWidgetAccess(
  userId: string,
  description: string,
  status: 0 | 1
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('user_details')
    .upsert(
      { user_id: userId, description, status },
      { onConflict: 'user_id,description' }
    )
  if (error) return { error: error.message }
  return { error: null }
}

/**
 * Updates the description label of an existing widget row.
 */
export async function updateWidgetDescription(
  id: string,
  description: string
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('user_details')
    .update({ description })
    .eq('id', id)
  if (error) return { error: error.message }
  return { error: null }
}
