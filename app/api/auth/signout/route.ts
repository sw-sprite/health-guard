import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const supabase = createSupabaseServer()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/login', origin))
  response.cookies.delete('healthguard_guest')
  return response
}
