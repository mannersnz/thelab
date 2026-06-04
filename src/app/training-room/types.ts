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
 *  Business rules:
 *  - full_day confirmed/blocked = whole day is full
 *  - half_am AND half_pm both confirmed/blocked = whole day is full
 *  - either half confirmed/blocked = partial
 *  - enquiries alone = available (don't affect public calendar)
 */
export function getDayStatus(
  day: DayAvailability | undefined
): 'available' | 'partial' | 'full' {
  if (!day) return 'available'

  const taken = (s: SlotStatus) => s === 'confirmed' || s === 'blocked'

  // Full day slot alone fills the whole day
  if (taken(day.full_day)) return 'full'

  // Both halves taken = full day
  if (taken(day.half_am) && taken(day.half_pm)) return 'full'

  // Either half taken = partial
  if (taken(day.half_am) || taken(day.half_pm)) return 'partial'

  return 'available'
}
