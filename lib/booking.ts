// ── Ride Requests ───────────────────────────────────────────────────────────
// Mirrors the official Forge Forward Ride Request intake form. The request is
// submitted to a server route (/api/ride-request), which saves it and sends
// the rider + coordinator notifications (email/SMS) with server-only keys.

export interface AdditionalPassengerInput {
  fullName: string
  dodId: string
}

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
  additionalPassengers: AdditionalPassengerInput[]  // riders 2-4 (max 3)
  specialNotes?: string
  agreement: boolean         // Transportation Agreement accepted
  signature: string          // typed full name
}

export async function createRideRequest(
  payload: RideRequestPayload
): Promise<{ error: string | null }> {
  try {
    const res = await fetch('/api/ride-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { error: data?.error ?? 'Request failed.' }
    }
    return { error: null }
  } catch {
    return { error: 'Network error. Please try again.' }
  }
}
