import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Coordinator Login — Forge Forward Transit Foundation',
  robots: 'noindex, nofollow',
}

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Already authenticated → skip login
  if (user) redirect('/admin/dashboard')

  return <LoginForm />
}
