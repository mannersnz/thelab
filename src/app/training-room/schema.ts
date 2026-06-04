import { z } from 'zod'

export const SLOTS = ['half_am', 'half_pm', 'full_day', 'hourly'] as const
export type SlotType = typeof SLOTS[number]

export const enquirySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  slot: z.enum(SLOTS),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  org: z.string().optional(),
  phone: z.string().optional(),
  attendees: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 attendee required')
    .max(40, 'Maximum 40 attendees'),
  hours: z.coerce
    .number()
    .int()
    .min(1, 'Minimum 1 hour')
    .max(8, 'Maximum 8 hours')
    .optional(),
  message: z.string().optional(),
})

export type EnquiryFormData = z.infer<typeof enquirySchema>

export const SLOT_LABELS: Record<SlotType, string> = {
  half_am: 'Morning Half-Day (up to 4hrs, 8am–12pm)',
  half_pm: 'Afternoon Half-Day (up to 4hrs, 1pm–5pm)',
  full_day: 'Full Day (8am–5pm)',
  hourly:  'Hourly (flexible start time, min 1hr)',
}

export const SLOT_PRICES: Record<SlotType, string> = {
  half_am: '$295 + GST',
  half_pm: '$295 + GST',
  full_day: '$595 + GST',
  hourly:  '$100/hr + GST',
}
