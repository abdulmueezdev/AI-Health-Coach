import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { serverEnv } from '@/lib/env/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/coach',
  '/meals',
  '/workouts',
  '/habits',
  '/progress',
  '/settings'
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const code = request.nextUrl.searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.searchParams.delete('code')
    redirectUrl.searchParams.delete('type')
    return NextResponse.redirect(redirectUrl)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const currentPath = request.nextUrl.pathname
  const isProtectedRoute = PROTECTED_ROUTES.some(route => currentPath.startsWith(route))

  if (user && currentPath === '/verify-email') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  if (isProtectedRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    const hasProfile = !!profile

    if (hasProfile && currentPath.startsWith('/onboarding')) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }

    if (!hasProfile && !currentPath.startsWith('/onboarding')) {
      const onboardingUrl = request.nextUrl.clone()
      onboardingUrl.pathname = '/onboarding'
      return NextResponse.redirect(onboardingUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
