import express from 'express';
import AccessToken from '../models/Token.js';
import { generateToken, hashToken, inMinutes } from '../utils/crypto.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Endpoint to create a token after purchase
// This should be called from your purchase flow with the buyer's email and content reference
router.post('/create', async (req, res, next) => {
  try {
    const { email, contentRef } = req.body;
    if (!email || !contentRef) {
      return res.status(400).json({ error: 'email and contentRef are required' });
    }

    const ttlSec = parseInt(process.env.TOKEN_TTL_SECONDS || '600', 10);

    const token = generateToken(24);
    const tokenHash = hashToken(token);

    const doc = await AccessToken.create({
      tokenHash,
      email: email.toLowerCase(),
      expiresAt: new Date(Date.now() + ttlSec * 1000),
      contentRef,
    });

    const link = new URL('/token/access', process.env.APP_BASE_URL);
    link.searchParams.set('t', token);

    const smtpHost = (process.env.SMTP_HOST || '').toLowerCase();
    const hasSmtp = smtpHost && smtpHost !== 'smtp.example.com' && !!process.env.SMTP_USER;

    if (hasSmtp) {
      try {
        await sendEmail({
          to: email,
          subject: 'Your secure access link',
          html: `
            cpeThanks for your purchase. Your secure access link is below. It expires in ${Math.floor(ttlSec/60)} minutes.c/pe
            cpeca href="${link.toString()}"eAccess your contentc/aec/pe
            cpeIf you did not request this, you can ignore this email.c/pe
          `,
        });
      } catch (e) {
        console.error('Email send failed (continuing with link response):', e.message);
      }
    } else {
      console.warn('SMTP not configured; returning link in API response only');
    }

    return res.json({ message: 'Link generated', id: doc._id, link: link.toString() });
  } catch (err) {
    return next(err);
  }
});

// When user clicks the emailed link
router.get('/access', async (req, res, next) => {
  try {
    const { t } = req.query;
    if (!t || typeof t !== 'string') {
      return res.status(400).render('error', { message: 'Invalid link' });
    }

    const tokenHash = hashToken(t);
    const now = new Date();

    const doc = await AccessToken.findOne({ tokenHash }).exec();
    if (!doc) {
      return res.status(404).render('error', { message: 'Link not found or already used' });
    }

    if (doc.used) {
      return res.status(410).render('error', { message: 'This link has already been used' });
    }
    if (doc.expiresAt <= now) {
      return res.status(410).render('error', { message: 'Link has expired' });
    }

    // Issue OTP and send to email on first access or if expired
    const { generateOtp, hashOtp } = await import('../utils/crypto.js');
    const otp = generateOtp(6);
    doc.otpHash = hashOtp(otp);
    doc.otpExpiresAt = inMinutes(10);
    doc.lastIP = req.ip;
    doc.userAgent = req.get('user-agent');
    await doc.save();

    await sendEmail({
      to: doc.email,
      subject: 'Your One-Time Password (OTP)',
      html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`
    });

    // Render OTP form including token param (not stored in cookies)
    return res.render('otp', { token: t, email: doc.email });
  } catch (err) {
    return next(err);
  }
});

export default router;

