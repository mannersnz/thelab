// Shared types — safe to import from both client and server components

export type SlotStatus = 'available' | 'enquiry' | 'confirmed' | 'blocked'
export type SlotKey = 'half_am' | 'half_pm' | 'full_day'

export interface DayAvailability {
  half_am: SlotStatus
  half_pm: SlotStatus
  full_day: SlotStatus
}

export interface BookingRow {
  id: string
  date: string
  slot: SlotKey
  status: SlotStatus
  enquirer_name: string | null
  enquirer_email: string | null
  enquirer_org: string | null
  enquirer_phone: string | null
  enquirer_message: string | null
  attendee_count: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

/** Derive overall day status for calendar colouring.
 *  Only 'confirmed' or 'blocked' slots count as taken — enquiries don't colour the calendar. */
export function getDayStatus(
  day: DayAvailability | undefined
): 'available' | 'partial' | 'full' {
  if (!day) return 'available'
  const slots = [day.half_am, day.half_pm, day.full_day]
  const taken = slots.filter((s) => s === 'confirmed' || s === 'blocked').length
  if (taken === 0) return 'available'
  if (taken === 3) return 'full'
  return 'partial'
}
