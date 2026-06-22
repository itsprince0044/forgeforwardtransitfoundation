'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function ShieldLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2.5l11 3.8v8.2c0 6.9-4.7 12.4-11 14.8C9.7 26.9 5 21.4 5 14.5V6.3l11-3.8z" fill="#16263B" stroke="#B8860B" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="12" cy="11.5" r="1.9" fill="#B8860B" />
      <circle cx="20" cy="20.5" r="1.9" fill="#fff" />
      <path d="M12 13.4v2.1a3 3 0 003 3h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setLoading(false)
      setError('Invalid credentials. Please check your email and password.')
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">

      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/5" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gold/5" />
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft />
        Back to site
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border px-8 py-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-border flex items-center justify-center mb-5">
            <ShieldLogo />
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-6 bg-gold" />
            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Coordinator Portal</span>
            <div className="h-px w-6 bg-gold" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1.5">
            Welcome Back
          </h1>
          <p className="text-muted text-sm">
            Sign in to manage ride requests.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500 mt-0.5 shrink-0" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-red-700 leading-snug">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@forgeforwardtransit.org"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors bg-white"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                className="w-full border border-border rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-white font-semibold py-3.5 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
          >
            {loading ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted">
            Forge Forward Transit Foundation &mdash; Coordinator access only.
          </p>
        </div>
      </div>
    </div>
  )
}
