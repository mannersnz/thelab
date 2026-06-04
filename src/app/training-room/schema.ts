import { z } from 'zod'

export const enquirySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  slot: z.enum(['half_am', 'half_pm', 'full_day']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  org: z.string().optional(),
  phone: z.string().optional(),
  attendees: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 attendee required')
    .max(40, 'Maximum 40 attendees'),
  message: z.string().optional(),
})

export type EnquiryFormData = z.infer<typeof enquirySchema>

export const SLOT_LABELS: Record<'half_am' | 'half_pm' | 'full_day', string> = {
  half_am: 'Morning Half-Day (up to 4hrs, 8am–12pm)',
  half_pm: 'Afternoon Half-Day (up to 4hrs, 1pm–5pm)',
  full_day: 'Full Day (8am–5pm)',
}

export const SLOT_PRICES: Record<'half_am' | 'half_pm' | 'full_day', string> = {
  half_am: '$295 + GST',
  half_pm: '$295 + GST',
  full_day: '$595 + GST',
}
