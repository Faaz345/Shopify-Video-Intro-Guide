import express from 'express';
import AccessToken from '../models/Token.js';
import { hashToken } from '../utils/crypto.js';

const router = express.Router();

// Only deliver content if token exists, not expired, and was just used (single-use)
router.get('/view', async (req, res, next) => {
  try {
    const { t } = req.query;
    if (!t || typeof t !== 'string') {
      return res.status(400).render('error', { message: 'Missing token' });
    }
    const tokenHash = hashToken(t);
    const doc = await AccessToken.findOne({ tokenHash }).exec();
    const now = new Date();
    if (!doc) return res.status(404).render('error', { message: 'Invalid token' });
    if (doc.expiresAt <= now) return res.status(410).render('error', { message: 'Link expired' });
    if (!doc.used) return res.status(401).render('error', { message: 'OTP verification required' });

    // Optionally bind to single device by checking IP/UA consistency
    const sameIp = (doc.lastIP || '') === (req.ip || '');
    const sameUA = (doc.userAgent || '') === (req.get('user-agent') || '');
    if (!sameIp || !sameUA) {
      return res.status(403).render('error', { message: 'This link can only be used from the original device/browser' });
    }

    // Expire the token immediately after delivering the content (hard invalidate)
    // This ensures the link cannot be reused, even from the same device/browser
    doc.expiresAt = new Date();
    await doc.save();

    // Deliver content securely (render or stream). Never expose direct file URLs.
    return res.render('content', { email: doc.email, contentRef: doc.contentRef });
  } catch (err) {
    return next(err);
  }
});

export default router;

