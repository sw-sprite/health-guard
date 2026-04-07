import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { HabitEntry } from '@/lib/types'

function toEntry(row: any): HabitEntry {
  return {
    habitId: row.habit_id,
    date: row.entry_date,
    status: row.status,
    amount: row.amount,
  }
}

// GET /api/habit-entries  (fetches all entries for the user — scoped by RLS)
export async function GET() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(toEntry))
}

// PUT /api/habit-entries  (upsert a single entry)
export async function PUT(request: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: HabitEntry = await request.json()

  const { data, error } = await supabase
    .from('habit_entries')
    .upsert(
      {
        user_id: user.id,
        habit_id: body.habitId,
        entry_date: body.date,
        status: body.status,
        amount: body.amount,
      },
      { onConflict: 'habit_id,entry_date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toEntry(data))
}
