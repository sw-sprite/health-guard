import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { UserProfile } from '@/lib/types'

export async function GET() {
  const supabase = createSupabaseServer()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, medications(*)')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'
    const { data: created, error: createError } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, name, city: 'Austin, TX' })
      .select('*, medications(*)')
      .single()

    if (createError || !created) {
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json(toProfile(created, user.email ?? ''))
  }

  return NextResponse.json(toProfile(data, user.email ?? ''))
}

function toProfile(data: any, email: string): UserProfile {
  return {
    id: data.id,
    name: data.name,
    email,
    avatarUrl: data.avatar_url ?? undefined,
    city: data.city ?? 'Austin, TX',
    medications: (data.medications ?? []).map((m: any) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequencyHours: m.frequency_hours,
    })),
  }
}
