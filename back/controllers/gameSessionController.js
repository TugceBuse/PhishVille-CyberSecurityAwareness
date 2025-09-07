const GameSession = require('../models/gameSession');

// Yardımcılar
const VALID_STATUSES = new Set([
  'locked',
  'active',
  'completed',
  'failed',
  'completed_hidden',
  'skipped'
]);

// Hafif normalize + güvenli tip dönüşümleri
function normalizeQuest(q) {
  if (!q) return null;
  const quest = {
    questId: String(q.questId || '').trim(),
    title: String(q.title || '').trim(),
    status: String(q.status || 'locked').trim(),
    score: Number.isFinite(q.score) ? Number(q.score) : 0,
    logEventType: q.logEventType ? String(q.logEventType) : undefined,

    // oyun içi ms
    completedAtMs: Number.isFinite(q.completedAtMs) ? Number(q.completedAtMs) : undefined,
    // erken tamamlama
    earlyCompleted: !!q.earlyCompleted,

    // gerçek dünya zamanı
    completedAt: q.completedAt ? new Date(q.completedAt) : undefined
  };

  // Status enum kontrolü (uyumsuzsa locked’a düşür)
  if (!VALID_STATUSES.has(quest.status)) {
    quest.status = 'locked';
  }

  // Zorunlu alan kontrolü (questId/title yoksa null dön)
  if (!quest.questId || !quest.title) return null;

  return quest;
}

function normalizeEventLog(ev) {
  if (!ev) return null;
  const log = {
    type: String(ev.type || '').trim(),
    questId: ev.questId ? String(ev.questId) : undefined,
    logEventType: ev.logEventType ? String(ev.logEventType) : undefined,
    value: Number.isFinite(ev.value) ? Number(ev.value) : 0,
    data: ev.data,

    // oyun içi ms
    gameMs: Number.isFinite(ev.gameMs) ? Number(ev.gameMs) : undefined,

    // gerçek dünya zamanı
    timestamp: ev.timestamp ? new Date(ev.timestamp) : undefined
  };

  if (!log.type) return null;
  return log;
}

// Oyun oturumu oluştur (mevcut fonksiyon) — GÜNCELLENDİ
exports.createGameSession = async (req, res) => {
  try {
    const { quests, eventLogs, totalScore, gameVersion, deviceInfo, startedAt } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(quests) || !Array.isArray(eventLogs)) {
      return res.status(400).json({ error: "Eksik veri. quests ve eventLogs gereklidir." });
    }

    // Normalize
    const normQuests = quests
      .map(normalizeQuest)
      .filter(Boolean);

    const normLogs = eventLogs
      .map(normalizeEventLog)
      .filter(Boolean);

    if (normQuests.length === 0) {
      return res.status(400).json({ error: "Quests boş olamaz." });
    }

    // totalScore: gönderilmediyse quests.score toplamı
    const computedTotal = normQuests.reduce((acc, q) => acc + (Number(q.score) || 0), 0);
    const finalTotalScore = Number.isFinite(totalScore) ? Number(totalScore) : computedTotal;

    const endedAt = new Date();
    const startedAtDate = startedAt ? new Date(startedAt) : endedAt;

    const session = new GameSession({
      userId,
      quests: normQuests,
      eventLogs: normLogs,
      totalScore: finalTotalScore,
      endedAt,
      startedAt: startedAtDate,
      gameVersion,
      deviceInfo
    });

    await session.save();

    res.status(201).json({ message: "GameSession başarıyla kaydedildi.", session });
  } catch (err) {
    console.error("GameSession kayıt hatası:", err);
    res.status(500).json({ error: "GameSession kaydedilemedi." });
  }
};

// Kullanıcının tüm oyun oturumlarını getirir — GÜNCELLENDİ (opsiyonel sayfalama)
exports.getUserGameSessions = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      GameSession.find({ userId: req.user.id })
        .sort({ endedAt: -1 })
        .skip(skip)
        .limit(limit),
      GameSession.countDocuments({ userId: req.user.id })
    ]);

    res.json({
      page,
      limit,
      total,
      sessions
    });
  } catch (err) {
    console.error("GameSession getUserGameSessions hatası:", err);
    res.status(500).json({ error: "Oyun oturumları getirilemedi." });
  }
};

// Belirli bir oturumu id'ye göre getirir (mevcut mantık)
exports.getGameSessionById = async (req, res) => {
  try {
    const session = await GameSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!session) return res.status(404).json({ error: "Oyun oturumu bulunamadı." });
    res.json(session);
  } catch (err) {
    console.error("GameSession getGameSessionById hatası:", err);
    res.status(500).json({ error: "Oyun oturumu getirilemedi." });
  }
};
