import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, index: true, unique: true, required: true },
    email: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false, index: true },
    usedAt: { type: Date },
    lastIP: { type: String },
    userAgent: { type: String },
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    contentRef: { type: String, required: true },
  },
  { timestamps: true }
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AccessToken', TokenSchema);

