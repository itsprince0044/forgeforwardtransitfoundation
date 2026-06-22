/**
 * Seeds the slots table with 30-min slots from 09:00 to 16:00
 * for the next 7 days. Safe to re-run (uses upsert).
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/seed-slots.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function generateTimes(): string[] {
  const times: string[] = []
  for (let hour = 9; hour <= 16; hour++) {
    for (const min of [0, 30]) {
      if (hour === 16 && min === 30) break
      times.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
  }
  return times
}

function nextNDays(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

async function seed() {
  const dates = nextNDays(7)
  const times = generateTimes()

  const rows = dates.flatMap(date =>
    times.map(time => ({ date, time, is_booked: false }))
  )

  console.log(`Inserting ${rows.length} slots...`)

  const { error } = await supabase
    .from('slots')
    .upsert(rows, { onConflict: 'date,time' })

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`Done. ${rows.length} slots seeded.`)
}

seed()
