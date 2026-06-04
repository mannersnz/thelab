import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, slot, block } = await req.json()
  // block: true = mark blocked, false = remove block

  if (!date || !slot) return NextResponse.json({ error: 'Missing date or slot' }, { status: 400 })

  if (block) {
    // Upsert a blocked row — if an enquiry exists for this slot already, refuse
    const { data: existing } = await supabase
      .from('training_room_bookings')
      .select('id, status')
      .eq('date', date)
      .eq('slot', slot)
      .single()

    if (existing && existing.status === 'enquiry') {
      return NextResponse.json(
        { error: 'There is a pending enquiry for this slot. Resolve it first.' },
        { status: 409 }
      )
    }

    if (existing) {
      const { error } = await supabase
        .from('training_room_bookings')
        .update({ status: 'blocked' })
        .eq('id', existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase.from('training_room_bookings').insert({
        date,
        slot,
        status: 'blocked',
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Unblock: delete if it's a pure block row, or revert status to 'available' isn't possible
    // (there's no 'available' row — absence = available). So just delete the blocked row.
    const { error } = await supabase
      .from('training_room_bookings')
      .delete()
      .eq('date', date)
      .eq('slot', slot)
      .eq('status', 'blocked')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
