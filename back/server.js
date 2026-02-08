// Required libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

dotenv.config();

const app = express();

const requiredEnvVars = [
  'MONGO_URI',
  'FRONTEND_URL',
  'JWT_SECRET',
  'EMAIL_VERIFICATION_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Eksik .env degiskenleri: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // PDF/iframe uyumu
}));

// CORS (whitelist)
const parseOrigins = (val) => {
  if (!val) return [];
  return val.split(',').map(s => s.trim()).filter(Boolean);
};
const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN || process.env.FRONTEND_URL);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);              // Postman/server-to-server
    if (allowedOrigins.length === 0) return cb(null, true); // dev fallback
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Body limit & URL-encoded
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Compression
app.use(compression());

// Rate Limit (genel)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dk
  max: 300,                  // 15 dk 300 istek
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dk
  max: 20,                  // stricter limit for sensitive endpoints
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/users/reset-password', authLimiter);

// MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI is not defined!');
  process.exit(1);
}
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connection successful'))
  .catch((err) => {
    console.error('MongoDB connection error: ', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Routers
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const gameSessionRoutes = require('./routes/gameSession');
app.use('/api/gamesessions', gameSessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
