const mongoose = require('mongoose');

/**
 * EventLogSchema
 * - type:           Olay türü (örn: phishing_mail_open, wrong_url_visit)
 * - questId:        İlgili quest (opsiyonel)
 * - logEventType:   Kategorik etiket (örn: wifi, mailbox, taskapp)
 * - value:          Puan etkisi (+ / -)
 * - data:           Ekstra serbest veri (url, mailId, vs.)
 * - gameMs:         OYUN İÇİ zaman (ms)  ⭠ YENİ
 * - timestamp:      GERÇEK zaman (Date)
 */
const EventLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    questId: { type: String },
    logEventType: { type: String },
    value: { type: Number, default: 0 },
    data: { type: mongoose.Schema.Types.Mixed },

    // YENİ: oyun içi zaman damgası (ms)
    gameMs: { type: Number },

    // Mevcut: gerçek dünya zamanı
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

/**
 * QuestStatusSchema
 * - questId:         Zorunlu
 * - title:           Görev başlığı
 * - status:          locked | active | completed | failed | completed_hidden | skipped  ⭠ YENİ enumlar
 * - completedAt:     GERÇEK zaman (Date)       (tamamlandı/failed/skipped anı)
 * - completedAtMs:   OYUN İÇİ zaman (ms)       ⭠ YENİ
 * - earlyCompleted:  Erken tamamlama bayrağı   ⭠ YENİ
 * - score:           Bu görevden kazanılan/kaybedilen puan
 * - logEventType:    Kategori etiketi
 */
const QuestStatusSchema = new mongoose.Schema(
  {
    questId: { type: String, required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['locked', 'active', 'completed', 'failed', 'completed_hidden', 'skipped'],
      required: true
    },

    // Gerçek tarih (opsiyonel)
    completedAt: { type: Date },

    // YENİ: oyun içi zaman damgası (ms)
    completedAtMs: { type: Number },

    // YENİ: erken tamamlama bilgisi
    earlyCompleted: { type: Boolean, default: false },

    score: { type: Number, default: 0 },
    logEventType: { type: String }
  },
  { _id: false }
);

const GameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Gerçek dünya zamanı
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },                            // Oyun bitiş zamanı

  totalScore: { type: Number, default: 0 },          // Hesaplanmış toplam skor
  quests: [QuestStatusSchema],                        // Tüm görevlerin durumu ve detayları
  eventLogs: [EventLogSchema],                        // Oyun boyunca tüm event loglar

  gameVersion: { type: String },                      // (İsteğe bağlı) Oyun versiyonu
  deviceInfo: { type: String },                       // (İsteğe bağlı) Cihaz/browser bilgisi
  // Gerekirse ekstra metadata eklenebilir
});

module.exports = mongoose.model("GameSession", GameSessionSchema);
