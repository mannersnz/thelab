'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../../training-room.css'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Lazy import so Supabase client is never instantiated at build time
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/training-room/admin')
    }
  }

  return (
    <div className="tr-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="tr-logo">Digital <span>Tempo</span></span>
          <p style={{ color: 'var(--tr-text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Training Room Admin</p>
        </div>
        <form onSubmit={handleLogin} style={{ background: 'var(--tr-surface)', border: '1px solid var(--tr-border)', borderRadius: 16, padding: '2rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@digitaltempo.nz"
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="server-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="cta cta-cyan" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
