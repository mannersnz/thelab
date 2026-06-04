'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { enquirySchema, type EnquiryFormData, SLOT_LABELS, SLOT_PRICES } from '../schema'
import type { DayAvailability } from '../types'

interface Props {
  selectedDate: string | null
  availability: Record<string, DayAvailability>
  onClose: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function EnquiryForm({ selectedDate, availability, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const daySlots = selectedDate ? availability[selectedDate] : undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      date: selectedDate ?? '',
      attendees: 1,
    },
  })

  const selectedSlot = watch('slot')

  async function onSubmit(data: EnquiryFormData) {
    setServerError(null)
    const res = await fetch('/api/training-room/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Something went wrong. Please try again.')
      return
    }
    setSubmitted(true)
  }

  if (!selectedDate) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {submitted ? (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <h2>Enquiry received!</h2>
            <p>
              Thanks — we'll be in touch shortly about your booking on{' '}
              <strong>{formatDate(selectedDate)}</strong>.
            </p>
            <p className="success-note">
              You'll get a confirmation email at the address you provided. If you don't see it, check
              your junk folder.
            </p>
            <button className="cta cta-cyan" onClick={onClose}>Back to calendar</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <span className="modal-badge">Enquiry</span>
              <h2>Book the training room</h2>
              <p className="modal-date">{formatDate(selectedDate)}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="enquiry-form">
              <input type="hidden" {...register('date')} />

              {/* Session type */}
              <div className="form-group">
                <label>Session type *</label>
                <div className="slot-options">
                  {(['half_am', 'half_pm', 'full_day'] as const).map((slot) => {
                    const slotStatus = daySlots?.[slot]
                    const isUnavailable = slotStatus === 'confirmed' || slotStatus === 'blocked'
                    return (
                      <label
                        key={slot}
                        className={`slot-option ${selectedSlot === slot ? 'selected' : ''} ${isUnavailable ? 'unavailable' : ''}`}
                      >
                        <input
                          type="radio"
                          value={slot}
                          disabled={isUnavailable}
                          {...register('slot')}
                        />
                        <span className="slot-label">{SLOT_LABELS[slot]}</span>
                        <span className="slot-price">
                          {isUnavailable ? 'Not available' : SLOT_PRICES[slot]}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {errors.slot && <p className="field-error">{String(errors.slot.message)}</p>}
              </div>

              {/* Name + Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your name *</label>
                  <input id="name" type="text" placeholder="Jane Smith" {...register('name')} />
                  {errors.name && <p className="field-error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
                  {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>
              </div>

              {/* Org + Phone */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="org">Organisation</label>
                  <input id="org" type="text" placeholder="Acme Ltd" {...register('org')} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" placeholder="021 000 0000" {...register('phone')} />
                </div>
              </div>

              {/* Attendees */}
              <div className="form-group form-group-sm">
                <label htmlFor="attendees">Number of attendees *</label>
                <input
                  id="attendees"
                  type="number"
                  min={1}
                  max={40}
                  {...register('attendees', { valueAsNumber: true })}
                />
                {errors.attendees && <p className="field-error">{errors.attendees.message}</p>}
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">Requirements / notes</label>
                <textarea
                  id="message"
                  rows={3}
                  placeholder="Layout preferences, catering, AV needs, anything else..."
                  {...register('message')}
                />
              </div>

              {serverError && <p className="server-error">{serverError}</p>}

              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="cta cta-cyan" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Send enquiry'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
