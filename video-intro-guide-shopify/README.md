Guide app (Next.js)

Environment variables
- GUIDE_JWT_SECRET: Secret used to sign/verify JWTs for access control.

Access flow
- Email customers a link like: https://your-guide-domain.com/set?token=<SIGNED_JWT>
- The /set page verifies the token server-side, sets the sc_session HttpOnly cookie, and redirects to /
- Middleware enforces the cookie and allows access to the guide content.

Local development
- npm install
- npm run dev

Vercel deployment
- Set project root to video-intro-guide-shopify
- Add environment variable GUIDE_JWT_SECRET
- Build command: npm run build
- Output directory: .next
