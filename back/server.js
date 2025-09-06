// Gerekli kütüphaneler
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

dotenv.config();

const app = express();

// Güvenlik başlıkları
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

// Sıkıştırma
app.use(compression());

// Rate Limit (genel)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dk
  max: 300,                  // 15 dk 300 istek
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI tanımlı değil!');
  process.exit(1);
}
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Bağlantısı Başarılı'))
  .catch((err) => {
    console.error('MongoDB Bağlantı Hatası: ', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Router’lar
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const gameSessionRoutes = require('./routes/gameSession');
app.use('/api/gamesessions', gameSessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
