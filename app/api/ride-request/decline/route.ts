import { createServiceClient } from '@/lib/supabase-service'
import {
  verifyAcceptToken,
  notifyRideCancelled,
  acceptResultPage,
  type NotifyBooking,
} from '@/lib/notify'

export const runtime = 'nodejs'

function html(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

// Coordinator clicks the "Decline" button in their email → lands here.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') ?? ''
  const token = searchParams.get('token') ?? ''

  if (!id || !verifyAcceptToken(id, token)) {
    return html(acceptResultPage({
      ok: false,
      title: 'Invalid or expired link',
      message: 'This link is not valid. Please manage the request from the coordinator dashboard instead.',
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

  if (booking.status === 'cancelled') {
    return html(acceptResultPage({
      ok: true,
      title: 'Already declined',
      message: `This ride request from ${booking.customer_name} was already declined. The rider has been notified.`,
    }))
  }

  if (booking.status === 'completed') {
    return html(acceptResultPage({
      ok: false,
      title: 'Ride already completed',
      message: 'This ride has already been completed and can no longer be declined.',
    }), 409)
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (updateErr) {
    return html(acceptResultPage({
      ok: false,
      title: 'Something went wrong',
      message: 'We couldn\'t decline the ride just now. Please try again from the dashboard.',
    }), 500)
  }

  // Notify the rider — don't let an email hiccup fail the decline.
  try {
    await notifyRideCancelled(booking as NotifyBooking)
  } catch (e) {
    console.error('[decline] rider notification failed (ride still declined):', e)
  }

  return html(acceptResultPage({
    ok: false,
    title: 'Ride declined',
    message: `${booking.customer_name} has been emailed that this ride request could not be fulfilled, and invited to submit another request.`,
  }))
}
