import { createServiceClient } from '@/lib/supabase-service'
import {
  verifyAcceptToken,
  notifyRideConfirmed,
  acceptResultPage,
  type NotifyBooking,
} from '@/lib/notify'

export const runtime = 'nodejs'

function html(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

// Coordinator clicks the "Accept This Ride" button in their email → lands here.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') ?? ''
  const token = searchParams.get('token') ?? ''

  if (!id || !verifyAcceptToken(id, token)) {
    return html(acceptResultPage({
      ok: false,
      title: 'Invalid or expired link',
      message: 'This acceptance link is not valid. Please accept the ride from the coordinator dashboard instead.',
    }), 400)
  }

  const supabase = createServiceClient()

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !booking) {
    return html(acceptResultPage({
      ok: false,
      title: 'Request not found',
      message: 'We couldn\'t find that ride request. It may have been removed.',
    }), 404)
  }

  if (booking.status === 'confirmed' || booking.status === 'completed') {
    return html(acceptResultPage({
      ok: true,
      title: 'Already accepted',
      message: `This ride for ${booking.customer_name} has already been accepted. The rider has been notified.`,
    }))
  }

  if (booking.status === 'cancelled') {
    return html(acceptResultPage({
      ok: false,
      title: 'Request was cancelled',
      message: 'This ride request was cancelled and can no longer be accepted.',
    }), 409)
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', id)

  if (updateErr) {
    return html(acceptResultPage({
      ok: false,
      title: 'Something went wrong',
      message: 'We couldn\'t accept the ride just now. Please try again from the dashboard.',
    }), 500)
  }

  // Notify the rider — don't let an email hiccup fail the acceptance.
  try {
    await notifyRideConfirmed(booking as NotifyBooking)
  } catch (e) {
    console.error('[accept] rider notification failed (ride still accepted):', e)
  }

  return html(acceptResultPage({
    ok: true,
    title: 'Ride accepted! ✅',
    message: `${booking.customer_name} has been emailed that their ride is confirmed and a driver will call them. Thank you for serving those who serve.`,
  }))
}
