import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { UserProfile } from '@/lib/types'

function toProfile(row: any, email: string): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email,
    avatarUrl: row.avatar_url ?? undefined,
    city: row.city ?? '',
  }
}

export async function GET() {
  const supabase = createSupabaseServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    // Profile doesn't exist yet — create it
    const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'
    const { data: created, error: createError } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, name, city: '' })
      .select('*')
      .single()

    if (createError || !created) {
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
    return NextResponse.json(toProfile(created, user.email ?? ''))
  }

  return NextResponse.json(toProfile(data, user.email ?? ''))
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, string> = {}
  if (typeof body.city === 'string') updates.city = body.city
  if (typeof body.name === 'string') updates.name = body.name

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toProfile(data, user.email ?? ''))
}
