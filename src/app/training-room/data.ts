import { createClient } from '@/lib/supabase/server'
import type { DayAvailability, SlotKey, SlotStatus, BookingRow } from './types'

export type { DayAvailability, SlotKey, SlotStatus, BookingRow }
export { getDayStatus } from './types'

/** Returns a map of ISO date string -> slot availability for the given range */
export async function getAvailability(
  from: Date,
  to: Date
): Promise<Record<string, DayAvailability>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('training_room_bookings')
    .select('date, slot, status')
    .gte('date', from.toISOString().slice(0, 10))
    .lte('date', to.toISOString().slice(0, 10))

  if (error) throw error

  const map: Record<string, DayAvailability> = {}
  for (const row of data ?? []) {
    if (!map[row.date]) {
      map[row.date] = { half_am: 'available', half_pm: 'available', full_day: 'available' }
    }
    map[row.date][row.slot as SlotKey] = row.status as SlotStatus
  }
  return map
}
