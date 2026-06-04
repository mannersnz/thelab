import { createClient } from '@/lib/supabase/server'
import type { DayAvailability, SlotKey, SlotStatus, BookingRow } from './types'

export type { DayAvailability, SlotKey, SlotStatus, BookingRow }
export { getDayStatus } from './types'

/** Format a Date as YYYY-MM-DD in local time (avoids UTC offset shifting the date) */
function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Returns a map of ISO date string -> slot availability for the given range */
export async function getAvailability(
  from: Date,
  to: Date
): Promise<Record<string, DayAvailability>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('training_room_bookings')
    .select('date, slot, status')
    .gte('date', toLocalDate(from))
    .lte('date', toLocalDate(to))

  if (error) throw error

  const map: Record<string, DayAvailability> = {}
  for (const row of data ?? []) {
    if (!map[row.date]) {
      map[row.date] = { half_am: 'available', half_pm: 'available', full_day: 'available' }
    }
    const slot = row.slot as SlotKey
    const current = map[row.date][slot]
    const incoming = row.status as SlotStatus
    // confirmed/blocked always wins over enquiry or available
    const priority: Record<SlotStatus, number> = { available: 0, enquiry: 1, confirmed: 2, blocked: 2 }
    if (priority[incoming] >= priority[current]) {
      map[row.date][slot] = incoming
    }
  }
  return map
}
