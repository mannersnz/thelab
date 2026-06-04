'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { DayAvailability, BookingRow } from '../types'
import EnquiriesTable from './components/EnquiriesTable'
import AdminCalendar from './components/AdminCalendar'
import '../training-room.css'

type Tab = 'enquiries' | 'calendar'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('enquiries')
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const from = new Date().toISOString().slice(0, 10)
    const toDate = new Date()
    toDate.setDate(toDate.getDate() + 90)
    const to = toDate.toISOString().slice(0, 10)

    const { data } = await supabase
      .from('training_room_bookings')
      .select('*')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true })
      .order('created_at', { ascending: false })

    const rows = (data ?? []) as BookingRow[]
    setBookings(rows)

    // Build availability map
    const map: Record<string, DayAvailability> = {}
    for (const row of rows) {
      if (!map[row.date]) {
        map[row.date] = { half_am: 'available', half_pm: 'available', full_day: 'available' }
      }
      map[row.date][row.slot as keyof DayAvailability] = row.status
    }
    setAvailability(map)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/training-room/admin/login')
  }

  const enquiries = bookings.filter((b) => b.status === 'enquiry')

  return (
    <div className="tr-root admin-root">
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--tr-border)', padding: '1rem 0' }}>
        <div className="tr-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="tr-logo">Digital <span>Tempo</span></span>
            <span style={{ color: 'var(--tr-text-muted)', fontSize: '0.85rem' }}>/ Training Room Admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/training-room" target="_blank" style={{ color: 'var(--tr-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              View public page ↗
            </a>
            <button className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.4rem 0.875rem' }} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="tr-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Pending enquiries', value: bookings.filter((b) => b.status === 'enquiry').length, accent: '#fbbf24' },
            { label: 'Confirmed bookings', value: bookings.filter((b) => b.status === 'confirmed').length, accent: 'var(--tr-cyan)' },
            { label: 'Blocked slots', value: bookings.filter((b) => b.status === 'blocked').length, accent: '#f87171' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--tr-surface)', border: '1px solid var(--tr-border)', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: s.accent }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--tr-text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--tr-border)', paddingBottom: '0' }}>
          {(['enquiries', 'calendar'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--tr-cyan)' : '2px solid transparent',
                color: tab === t ? 'var(--tr-text)' : 'var(--tr-text-muted)',
                padding: '0.75rem 1.25rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '-1px',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'color 0.2s',
              }}
            >
              {t === 'enquiries' ? `Enquiries${enquiries.length > 0 ? ` (${enquiries.length})` : ''}` : 'Block-Out Calendar'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tr-text-muted)' }}>Loading…</div>
        ) : (
          <>
            {tab === 'enquiries' && (
              <EnquiriesTable bookings={bookings.filter((b) => b.status !== 'blocked')} onRefresh={loadData} />
            )}
            {tab === 'calendar' && (
              <AdminCalendar availability={availability} onRefresh={loadData} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
