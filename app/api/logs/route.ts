import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { MedicationLog } from '@/lib/types'

export async function GET() {
  const supabase = createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data ?? []).map(toLog))
}

export async function POST(request: Request) {
  const supabase = createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, medicationId, medicationName, notes } = body

  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: user.id,
      type: type ?? 'medication',
      medication_id: medicationId ?? null,
      medication_name: medicationName,
      notes: notes ?? null,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (type === 'medication') {
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Dose Logged',
      message: `${medicationName} logged successfully.`,
      type: 'info',
    })
  }

  return NextResponse.json(toLog(data), { status: 201 })
}

function toLog(row: any): MedicationLog {
  return {
    id: row.id,
    type: row.type ?? 'medication',
    medicationId: row.medication_id ?? undefined,
    medicationName: row.medication_name,
    loggedAt: new Date(row.logged_at),
    notes: row.notes ?? undefined,
  }
}
