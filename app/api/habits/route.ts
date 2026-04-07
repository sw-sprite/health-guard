import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { Habit, HabitRepeat } from '@/lib/types'

function rowToHabit(row: any): Habit {
  let repeat: HabitRepeat
  const cfg = row.repeat_config ?? {}
  if (row.repeat_type === 'daily') {
    repeat = { type: 'daily', days: cfg.days ?? [] }
  } else if (row.repeat_type === 'monthly') {
    repeat = { type: 'monthly', days: cfg.days ?? [] }
  } else {
    repeat = { type: 'interval', everyDays: cfg.everyDays ?? 1 }
  }

  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    category: row.category,
    goalAmount: row.goal_amount,
    goalUnit: row.goal_unit,
    goalPer: row.goal_per,
    repeat,
    timeOfDay: row.time_of_day ?? [],
    startDate: row.start_date,
    endCondition: row.end_condition,
    endDate: row.end_date ?? undefined,
    reminderTime: row.reminder_time,
    medicationDosage: row.medication_dosage ?? undefined,
    medicationFrequencyHours: row.medication_frequency_hours ?? undefined,
  }
}

function repeatToConfig(repeat: HabitRepeat): object {
  if (repeat.type === 'daily')    return { days: repeat.days }
  if (repeat.type === 'monthly')  return { days: repeat.days }
  return { everyDays: repeat.everyDays }
}

function habitToRow(body: Omit<Habit, 'id'>, userId: string) {
  return {
    user_id: userId,
    name: body.name,
    icon: body.icon,
    category: body.category,
    goal_amount: body.goalAmount,
    goal_unit: body.goalUnit,
    goal_per: body.goalPer,
    repeat_type: body.repeat.type,
    repeat_config: repeatToConfig(body.repeat),
    time_of_day: body.timeOfDay,
    start_date: body.startDate,
    end_condition: body.endCondition,
    end_date: body.endCondition === 'on_date' ? (body.endDate ?? null) : null,
    reminder_time: body.reminderTime,
    medication_dosage: body.medicationDosage ?? null,
    medication_frequency_hours: body.medicationFrequencyHours ?? null,
  }
}

export async function GET() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(rowToHabit))
}

export async function POST(request: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Omit<Habit, 'id'> = await request.json()

  const { data, error } = await supabase
    .from('habits')
    .insert(habitToRow(body, user.id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToHabit(data), { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Habit = await request.json()

  const { data, error } = await supabase
    .from('habits')
    .update(habitToRow(body, user.id))
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToHabit(data))
}

export async function DELETE(request: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
