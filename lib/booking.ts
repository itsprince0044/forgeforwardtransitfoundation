import { supabase } from './supabase'

// ── Ride Requests ───────────────────────────────────────────────────────────
// Mirrors the official Forge Forward Ride Request intake form. A request is
// submitted directly with its own date/time — no pre-defined slot required.

export interface RideRequestPayload {
  email: string
  fullName: string
  phone: string
  riderType: string          // Single Soldier / Military Family / Other
  dodId: string              // DoD ID Number (Full DODID)
  rideDate: string           // ISO date (YYYY-MM-DD)
  pickupTime: string         // HH:MM
  pickupLocation: string
  destination: string
  reason: string             // Reason for Transportation
  passengers: string         // 'Yes' | 'No'
  specialNotes?: string
  agreement: boolean         // Transportation Agreement accepted
  signature: string          // typed full name
}

export async function createRideRequest(
  payload: RideRequestPayload
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bookings').insert({
    slot_id: null,
    customer_name: payload.fullName,
    phone: payload.phone || '',
    email: payload.email || null,
    rider_type: payload.riderType || null,
    dod_id: payload.dodId || null,
    ride_date: payload.rideDate || null,
    pickup_time: payload.pickupTime || null,
    service: payload.reason,
    pickup_location: payload.pickupLocation || null,
    destination: payload.destination || null,
    passengers: payload.passengers || null,
    special_notes: payload.specialNotes || null,
    agreement: payload.agreement,
    signature: payload.signature || null,
    amount: 0,
    status: 'pending',
  })

  return { error: error ? error.message : null }
}
