'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DayAvailability } from '../../types'
import { getDayStatus, DAY_STATUS_META, localDateStr } from '../../types'
import { SLOT_LABELS } from '../../schema'
import '../../../training-room/training-room.css'

interface Props {
  availability: Record<string, DayAvailability>
  onRefresh: () => void
}

const ALL_SLOTS = ['half_am', 'half_pm', 'full_day'] as const

export default function AdminCalendar({ availability, onRefresh }: Props) {
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const today = localDateStr(new Date())

  async function toggleSlot(date: string, slot: string, currentlyBlocked: boolean) {
    setLoading(true)
    await fetch('/api/training-room/admin/block-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, slot, block: !currentlyBlocked }),
    })
    setLoading(false)
    onRefresh()
  }

  const daySlots = selectedDate ? (availability[selectedDate] ?? {
    half_am: 'available', half_pm: 'available', full_day: 'available', hourly: 'available'
  }) : null

  return (
    <div>
      <div className="fc-wrapper" style={{ marginBottom: '1.5rem' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          height="auto"
          validRange={{ start: today }}
          dayCellClassNames={(arg) => {
            const dateStr = localDateStr(arg.date)
            if (dateStr < today) return []
            return [DAY_STATUS_META[getDayStatus(availability[dateStr])].className]
          }}
          dayCellContent={(arg) => {
            const dateStr = localDateStr(arg.date)
            if (dateStr < today) return arg.dayNumberText
            const { label } = DAY_STATUS_META[getDayStatus(availability[dateStr])]
            return (
              <>
                {arg.dayNumberText}
                <span className="day-status-label">{label}</span>
              </>
            )
          }}
          dateClick={(info) => {
            if (info.dateStr >= today) setSelectedDate(info.dateStr)
          }}
        />

        {/* Legend */}
        <div className="calendar-legend">
          <span className="legend-item legend-free">
            <span className="legend-dot" />
            Free
          </span>
          <span className="legend-item legend-part">
            <span className="legend-dot" />
            Partly booked
          </span>
          <span className="legend-item legend-full">
            <span className="legend-dot" />
            Fully booked
          </span>
        </div>
      </div>

      {selectedDate && daySlots && (
        <div style={{ background: 'var(--tr-surface)', border: '1px solid var(--tr-border)', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            Manage slots — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ALL_SLOTS.map((slot) => {
              const status = daySlots[slot]
              const isBlocked = status === 'blocked'
              const isEnquiry = status === 'enquiry'
              const isConfirmed = status === 'confirmed'

              return (
                <div
                  key={slot}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--tr-surface-2)',
                    border: '1px solid var(--tr-border)',
                    borderRadius: 8,
                    padding: '0.75rem 1rem',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{SLOT_LABELS[slot]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`status-badge status-${isEnquiry ? 'enquiry' : isConfirmed ? 'confirmed' : isBlocked ? 'blocked' : 'enquiry'}`}
                      style={!isEnquiry && !isConfirmed && !isBlocked ? { background: 'rgba(34,211,238,0.08)', color: 'var(--tr-cyan)', border: '1px solid rgba(34,211,238,0.2)' } : undefined}
                    >
                      {isEnquiry ? 'Pending Enquiry' : isConfirmed ? 'Confirmed' : isBlocked ? 'Blocked' : 'Available'}
                    </span>
                    {!isEnquiry && !isConfirmed && (
                      <button
                        className={isBlocked ? 'cta cta-cyan' : 'btn-ghost'}
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                        disabled={loading}
                        onClick={() => toggleSlot(selectedDate, slot, isBlocked)}
                      >
                        {isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
