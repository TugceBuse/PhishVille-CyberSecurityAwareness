const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createGameSession,
  getUserGameSessions,
  getGameSessionById
} = require('../controllers/gameSessionController');

// Oyun oturumu kaydet
router.post('/', protect, createGameSession);
// Tüm oturumları getir (en son oyun da dahil)
router.get('/', protect, getUserGameSessions);
// Tek oturumu getir
router.get('/:id', protect, getGameSessionById);

module.exports = router;