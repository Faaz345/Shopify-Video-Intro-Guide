import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE = 'sc_session'
const PUBLIC = [/^\/_next\//, /^\/favicon\.ico$/, /^\/robots\.txt$/, /^\/sitemap\.xml$/, /^\/unauthorized$/]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some((p) => p.test(pathname))) return NextResponse.next()

  const token = req.cookies.get(COOKIE)?.value
  if (!token) return NextResponse.redirect(new URL('/unauthorized', req.url))

  try {
    const secret = process.env.GUIDE_JWT_SECRET
    if (!secret) return NextResponse.redirect(new URL('/unauthorized', req.url))

    const encoder = new TextEncoder()
    await jwtVerify(token, encoder.encode(secret), { algorithms: ['HS256'] })
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml|unauthorized).*)'],
}
