'use client'

import { useState } from 'react'
import type { BookingRow } from '../../types'
import { SLOT_LABELS } from '../../schema'

interface Props {
  bookings: BookingRow[]
  onRefresh: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-NZ', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

const STATUS_LABELS: Record<string, string> = {
  enquiry: 'Enquiry',
  confirmed: 'Confirmed',
  blocked: 'Blocked',
  available: 'Available',
}

export default function EnquiriesTable({ bookings, onRefresh }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setLoading(id)
    await fetch('/api/training-room/admin/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_notes: notes[id] ?? '' }),
    })
    setLoading(null)
    onRefresh()
  }

  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tr-text-muted)' }}>
        No enquiries yet. They&apos;ll appear here as people book.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--tr-border)', color: 'var(--tr-text-muted)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Slot</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Org</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Attendees</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <>
              <tr
                key={b.id}
                style={{ borderBottom: '1px solid var(--tr-border)', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              >
                <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{formatDate(b.date)}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {SLOT_LABELS[b.slot as 'half_am' | 'half_pm' | 'full_day']?.split(' (')[0] ?? b.slot}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{b.enquirer_name ?? '—'}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {b.enquirer_email ? (
                    <a href={`mailto:${b.enquirer_email}`} style={{ color: 'var(--tr-cyan)' }} onClick={(e) => e.stopPropagation()}>
                      {b.enquirer_email}
                    </a>
                  ) : '—'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{b.enquirer_org ?? '—'}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{b.attendee_count ?? '—'}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  <span className={`status-badge status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {b.status === 'enquiry' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="cta cta-cyan"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        disabled={loading === b.id}
                        onClick={() => updateStatus(b.id, 'confirmed')}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        disabled={loading === b.id}
                        onClick={() => updateStatus(b.id, 'blocked')}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      disabled={loading === b.id}
                      onClick={(e) => { e.stopPropagation(); updateStatus(b.id, 'enquiry') }}
                    >
                      Revert
                    </button>
                  )}
                </td>
              </tr>
              {expanded === b.id && (
                <tr key={`${b.id}-detail`} style={{ background: 'var(--tr-surface-2)' }}>
                  <td colSpan={8} style={{ padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 2rem', marginBottom: '1rem' }}>
                      {b.enquirer_phone && <p><strong>Phone:</strong> {b.enquirer_phone}</p>}
                      {b.enquirer_message && <p style={{ gridColumn: '1/-1' }}><strong>Notes:</strong> {b.enquirer_message}</p>}
                      <p><strong>Received:</strong> {new Date(b.created_at).toLocaleString('en-NZ')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Admin note (sent with confirm/decline email)</label>
                        <input
                          type="text"
                          value={notes[b.id] ?? b.admin_notes ?? ''}
                          onChange={(e) => setNotes({ ...notes, [b.id]: e.target.value })}
                          placeholder="Optional note to include in email…"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
