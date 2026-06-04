'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DayAvailability } from '../types'
import { getDayStatus } from '../types'

interface Props {
  availability: Record<string, DayAvailability>
  onDateSelect: (date: string) => void
  /** If true, clicking a date will toggle it blocked (admin mode) */
  adminMode?: boolean
  onAdminToggle?: (date: string, currentStatus: DayAvailability) => void
}

export default function AvailabilityCalendar({
  availability,
  onDateSelect,
  adminMode = false,
  onAdminToggle,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)

  // Build background-colour events for each day with bookings
  const events = Object.entries(availability).map(([date, slots]) => ({
    date,
    display: 'background',
    classNames: [`fc-day-${getDayStatus(slots)}`],
  }))

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
          const isPast = info.dateStr < today
          if (isPast) return
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
        <span className="legend-item legend-available">
          <span className="legend-dot" />
          Available
        </span>
        <span className="legend-item legend-partial">
          <span className="legend-dot" />
          Partially booked
        </span>
        <span className="legend-item legend-full">
          <span className="legend-dot" />
          Fully booked
        </span>
      </div>
    </div>
  )
}
