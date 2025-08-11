import crypto from 'crypto';

export function generateToken(byteLength = 24) {
  return crypto.randomBytes(byteLength).toString('base64url');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateOtp(digits = 6) {
  // RFC 4226 style numeric; use crypto for uniform distribution
  const max = 10 ** digits;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(digits, '0');
}

export function hashOtp(otp) {
  // Hash OTP + pepper to avoid rainbow attacks; OTP is short-lived
  const pepper = process.env.OTP_PEPPER || 'static_pepper_change_me';
  return crypto.createHash('sha256').update(`${pepper}:${otp}`).digest('hex');
}

export function inMinutes(min) {
  return new Date(Date.now() + min * 60 * 1000);
}

