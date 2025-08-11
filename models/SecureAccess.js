const mongoose = require('mongoose');
const crypto = require('crypto');

const secureAccessSchema = new mongoose.Schema({
  // Token Information
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User Information
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // Payment Details
  paymentId: {
    type: String,
    required: true
  },
  
  orderId: {
    type: String,
    required: true
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  // Token Status
  isUsed: {
    type: Boolean,
    default: false
  },
  
  isExpired: {
    type: Boolean,
    default: false
  },
  
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Security Features
  deviceFingerprint: {
    type: String,
    required: false
  },
  
  ipAddress: {
    type: String,
    required: false
  },
  
  userAgent: {
    type: String,
    required: false
  },
  
  // Access Control
  accessAttempts: {
    type: Number,
    default: 0
  },
  
  maxAccessAttempts: {
    type: Number,
    default: 3
  },
  
  // OTP Information
  otpCode: {
    type: String,
    required: false
  },
  
  otpExpiry: {
    type: Date,
    required: false
  },
  
  otpAttempts: {
    type: Number,
    default: 0
  },
  
  maxOtpAttempts: {
    type: Number,
    default: 5
  },
  
  otpVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Expires in 10 minutes by default
  },
  
  firstAccessedAt: {
    type: Date,
    required: false
  },
  
  lastAccessedAt: {
    type: Date,
    required: false
  },
  
  completedAt: {
    type: Date,
    required: false
  },
  
  // Content Delivery Tracking
  contentAccessed: {
    type: Boolean,
    default: false
  },
  
  downloadCount: {
    type: Number,
    default: 0
  },
  
  maxDownloads: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for performance
secureAccessSchema.index({ email: 1, createdAt: -1 });
secureAccessSchema.index({ token: 1, isUsed: 1 });
secureAccessSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 }); // Auto-cleanup after 15 minutes

// Static method to generate cryptographically secure token
secureAccessSchema.statics.generateSecureToken = function() {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(timestamp + randomBytes).digest('hex');
  return hash;
};

// Static method to generate OTP
secureAccessSchema.statics.generateOTP = function() {
  return crypto.randomInt(100000, 999999).toString();
};

// Instance method to check if token is valid
secureAccessSchema.methods.isValidToken = function() {
  const now = new Date();
  return !this.isUsed && 
         !this.isExpired && 
         !this.isBlocked && 
         this.createdAt > new Date(now - 10 * 60 * 1000) && // Within 10 minutes
         this.accessAttempts < this.maxAccessAttempts;
};

// Instance method to check if OTP is valid
secureAccessSchema.methods.isValidOTP = function(providedOTP) {
  const now = new Date();
  return this.otpCode === providedOTP &&
         this.otpExpiry > now &&
         this.otpAttempts < this.maxOtpAttempts &&
         !this.otpVerified;
};

// Instance method to generate and set OTP
secureAccessSchema.methods.generateOTP = function() {
  this.otpCode = this.constructor.generateOTP();
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  this.otpAttempts = 0;
  return this.otpCode;
};

// Instance method to verify OTP
secureAccessSchema.methods.verifyOTP = function(providedOTP) {
  this.otpAttempts += 1;
  
  if (this.isValidOTP(providedOTP)) {
    this.otpVerified = true;
    this.firstAccessedAt = this.firstAccessedAt || new Date();
    this.lastAccessedAt = new Date();
    return true;
  }
  
  // Block token if too many OTP attempts
  if (this.otpAttempts >= this.maxOtpAttempts) {
    this.isBlocked = true;
  }
  
  return false;
};

// Instance method to mark as used and completed
secureAccessSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.completedAt = new Date();
  this.lastAccessedAt = new Date();
};

// Instance method to track content access
secureAccessSchema.methods.trackContentAccess = function() {
  this.contentAccessed = true;
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
  
  // Block further access if max downloads exceeded
  if (this.downloadCount >= this.maxDownloads) {
    this.isUsed = true;
    this.completedAt = new Date();
  }
};

// Pre-save middleware to handle expiry
secureAccessSchema.pre('save', function(next) {
  const now = new Date();
  
  // Check if token has expired
  if (this.createdAt && now > new Date(this.createdAt.getTime() + 10 * 60 * 1000)) {
    this.isExpired = true;
  }
  
  // Check if OTP has expired
  if (this.otpExpiry && now > this.otpExpiry) {
    this.otpCode = undefined;
    this.otpExpiry = undefined;
  }
  
  next();
});

module.exports = mongoose.model('SecureAccess', secureAccessSchema);
