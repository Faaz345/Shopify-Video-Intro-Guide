# Secure Content Access Server

This subproject implements single-use, short-lived links with OTP verification for secure content delivery.

- Node.js + Express + MongoDB
- Token stored with: email, createdAt, expiresAt, used flag, lastIP, userAgent
- One-time password emailed on first access
- Link expires after expiry or immediately after successful OTP verification
- Content is streamed only via token-verified request, not as a static URL

Setup

1. Copy .env.example to .env and fill in values
2. Install packages: npm install
3. Run development server: npm run dev:secure

