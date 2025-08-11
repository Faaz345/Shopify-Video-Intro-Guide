import express from 'express';
import AccessToken from '../models/Token.js';
import { hashToken, hashOtp } from '../utils/crypto.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// POST /otp/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { token, otp } = req.body;
    if (!token || !otp) {
      return res.status(400).render('error', { message: 'Missing token or OTP' });
    }

    const tokenHash = hashToken(token);
    const doc = await AccessToken.findOne({ tokenHash }).exec();
    if (!doc) return res.status(404).render('error', { message: 'Invalid token' });

    const now = new Date();
    if (doc.used) return res.status(410).render('error', { message: 'Link already used' });
    if (doc.expiresAt <= now) return res.status(410).render('error', { message: 'Link expired' });
    if (!doc.otpHash || !doc.otpExpiresAt || doc.otpExpiresAt <= now) {
      return res.status(400).render('error', { message: 'OTP expired, re-open your link to get a new one' });
    }

    if (hashOtp(otp) !== doc.otpHash) {
      return res.status(401).render('error', { message: 'Invalid OTP' });
    }

    // Mark token as used immediately after successful OTP
    doc.used = true;
    doc.usedAt = new Date();
    doc.otpHash = undefined;
    doc.otpExpiresAt = undefined;
    await doc.save();

    // If GUIDE_DOMAIN and GUIDE_JWT_SECRET are configured, issue a signed session cookie
    const guideDomain = (process.env.GUIDE_DOMAIN || '').trim();
    const guideSecret = (process.env.GUIDE_JWT_SECRET || '').trim();
    if (guideDomain && guideSecret) {
      const ua = req.get('user-agent') || '';
      const uaHash = crypto.createHash('sha256').update(ua).digest('hex');
      const tokenJwt = jwt.sign(
        { email: doc.email, contentRef: doc.contentRef, ua: uaHash },
        guideSecret,
        { expiresIn: '1d' }
      );
      res.cookie('sc_session', tokenJwt, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: `.${guideDomain}`,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });
      return res.redirect(`https://${guideDomain}/`);
    }

    // Fallback: Redirect to content delivery with signed token in query (local dev)
    return res.redirect(`/content/view?t=${encodeURIComponent(token)}`);
  } catch (err) {
    return next(err);
  }
});

export default router;

