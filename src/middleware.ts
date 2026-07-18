import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'


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
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars in middleware')
      return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
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
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
