import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/auth/') ||
    pathname === '/auth' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/auth'
  ) {
    return NextResponse.next()
  }
  const sessionCookie =
    request.cookies.get('__Secure-better-auth.session_token') ??
    request.cookies.get('better-auth.session_token')
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
