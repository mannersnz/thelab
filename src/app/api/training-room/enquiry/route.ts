import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { enquirySchema, SLOT_LABELS, SLOT_PRICES } from '@/app/training-room/schema'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'The Lab <noreply@digitaltempo.nz>'
const NOTIFY_EMAIL = process.env.NOTIFICATION_EMAIL ?? 'russell@digitaltempo.nz'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Validate
  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { date, slot, name, email, org, phone, attendees, hours, message } = parsed.data

  // Check the slot isn't already confirmed/blocked (race condition guard)
  const supabase = await createServiceClient()
  const { data: existing } = await supabase
    .from('training_room_bookings')
    .select('status')
    .eq('date', date)
    .eq('slot', slot)
    .single()

  if (existing && (existing.status === 'confirmed' || existing.status === 'blocked')) {
    return NextResponse.json(
      { error: 'Sorry, that slot has just been taken. Please choose another.' },
      { status: 409 }
    )
  }

  // Insert enquiry
  const { error: insertError } = await supabase.from('training_room_bookings').insert({
    date,
    slot,
    status: 'enquiry',
    enquirer_name: name,
    enquirer_email: email,
    enquirer_org: org ?? null,
    enquirer_phone: phone ?? null,
    enquirer_message: message ?? null,
    attendee_count: attendees,
    hours: hours ?? null,
  })

  if (insertError) {
    console.error('Supabase insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save enquiry. Please try again.' }, { status: 500 })
  }

  const formattedDate = formatDate(date)
  const slotLabel = SLOT_LABELS[slot]
  const slotPrice = SLOT_PRICES[slot]

  // Email to admin
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `Training room enquiry: ${name} — ${formattedDate}`,
      html: `
        <h2>New training room enquiry</h2>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Session:</strong> ${slotLabel}</p>
        <p><strong>Price:</strong> ${slotPrice}</p>
        <hr/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${org ? `<p><strong>Organisation:</strong> ${org}</p>` : ''}
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Attendees:</strong> ${attendees}</p>
        ${hours ? `<p><strong>Hours requested:</strong> ${hours} hr${hours > 1 ? 's' : ''} (est. $${hours * 100} + GST)</p>` : ''}
        ${message ? `<p><strong>Notes:</strong> ${message}</p>` : ''}
        <hr/>
        <p><a href="https://thelab.digitaltempo.nz/training-room/admin">View in admin panel →</a></p>
      `,
    })
  } catch (e) {
    console.error('Admin email failed:', e)
    // Non-fatal — enquiry is already saved
  }

  // Confirmation email to enquirer
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Training room enquiry received — ${formattedDate}`,
      html: `
        <h2>Thanks for your enquiry, ${name}!</h2>
        <p>We've received your training room enquiry and will be in touch shortly to confirm your booking.</p>
        <h3>Your request summary</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Session:</strong> ${slotLabel}</p>
        <p><strong>Attendees:</strong> ${attendees}</p>
        <p><strong>Price:</strong> ${slotPrice}</p>
        ${message ? `<p><strong>Your notes:</strong> ${message}</p>` : ''}
        <hr/>
        <p>If you need to make changes or have questions, reply to this email or contact us at <a href="mailto:hello@digitaltempo.nz">hello@digitaltempo.nz</a>.</p>
        <p><strong>Mahitahi Colab, Stafford Drive, Māpua</strong></p>
      `,
    })
  } catch (e) {
    console.error('Confirmation email failed:', e)
    // Non-fatal
  }

  return NextResponse.json({ success: true })
}
