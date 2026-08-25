import { NextRequest, NextResponse } from 'next/server'
import { parseSessionCookie, verifySession } from './lib/auth'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/admin']

// Public routes that don't require auth
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/storefront',
  '/storefront/',
])

const PUBLIC_PREFIXES = [
  '/storefront/',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/storefront/',
  '/api/products/template',
  '/_next/',
  '/favicon.',
  '/playbeat-logo',
  '/logo.',
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect /admin/*
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const token = parseSessionCookie(req.headers.get('cookie'))
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    const session = verifySession(token)
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|logo.svg|playbeat-logo.png).*)',
  ],
}
