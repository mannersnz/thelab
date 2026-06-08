'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DayAvailability } from '../types'
import { getDayStatus, DAY_STATUS_META, localDateStr } from '../types'

interface Props {
  availability: Record<string, DayAvailability>
  onDateSelect: (date: string) => void
  adminMode?: boolean
  onAdminToggle?: (date: string, currentStatus: DayAvailability) => void
}

export default function AvailabilityCalendar({
  availability,
  onDateSelect,
  adminMode = false,
  onAdminToggle,
}: Props) {
  const today = localDateStr(new Date())

  return (
    <div className="fc-wrapper">
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
          if (info.dateStr < today) return
          if (adminMode && onAdminToggle) {
            onAdminToggle(info.dateStr, availability[info.dateStr] ?? {
              half_am: 'available', half_pm: 'available', full_day: 'available', hourly: 'available'
            })
          } else {
            onDateSelect(info.dateStr)
          }
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
  )
}
