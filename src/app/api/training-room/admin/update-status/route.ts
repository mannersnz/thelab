import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { SLOT_LABELS } from '@/app/training-room/schema'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'The Lab <noreply@digitaltempo.nz>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, admin_notes } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  // Fetch the booking first so we can email the enquirer
  const { data: booking, error: fetchError } = await supabase
    .from('training_room_bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Update
  const { error } = await supabase
    .from('training_room_bookings')
    .update({ status, admin_notes: admin_notes ?? booking.admin_notes })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email to enquirer on confirm or decline
  if (booking.enquirer_email) {
    const formattedDate = formatDate(booking.date)
    const slotLabel = SLOT_LABELS[booking.slot as 'half_am' | 'half_pm' | 'full_day']

    if (status === 'confirmed') {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: booking.enquirer_email,
        subject: `Your training room booking is confirmed — ${formattedDate}`,
        html: `
          <h2>Booking confirmed!</h2>
          <p>Hi ${booking.enquirer_name ?? 'there'},</p>
          <p>Your training room booking at Mahitahi Colab Māpua has been confirmed.</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Session:</strong> ${slotLabel}</p>
          <p><strong>Attendees:</strong> ${booking.attendee_count ?? 'TBC'}</p>
          ${admin_notes ? `<p><strong>Notes from us:</strong> ${admin_notes}</p>` : ''}
          <p>We'll be in touch closer to the date with any final details. Looking forward to hosting you!</p>
          <p><strong>Mahitahi Colab, Stafford Drive, Māpua</strong></p>
          <p>Questions? Reply to this email or call 021 567 119.</p>
        `,
      }).catch(console.error)
    } else if (status === 'blocked') {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: booking.enquirer_email,
        subject: `Training room enquiry update — ${formattedDate}`,
        html: `
          <p>Hi ${booking.enquirer_name ?? 'there'},</p>
          <p>Unfortunately the training room isn't available for your requested date (${formattedDate}, ${slotLabel}).</p>
          ${admin_notes ? `<p>${admin_notes}</p>` : ''}
          <p>Please feel free to check other available dates at <a href="https://thelab.digitaltempo.nz/training-room">thelab.digitaltempo.nz/training-room</a> or get in touch if you'd like help finding an alternative.</p>
          <p>Sorry for any inconvenience.</p>
        `,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ success: true })
}
