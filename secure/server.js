import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { fileURLToPath } from 'url';

import tokenRoutes from './routes/token.js';
import otpRoutes from './routes/otp.js';
import contentRoutes from './routes/content.js';

// Load env: prefer secure/.env, then fallback to project .env
const secureEnvPath = path.resolve(process.cwd(), 'secure/.env');
if (fs.existsSync(secureEnvPath)) {
  dotenv.config({ path: secureEnvPath });
} else {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", 'data:'],
      "connect-src": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 15552000, includeSubDomains: true, preload: true }
}));

// Logging
app.use(morgan('combined'));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rate limiting
const rateWindowMs = parseInt(process.env.RATE_WINDOW_MS || '60000', 10);
const rateMax = parseInt(process.env.RATE_MAX || '100', 10);
app.use(rateLimit({ windowMs: rateWindowMs, max: rateMax, standardHeaders: true, legacyHeaders: false }));

// DB
mongoose.set('strictQuery', true);
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri || typeof mongoUri !== 'string' || !mongoUri.trim()) {
  console.error('Configuration error: MONGODB_URI is not set. Create secure/.env (or .env) and set MONGODB_URI. Example:');
  console.error('MONGODB_URI=mongodb://127.0.0.1:27017/secure_content');
  process.exit(1);
}
mongoose.connect(mongoUri).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

// Routes
app.use('/token', tokenRoutes); // creation and validation of token
app.use('/otp', otpRoutes); // OTP flows
app.use('/content', contentRoutes); // secure content delivery

// Basic root
app.get('/', (_req, res) => {
  res.send('Secure Content Access Server is running');
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Something went wrong', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => {
  console.log(`Secure server listening on port ${port}`);
});

