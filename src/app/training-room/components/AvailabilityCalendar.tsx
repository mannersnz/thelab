'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DayAvailability } from '../types'
import { getDayStatus } from '../types'

interface Props {
  availability: Record<string, DayAvailability>
  onDateSelect: (date: string) => void
  adminMode?: boolean
  onAdminToggle?: (date: string, currentStatus: DayAvailability) => void
}

const STATUS_COLORS = {
  available: 'rgba(34, 211, 238, 0.18)',
  partial:   'rgba(251, 191, 36, 0.25)',
  full:      'rgba(239, 68, 68, 0.25)',
}

export default function AvailabilityCalendar({
  availability,
  onDateSelect,
  adminMode = false,
  onAdminToggle,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const events = Object.entries(availability).map(([date, slots]) => {
    const status = getDayStatus(slots)
    return {
      date,
      display: 'background',
      backgroundColor: STATUS_COLORS[status],
      borderColor: 'transparent',
    }
  })

  return (
    <div className="fc-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        height="auto"
        events={events}
        validRange={{ start: today }}
        dateClick={(info) => {
          if (info.dateStr < today) return
          if (adminMode && onAdminToggle) {
            onAdminToggle(info.dateStr, availability[info.dateStr] ?? {
              half_am: 'available', half_pm: 'available', full_day: 'available'
            })
          } else {
            onDateSelect(info.dateStr)
          }
        }}
      />

      {/* Legend */}
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: STATUS_COLORS.available }} />
          Available
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: STATUS_COLORS.partial }} />
          Partially booked
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: STATUS_COLORS.full }} />
          Fully booked
        </span>
      </div>
    </div>
  )
}
