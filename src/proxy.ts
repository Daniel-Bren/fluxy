import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/cadastro') ||
    request.nextUrl.pathname.startsWith('/convite') ||
    request.nextUrl.pathname.startsWith('/recuperar-senha') ||
    request.nextUrl.pathname.startsWith('/redefinir-senha') ||
    request.nextUrl.pathname.startsWith('/auth/callback')

  if (!user && !isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const redirectAuthenticated = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/cadastro') ||
    request.nextUrl.pathname.startsWith('/convite') ||
    request.nextUrl.pathname.startsWith('/recuperar-senha')

  if (user && redirectAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const temModoNaUrl = request.nextUrl.searchParams.has('modo')

  if (user && isDashboard && !temModoNaUrl) {
    const modoSalvo = request.cookies.get('fluxy_modo')?.value
    const modo = modoSalvo === 'compartilhado' ? 'compartilhado' : 'pessoal'
    const url = request.nextUrl.clone()
    url.searchParams.set('modo', modo)

    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })

    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
