export interface Slot {
  id: string
  date: string        // ISO date string e.g. "2026-06-01"
  time: string        // e.g. "09:00"
  is_booked: boolean
}

export interface Booking {
  id: string
  slot_id: string | null
  customer_name: string       // Full Name
  phone: string               // Phone Number
  email?: string              // Email Address
  rider_type?: string         // Single Soldier / Military Family / Other
  dod_id?: string             // DoD ID Number
  ride_date?: string          // Date of Requested Ride (ISO)
  pickup_time?: string        // Pickup Time (HH:MM)
  service: string             // Reason for Transportation
  pickup_location?: string
  destination?: string
  passengers?: string         // Will anyone else ride? Yes / No
  special_notes?: string
  agreement?: boolean
  signature?: string          // Electronic Signature (typed name)
  amount: number              // always 0 — rides are free; kept for schema compatibility
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  slot?: Slot
}

export interface Service {
  id: string
  name: string
  price: number
  description: string
  duration: string
  is_active: 0 | 1
  sort_order: number
  created_at: string
}
