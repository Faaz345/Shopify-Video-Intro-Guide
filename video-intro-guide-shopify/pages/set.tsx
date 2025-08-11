import type { GetServerSideProps } from 'next'
import { jwtVerify } from 'jose'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const url = new URL(ctx.req.url || '', `http://${ctx.req.headers.host}`)
  const token = url.searchParams.get('token') || ''

  const secret = process.env.GUIDE_JWT_SECRET
  if (!secret || !token) {
    return {
      redirect: { destination: '/unauthorized', permanent: false },
    }
  }

  try {
    const encoder = new TextEncoder()
    await jwtVerify(token, encoder.encode(secret), { algorithms: ['HS256'] })

    // Set cookie and redirect to home
    const isSecure = true
    const cookie = [
      `sc_session=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      isSecure ? 'Secure' : '',
      `Max-Age=${60 * 60 * 24 * 30}`, // 30 days
    ].filter(Boolean).join('; ')

    ctx.res.setHeader('Set-Cookie', cookie)
    return {
      redirect: { destination: '/', permanent: false },
    }
  } catch {
    return {
      redirect: { destination: '/unauthorized', permanent: false },
    }
  }
}

export default function SetPage() {
  return null
}
