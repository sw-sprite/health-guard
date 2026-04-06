'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import Icon from '@/components/ui/Icon'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, browser redirects to Google — no need to setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-card">
            <Icon name="shield_with_heart" filled size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Health Guard</h1>
          <p className="text-sm text-on-surface-variant mt-1 text-center">
            Proactive health monitoring for allergy season
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-card p-8 flex flex-col gap-4">
          <div>
            <h2 className="font-bold text-on-surface text-lg">Welcome back</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">Sign in to access your health dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-error/10 border border-error/20 rounded-xl">
              <Icon name="error" filled size={16} className="text-error shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Google sign in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full px-5 py-3.5 bg-on-surface text-surface rounded-full font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-container-high" />
            <span className="text-xs text-on-surface-variant/60">or</span>
            <div className="flex-1 h-px bg-surface-container-high" />
          </div>

          {/* Guest / demo mode */}
          <a
            href="/api/auth/guest"
            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border-2 border-surface-container-high text-on-surface-variant rounded-full font-semibold text-sm hover:bg-surface-container-low hover:text-on-surface active:scale-95 transition-all"
          >
            <Icon name="visibility" size={16} />
            View Demo (no sign-in)
          </a>
        </div>

        <p className="text-xs text-on-surface-variant/50 text-center mt-6">
          Your health data is private and secured by Supabase RLS policies.
        </p>
      </div>
    </div>
  )
}
