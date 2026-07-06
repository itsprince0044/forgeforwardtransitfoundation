import 'server-only'
import { createHmac } from 'crypto'
import nodemailer, { type Transporter } from 'nodemailer'
import { Resend } from 'resend'
import twilio from 'twilio'

// ── Config (all optional — features no-op gracefully until keys are added) ────

// Gmail SMTP (preferred): sends from your Gmail to ANY recipient, no domain needed.
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '')

// Resend (fallback): great once a domain is verified.
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM || 'Forge Forward Transit Foundation <onboarding@resend.dev>'

const REPLY_TO = process.env.REPLY_TO || undefined
const APP_URL = (process.env.APP_URL || 'http://localhost:3030').replace(/\/$/, '')

let gmailTransport: Transporter | null = null
function getGmailTransport(): Transporter | null {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null
  if (!gmailTransport) {
    gmailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
  }
  return gmailTransport
}

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER

// ── Shared shape of a ride request used in templates ─────────────────────────

export interface NotifyBooking {
  id: string
  customer_name: string
  email?: string | null
  phone?: string | null
  rider_type?: string | null
  dod_id?: string | null
  service?: string | null          // reason for transportation
  ride_date?: string | null        // YYYY-MM-DD
  pickup_time?: string | null      // HH:MM
  pickup_location?: string | null
  destination?: string | null
  passengers?: string | null
  additional_passengers?: { position?: number; full_name: string; dod_id?: string | null }[]
  special_notes?: string | null
  signature?: string | null
  agreement?: boolean | null
}

// ── Accept-link token (HMAC so only our emails can confirm a ride) ────────────

function signingSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-only-insecure-secret'
}
export function acceptToken(id: string): string {
  return createHmac('sha256', signingSecret()).update(id).digest('hex').slice(0, 32)
}
export function verifyAcceptToken(id: string, token: string): boolean {
  return !!token && token === acceptToken(id)
}
function acceptUrl(id: string): string {
  return `${APP_URL}/api/ride-request/accept?id=${encodeURIComponent(id)}&token=${acceptToken(id)}`
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtDate(iso?: string | null): string {
  if (!iso) return 'your selected date'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}
function fmtTime(t?: string | null): string {
  if (!t) return 'the requested time'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}
export function toE164(raw?: string | null): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (t.startsWith('+')) return '+' + t.slice(1).replace(/\D/g, '')
  const d = t.replace(/\D/g, '')
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return d ? `+${d}` : null
}

// ── Low-level senders ─────────────────────────────────────────────────────────

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }): Promise<void> {
  // 1) Preferred: Gmail SMTP — delivers to any recipient, no domain verification.
  const gmail = getGmailTransport()
  if (gmail) {
    try {
      await gmail.sendMail({
        from: `Forge Forward Transit Foundation <${GMAIL_USER}>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      })
      console.log('[notify] email sent (gmail):', opts.subject, '->', opts.to)
    } catch (e) {
      console.error('[notify] gmail send failed:', e)
    }
    return
  }

  // 2) Fallback: Resend (sandbox only delivers to the account email until a domain is verified).
  if (!RESEND_API_KEY) {
    console.warn('[notify] No email transport configured — email skipped:', opts.subject)
    return
  }
  try {
    const resend = new Resend(RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    })
    if (error) console.error('[notify] email error:', error)
    else console.log('[notify] email sent (resend):', opts.subject, '->', opts.to)
  } catch (e) {
    console.error('[notify] email failed:', e)
  }
}

export async function sendSms(opts: { to: string; body: string }): Promise<void> {
  const to = toE164(opts.to)
  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_FROM) {
    console.warn('[notify] Twilio not configured — SMS skipped')
    return
  }
  if (!to) { console.warn('[notify] no valid phone — SMS skipped'); return }
  try {
    const client = twilio(TWILIO_SID, TWILIO_AUTH)
    await client.messages.create({ from: TWILIO_FROM, to, body: opts.body })
  } catch (e) {
    console.error('[notify] sms failed:', e)
  }
}

// ── Email design system ───────────────────────────────────────────────────────

const C = {
  navy: '#11213A', gold: '#B8860B', goldLight: '#D4A017',
  bg: '#F4F6F9', card: '#FFFFFF', text: '#16263B', muted: '#5A6B7B',
  border: '#DCE3EB', green: '#1F9D55',
}

function shell(opts: { preheader?: string; accent?: string; eyebrow: string; heading: string; bodyHtml: string }): string {
  const accent = opts.accent ?? C.gold
  return `<!doctype html><html><body style="margin:0;padding:0;background:${C.bg}">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${opts.preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.card};border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(17,33,58,.08);font-family:Arial,Helvetica,sans-serif">
        <!-- accent bar -->
        <tr><td style="height:5px;background:linear-gradient(90deg,${C.gold},${C.navy},${C.goldLight})"></td></tr>
        <!-- header -->
        <tr><td style="background:${C.navy};padding:24px 30px">
          <div style="color:#fff;font-size:17px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Forge Forward Transit Foundation</div>
          <div style="color:${C.goldLight};font-size:11px;letter-spacing:2.5px;text-transform:uppercase;margin-top:6px">Serving Those Who Serve</div>
        </td></tr>
        <!-- body -->
        <tr><td style="padding:30px">
          <div style="display:inline-block;background:${accent}1a;color:${accent};font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:20px;margin-bottom:14px">${opts.eyebrow}</div>
          <h1 style="margin:0 0 14px;font-size:22px;color:${C.navy};line-height:1.25">${opts.heading}</h1>
          ${opts.bodyHtml}
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:20px 30px;background:#0d1b30;color:#8aa0b8;font-size:11px;line-height:1.6">
          Forge Forward Transit Foundation — free rides for service members &amp; military families, within ~25 miles of Fort Riley.<br/>
          Rides are provided at no cost, based on availability.
        </td></tr>
      </table>
      <div style="color:${C.muted};font-size:11px;margin-top:14px;font-family:Arial,Helvetica,sans-serif">Mobility, connection, and hope — one ride at a time.</div>
    </td></tr>
  </table></body></html>`
}

function detailsTable(b: NotifyBooking, full = false): string {
  const rows: [string, string][] = [
    ['Rider', b.customer_name],
    ['Reason', b.service ?? '—'],
    ['Date', fmtDate(b.ride_date)],
    ['Pickup Time', fmtTime(b.pickup_time)],
    ['Pickup', b.pickup_location ?? '—'],
    ['Destination', b.destination ?? '—'],
    ['Others Riding', b.passengers ?? '—'],
  ]
  if (full) {
    rows.push(
      ['Phone', b.phone ?? '—'],
      ['Email', b.email ?? '—'],
      ['Rider Type', b.rider_type ?? '—'],
      ['DoD ID', b.dod_id ?? '—'],
      ['Special Notes', b.special_notes || '—'],
      ['Signature', b.signature ?? '—'],
      ['Agreement', b.agreement ? 'Accepted' : 'Not accepted'],
    )
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:8px;margin:18px 0;overflow:hidden">
    ${rows.map(([k, v], i) => `<tr style="background:${i % 2 ? '#fff' : '#f7f9fc'}">
      <td style="padding:9px 14px;color:${C.muted};font-size:12px;width:130px;border-bottom:1px solid ${C.border}">${k}</td>
      <td style="padding:9px 14px;color:${C.text};font-size:13px;font-weight:600;border-bottom:1px solid ${C.border}">${v}</td>
    </tr>`).join('')}
  </table>`
}

function passengersBlock(b: NotifyBooking): string {
  const list = b.additional_passengers ?? []
  if (list.length === 0) return ''
  const rows = list.map(pax => `<tr>
      <td style="padding:8px 14px;color:${C.text};font-size:13px;font-weight:600;border-bottom:1px solid ${C.border}">Passenger ${pax.position ?? ''} — ${pax.full_name}</td>
      <td style="padding:8px 14px;color:${C.muted};font-size:12px;border-bottom:1px solid ${C.border}">DoD ID: ${pax.dod_id || '—'}</td>
    </tr>`).join('')
  return `<p style="margin:16px 0 6px;font-size:12px;font-weight:bold;letter-spacing:.5px;text-transform:uppercase;color:${C.muted}">Additional Passengers (${list.length})</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:8px;overflow:hidden">${rows}</table>`
}

function button(href: string, label: string, color: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px"><tr>
    <td style="border-radius:8px;background:${color}">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 30px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;letter-spacing:.5px">${label}</a>
    </td></tr></table>`
}

const p = (t: string) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.65;color:${C.text}">${t}</p>`

// ── High-level notifications ───────────────────────────────────────────────────

/** To the rider, immediately after submitting. */
export async function notifyRequestReceived(b: NotifyBooking): Promise<void> {
  const tasks: Promise<void>[] = []
  if (b.email) {
    tasks.push(sendEmail({
      to: b.email,
      subject: 'We received your ride request 🚐',
      html: shell({
        eyebrow: 'Request Received',
        accent: C.gold,
        preheader: 'Thanks — a coordinator will confirm your ride shortly.',
        heading: `Thank you, ${b.customer_name}!`,
        bodyHtml:
          p('We\'ve received your ride request and a coordinator is reviewing it now. You\'ll get another email the moment it\'s <strong>confirmed</strong>.') +
          detailsTable(b) +
          passengersBlock(b) +
          p(`<span style="color:${C.muted};font-size:13px">Sit tight — we\'ll be in touch soon. Thank you for your service.</span>`),
      }),
      text: `Thank you, ${b.customer_name}. We received your ride request for ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)}. A coordinator will confirm shortly.`,
    }))
  }
  if (b.phone) {
    tasks.push(sendSms({ to: b.phone, body: `Forge Forward: we received your ride request for ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)}. We'll text you once it's confirmed.` }))
  }
  await Promise.allSettled(tasks)
}

/** To the coordinator(s): full request details + one-click Accept button. */
export async function notifyCoordinators(b: NotifyBooking, recipients: string[]): Promise<void> {
  if (recipients.length === 0) return
  await sendEmail({
    to: recipients.join(','),
    subject: `🚦 New ride request — ${b.customer_name} (${fmtDate(b.ride_date)})`,
    html: shell({
      eyebrow: 'Action Needed',
      accent: C.navy,
      preheader: `${b.customer_name} requested a ride. Review and accept.`,
      heading: 'New ride request',
      bodyHtml:
        p(`<strong>${b.customer_name}</strong> just submitted a ride request. Here are all the details from the form:`) +
        detailsTable(b, true) +
        passengersBlock(b) +
        p('If everything looks good, accept the ride below — the rider will be notified automatically that a driver will call them.') +
        button(acceptUrl(b.id), '✓ Accept This Ride', C.green) +
        p(`<span style="color:${C.muted};font-size:12px">Or manage it anytime in the coordinator dashboard.</span>`),
    }),
    text: `New ride request from ${b.customer_name} (${b.phone ?? 'no phone'}). ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)}. ${b.pickup_location ?? '—'} -> ${b.destination ?? '—'}. Accept: ${acceptUrl(b.id)}`,
  })
}

/** To the rider when a coordinator accepts the ride. */
export async function notifyRideConfirmed(b: NotifyBooking): Promise<void> {
  const tasks: Promise<void>[] = []
  if (b.email) {
    tasks.push(sendEmail({
      to: b.email,
      subject: '✅ Your ride is confirmed!',
      html: shell({
        eyebrow: 'Ride Confirmed',
        accent: C.green,
        preheader: 'Your ride is accepted — a driver will call you.',
        heading: `You're all set, ${b.customer_name}! 🎉`,
        bodyHtml:
          p('Great news — your ride request has been <strong>accepted</strong>. A driver will <strong>call you shortly</strong> to coordinate your pickup details.') +
          detailsTable(b) +
          p('<strong>Please keep your phone handy and be ready at your pickup location on time.</strong> Thank you for letting us serve you.'),
      }),
      text: `Good news, ${b.customer_name}! Your Forge Forward ride for ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)} is CONFIRMED. A driver will call you shortly. Please be ready at your pickup on time.`,
    }))
  }
  if (b.phone) {
    tasks.push(sendSms({ to: b.phone, body: `Forge Forward: your ride for ${fmtTime(b.pickup_time)} on ${fmtDate(b.ride_date)} is CONFIRMED. A driver will call you shortly. Please be ready on time.` }))
  }
  await Promise.allSettled(tasks)
}

/** To the rider when a coordinator cancels the ride. */
export async function notifyRideCancelled(b: NotifyBooking): Promise<void> {
  const tasks: Promise<void>[] = []
  if (b.email) {
    tasks.push(sendEmail({
      to: b.email,
      subject: 'Update on your ride request',
      html: shell({
        eyebrow: 'Request Update',
        accent: '#C0392B',
        heading: 'Your ride request was cancelled',
        bodyHtml:
          p(`Hi ${b.customer_name}, unfortunately your ride request for ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)} could not be fulfilled and has been cancelled.`) +
          p('Please submit a new request or reply to this email and we\'ll do our best to help.'),
      }),
      text: `Hi ${b.customer_name}, your Forge Forward ride request for ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)} was cancelled. Please submit a new request or reply for help.`,
    }))
  }
  if (b.phone) {
    tasks.push(sendSms({ to: b.phone, body: `Forge Forward: your ride request for ${fmtDate(b.ride_date)} at ${fmtTime(b.pickup_time)} was cancelled. Please submit a new request or contact us.` }))
  }
  await Promise.allSettled(tasks)
}

// Branded HTML page returned after clicking the email Accept link.
export function acceptResultPage(opts: { ok: boolean; title: string; message: string }): string {
  const accent = opts.ok ? C.green : '#C0392B'
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${opts.title}</title></head>
  <body style="margin:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" style="padding:60px 16px"><tr><td align="center">
      <table role="presentation" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(17,33,58,.1)">
        <tr><td style="height:6px;background:${accent}"></td></tr>
        <tr><td style="background:${C.navy};padding:22px 30px">
          <div style="color:#fff;font-size:16px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Forge Forward Transit Foundation</div>
        </td></tr>
        <tr><td style="padding:36px 30px;text-align:center">
          <div style="width:64px;height:64px;border-radius:50%;background:${accent}1a;color:${accent};font-size:34px;line-height:64px;margin:0 auto 18px">${opts.ok ? '✓' : '!'}</div>
          <h1 style="margin:0 0 10px;color:${C.navy};font-size:22px">${opts.title}</h1>
          <p style="margin:0;color:${C.muted};font-size:14px;line-height:1.6">${opts.message}</p>
          <a href="${APP_URL}/admin/dashboard" style="display:inline-block;margin-top:24px;background:${C.navy};color:#fff;text-decoration:none;padding:12px 26px;border-radius:8px;font-size:14px;font-weight:bold">Open Dashboard</a>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`
}
