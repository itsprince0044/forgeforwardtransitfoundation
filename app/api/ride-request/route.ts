import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { notifyRequestReceived, notifyCoordinators, type NotifyBooking } from '@/lib/notify'

export const runtime = 'nodejs'

const MAX_EXTRA_PASSENGERS = 3   // car holds 5: driver + submitter + up to 3
const DOD_ID_RE = /^\d{10}$/
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Body {
  email: string
  fullName: string
  phone: string
  riderType: string
  dodId: string
  rideDate: string
  pickupTime: string
  pickupLocation: string
  destination: string
  reason: string
  passengers: string
  additionalPassengers?: { fullName: string; dodId: string }[]
  specialNotes?: string
  agreement: boolean
  signature: string
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // Server-side validation — data must be genuine, not fake.
  const fullName = (body.fullName ?? '').trim()
  const email = (body.email ?? '').trim()
  const dodId = (body.dodId ?? '').trim()
  const phoneDigits = (body.phone ?? '').replace(/\D/g, '')

  if (!NAME_RE.test(fullName) || fullName.length < 2)
    return NextResponse.json({ error: 'A valid full name is required (letters only).' }, { status: 400 })
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  if (phoneDigits.length < 10)
    return NextResponse.json({ error: 'A valid phone number is required.' }, { status: 400 })
  if (!DOD_ID_RE.test(dodId))
    return NextResponse.json({ error: 'A valid 10-digit DoD ID is required.' }, { status: 400 })
  if (!body.reason?.trim())
    return NextResponse.json({ error: 'A reason for transportation is required.' }, { status: 400 })

  // Only keep complete extra passengers, and enforce the car-capacity cap.
  const extraPassengers = (Array.isArray(body.additionalPassengers) ? body.additionalPassengers : [])
    .map(p => ({ fullName: (p?.fullName ?? '').trim(), dodId: (p?.dodId ?? '').trim() }))
    .filter(p => p.fullName.length > 0 || p.dodId.length > 0)

  if (extraPassengers.length > MAX_EXTRA_PASSENGERS) {
    return NextResponse.json({ error: 'A maximum of 3 additional passengers is allowed.' }, { status: 400 })
  }
  for (const p of extraPassengers) {
    if (!NAME_RE.test(p.fullName) || p.fullName.length < 2)
      return NextResponse.json({ error: 'Each additional passenger needs a valid full name.' }, { status: 400 })
    if (!DOD_ID_RE.test(p.dodId))
      return NextResponse.json({ error: 'Each additional passenger needs a valid 10-digit DoD ID.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: inserted, error } = await supabase
    .from('bookings')
    .insert({
      slot_id: null,
      customer_name: body.fullName.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      rider_type: body.riderType || null,
      dod_id: body.dodId?.trim() || null,
      ride_date: body.rideDate || null,
      pickup_time: body.pickupTime || null,
      service: body.reason,
      pickup_location: body.pickupLocation?.trim() || null,
      destination: body.destination?.trim() || null,
      passengers: body.passengers || null,
      special_notes: body.specialNotes?.trim() || null,
      agreement: !!body.agreement,
      signature: body.signature?.trim() || null,
      amount: 0,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) {
    console.error('[ride-request] insert failed:', error)
    return NextResponse.json({ error: 'Could not save your request.' }, { status: 500 })
  }

  // Insert additional passengers (riders 2-4) into their own table.
  if (extraPassengers.length > 0) {
    const rows = extraPassengers.map((p, i) => ({
      booking_id: inserted.id,
      position: i + 2,               // requester is passenger 1
      full_name: p.fullName,
      dod_id: p.dodId || null,
    }))
    const { error: paxErr } = await supabase.from('ride_passengers').insert(rows)
    if (paxErr) console.error('[ride-request] passenger insert failed (request still saved):', paxErr)
  }

  // Fire notifications — never let a failed email/SMS block the saved request.
  const b: NotifyBooking = {
    ...inserted,
    additional_passengers: extraPassengers.map((p, i) => ({ position: i + 2, full_name: p.fullName, dod_id: p.dodId })),
  }
  try {
    // Coordinator recipients: explicit env list first, else the profiles table.
    let recipients = (process.env.COORDINATOR_EMAILS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (recipients.length === 0) {
      const { data: coordinators } = await supabase
        .from('profiles')
        .select('email')
        .in('role', ['master', 'admin'])
      recipients = (coordinators ?? []).map(c => c.email).filter((e): e is string => !!e)
    }

    await Promise.allSettled([
      notifyRequestReceived(b),
      notifyCoordinators(b, recipients),
    ])
  } catch (e) {
    console.error('[ride-request] notification step failed (request still saved):', e)
  }

  return NextResponse.json({ error: null }, { status: 201 })
}
