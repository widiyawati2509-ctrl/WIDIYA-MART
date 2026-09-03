import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRequired =
    pathname.startsWith('/pesanan') ||
    pathname.startsWith('/profil') ||
    pathname.startsWith('/admin')
  const isAuthPage = pathname === '/masuk' || pathname === '/daftar'

  // Fast path for public routes: no auth check needed, respond in < 1ms
  if (!isAuthRequired && !isAuthPage) {
    return NextResponse.next({ request })
  }

  // Fast path: check cookie existence before triggering external Supabase calls
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  if (!hasAuthCookie) {
    if (isAuthRequired) {
      return NextResponse.redirect(new URL('/masuk', request.url))
    }
    return NextResponse.next({ request })
  }

  // User has session cookie, verify auth status
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect auth-required routes
  if (isAuthRequired && !user) {
    return NextResponse.redirect(new URL('/masuk', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
