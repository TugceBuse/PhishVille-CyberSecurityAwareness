const mongoose = require('mongoose');
const GameSession = require('../models/gameSession');

// Helpers
const VALID_STATUSES = new Set([
  'locked',
  'active',
  'completed',
  'failed',
  'completed_hidden',
  'skipped'
]);

// Light normalize + safe type conversions
function normalizeQuest(q) {
  if (!q) return null;
  const quest = {
    questId: String(q.questId || '').trim(),
    title: String(q.title || '').trim(),
    status: String(q.status || 'locked').trim(),
    score: Number.isFinite(q.score) ? Number(q.score) : 0,
    logEventType: q.logEventType ? String(q.logEventType) : undefined,

    // in-game ms
    completedAtMs: Number.isFinite(q.completedAtMs) ? Number(q.completedAtMs) : undefined,
    // erken tamamlama
    earlyCompleted: !!q.earlyCompleted,

    // real world time
    completedAt: q.completedAt ? new Date(q.completedAt) : undefined
  };

  // Status enum check (fallback to locked if invalid)
  if (!VALID_STATUSES.has(quest.status)) {
    quest.status = 'locked';
  }

  // Required fields check (return null if questId/title missing)
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

    // in-game ms
    gameMs: Number.isFinite(ev.gameMs) ? Number(ev.gameMs) : undefined,

    // real world time
    timestamp: ev.timestamp ? new Date(ev.timestamp) : undefined
  };

  if (!log.type) return null;
  return log;
}

// Create game session
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
      return res.status(400).json({ error: "Quests cannot be empty." });
    }

    // totalScore: if not provided, sum quests.score
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

    res.status(201).json({ message: "GameSession saved successfully.", session });
  } catch (err) {
    console.error("GameSession save error:", err);
    res.status(500).json({ error: "GameSession kaydedilemedi." });
  }
};

// Get all sessions of current user (optional pagination)
exports.getUserGameSessions = async (req, res) => {
  try {
    const rawPage = Number(req.query.page || 1);
    const rawLimit = Number(req.query.limit || 20);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 100)
      : 20;
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
    console.error("GameSession getUserGameSessions error:", err);
    res.status(500).json({ error: "Game sessions could not be fetched." });
  }
};

// Get single session by id
exports.getGameSessionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid game session ID." });
    }

    const session = await GameSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!session) return res.status(404).json({ error: "Game session not found." });
    res.json(session);
  } catch (err) {
    console.error("GameSession getGameSessionById error:", err);
    res.status(500).json({ error: "Game session could not be fetched." });
  }
};
