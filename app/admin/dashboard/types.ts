export type Role = 'master' | 'admin'

export type BookingWithSlot = {
  id: string
  slot_id: string | null
  customer_name: string              // Full Name
  phone: string                      // Phone Number
  email?: string | null              // Email Address
  rider_type?: string | null         // Single Soldier / Military Family / Other
  dod_id?: string | null             // DoD ID Number
  ride_date?: string | null          // Date of Requested Ride
  pickup_time?: string | null        // Pickup Time (HH:MM)
  service: string                    // Reason for Transportation
  pickup_location?: string | null
  destination?: string | null
  passengers?: string | null         // Will anyone else ride? Yes / No
  special_notes?: string | null
  agreement?: boolean | null
  signature?: string | null          // Electronic Signature
  amount: number
  status: string
  created_at: string
  barber_id?: string | null
  driver_id?: string | null
  slot: { date: string; time: string } | null
}

export type ServiceRow = {
  id: string
  name: string
  price: number
  description: string
  duration: string
  is_active: 0 | 1
  sort_order: number
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: Role  // 'master' | 'admin'
  created_at: string
}

export type UserDetail = {
  id: string
  user_id: string
  description: string
  status: 0 | 1
  created_at: string
}
