/**
 * Creates the master coordinator (admin) user in Supabase Auth.
 *
 * Credentials are read from environment variables so nothing secret is
 * committed to the repo. Run once with the values inline, e.g.:
 *
 *   ADMIN_EMAIL="you@example.org" ADMIN_PASSWORD="a-strong-password" \
 *     npx ts-node scripts/create-admin.ts
 *
 * (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY come from .env.local.)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD when running this script, e.g.:')
    console.error('  ADMIN_EMAIL="you@example.org" ADMIN_PASSWORD="strong-pass" npx ts-node scripts/create-admin.ts')
    process.exit(1)
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('Admin user already exists — you can log in with:')
    } else {
      console.error('Error:', error.message)
      process.exit(1)
    }
  } else {
    console.log('✅ Admin user created:', data.user.email)
  }

  console.log('\n📧 Email:   ', email)
  console.log('🔑 Password:', password)
}

createAdmin()
