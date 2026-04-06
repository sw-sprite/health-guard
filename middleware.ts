import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const isGuestMode = req.cookies.get('healthguard_guest')?.value === 'true'
    const isLoginPage = req.nextUrl.pathname === '/login'

    if ((session || isGuestMode) && isLoginPage) {
      return NextResponse.redirect(new URL('/status', req.url))
    }

    if (!session && !isGuestMode && !isLoginPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } catch {
    // Fail open if Supabase is misconfigured
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
