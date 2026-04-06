import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const response = NextResponse.redirect(new URL('/status', origin))
  response.cookies.set('healthguard_guest', 'true', {
    httpOnly: false,  // readable client-side so AppProvider can check it
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  })
  return response
}
