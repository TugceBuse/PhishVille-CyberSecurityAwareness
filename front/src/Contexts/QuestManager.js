import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotificationContext } from "./NotificationContext";
import { QUEST_LIST } from "../constants/questList";
import { useTimeContext } from "./TimeContext";

const QuestManagerContext = createContext();

export function useQuestManager() {
  return useContext(QuestManagerContext);
}

export function QuestManagerProvider({ children }) {
  // Oyun zamanı ms cinsinden
  const { gameMs } = useTimeContext();

  // Bildirim
  const { addNotification } = useNotificationContext();

  // TaskApp kuruluysa yeni görev bildirimi göstermek için
  const [isTaskAppInstalled, setIsTaskAppInstalled] = useState(false);

  // ─────────────────────────────────────────────────────────
  // Yardımcı tip denetçileri
  const isSuccess = (st) => st === "completed" || st === "completed_hidden";
  const isTerminal = (st) =>
    st === "completed" || st === "completed_hidden" || st === "failed" || st === "skipped";

  // ─────────────────────────────────────────────────────────
  // Normalize – eski alanları (requires/unlocks) yeni şemaya map’ler
  const normalizeQuest = (q) => ({
    ...q,
    // Görünürlük & davranış varsayılanları
    visibility: q.visibility ?? "auto",
    acceptsEarlyCompletion: q.acceptsEarlyCompletion ?? true,
    optional: q.optional ?? false,

    // Başarı bağımlılığı: yoksa eski requires’ı kullan
    requiresAll:
      Array.isArray(q.requiresAll)
        ? q.requiresAll
        : Array.isArray(q.requires)
        ? q.requires
        : [],

    // Esnek bağımlılık: yoksa boş
    requiresAny: Array.isArray(q.requiresAny) ? q.requiresAny : [],

    // Başarı dalı unlock: yoksa eski unlocks’u kullan
    unlocksOnSuccess:
      Array.isArray(q.unlocksOnSuccess)
        ? q.unlocksOnSuccess
        : Array.isArray(q.unlocks)
        ? q.unlocks
        : [],

    // Başarısızlık dalı unlock
    unlocksOnFail: Array.isArray(q.unlocksOnFail) ? q.unlocksOnFail : [],

    // İç bayrak: bir başka görevin sonucu bu görevi açtı mı?
    _unlockFlag: q._unlockFlag ?? false,

    // Güvenli defaultlar
    status: q.status || "locked",
    completedAt: q.completedAt ?? null,     // gerçek tarih kullanılmıyor ama geriye uyum için korunuyor
    completedAtMs: q.completedAtMs ?? null, // OYUN İÇİ zaman
    earlyCompleted: q.earlyCompleted ?? false, // ← YENİ: normalize
    score: q.score ?? 0,
  });

  const normalizeList = (list) => list.map(normalizeQuest);

  const [quests, setQuests] = useState(() => normalizeList(QUEST_LIST));

  // ─────────────────────────────────────────────────────────
  // Fail yüzünden başarı bağımlılığı imkânsızlaşan görevleri SKIP et
  const resolveSkips = (arr) => {
    let updated = arr.map((q) => ({ ...q }));

    updated.forEach((q, idx) => {
      if (q.status !== "locked") return;
      if (!q.requiresAll || q.requiresAll.length === 0) return;

      const anyHardBlocked = q.requiresAll.some((rid) => {
        const rq = updated.find((x) => x.id === rid);
        return rq && (rq.status === "failed" || rq.status === "skipped");
      });

      if (anyHardBlocked) {
        updated[idx] = {
          ...q,
          status: "skipped",
          completedAtMs: updated[idx].completedAtMs ?? gameMs, // OYUN İÇİ zaman kullan
          // earlyCompleted'a dokunmuyoruz
        };
      }
    });

    return { updated };
  };

  // ─────────────────────────────────────────────────────────
  // Locked → Active aktivasyon kuralları
  const activateEligibleQuests = (arr) => {
    let updated = arr.map((q) => ({ ...q }));
    const newlyActivated = [];

    updated.forEach((q, idx) => {
      if (q.status !== "locked") return;

      // Gizli görevler UI’da kendi kendine active olmasın
      if (q.visibility === "hidden") return;

      const allReq = Array.isArray(q.requiresAll) ? q.requiresAll : [];
      const anyReq = Array.isArray(q.requiresAny) ? q.requiresAny : [];

      // Başarı bağımlılığı (requiresAll): Hepsi completed/completed_hidden olmalı
      const allOk =
        allReq.length === 0
          ? true
          : allReq.every((rid) => {
              const rq = updated.find((x) => x.id === rid);
              return rq && isSuccess(rq.status);
            });

      // Esnek bağımlılık (requiresAny): Listedekilerden biri terminal olmalı
      const anyOk =
        anyReq.length === 0
          ? true
          : anyReq.some((rid) => {
              const rq = updated.find((x) => x.id === rid);
              return rq && isTerminal(rq.status);
            });

      // Bağımlılık yoksa, sadece unlockFlag ile aktif edelim (görev “açıldı” mı?)
      const hasNoDeps = allReq.length === 0 && anyReq.length === 0;

      // Aktivasyon kriteri
      const canActivate = hasNoDeps
        ? q._unlockFlag === true
        : allOk && anyOk;

      if (canActivate) {
        updated[idx] = { ...q, status: "active" };
        newlyActivated.push(updated[idx]);
      }
    });

    return { updated, newlyActivated };
  };

  // ─────────────────────────────────────────────────────────
  // YENİ: Tek bir görevin şu anda A-K-T-İ-F hale gelebilir olup olmadığını kontrol eder (yan etkisiz)
  const canActivateQuest = (arr, quest) => {
    if (!quest || quest.status !== "locked") return false;
    if (quest.visibility === "hidden") return false;

    const allReq = Array.isArray(quest.requiresAll) ? quest.requiresAll : [];
    const anyReq = Array.isArray(quest.requiresAny) ? quest.requiresAny : [];

    const allOk =
      allReq.length === 0
        ? true
        : allReq.every((rid) => {
            const rq = arr.find((x) => x.id === rid);
            return rq && isSuccess(rq.status);
          });

    const anyOk =
      anyReq.length === 0
        ? true
        : anyReq.some((rid) => {
            const rq = arr.find((x) => x.id === rid);
            return rq && isTerminal(rq.status);
          });

    const hasNoDeps = allReq.length === 0 && anyReq.length === 0;
    const canActivate = hasNoDeps ? quest._unlockFlag === true : allOk && anyOk;

    return canActivate;
  };

  // ─────────────────────────────────────────────────────────
  // Bir görevin sonucu ile hedef görevleri “aç” (unlockFlag)
  const applyUnlocks = (arr, fromId, outcome /* "success" | "fail" */) => {
    const from = arr.find((x) => x.id === fromId);
    if (!from) return arr;

    const targets =
      outcome === "success" ? from.unlocksOnSuccess : from.unlocksOnFail;

    if (!targets || targets.length === 0) return arr;

    const updated = arr.map((q) =>
      targets.includes(q.id) ? { ...q, _unlockFlag: true } : q
    );

    return updated;
  };

  // ─────────────────────────────────────────────────────────
  // AKTİF görevler (mevcut API korunuyor)
  const getActiveQuests = () => quests.filter((q) => q.status === "active");

  // ─────────────────────────────────────────────────────────
  // TEK NOKTADAN TAMAMLAMA:
  // - active ise → completed (earlyCompleted:false)
  // - locked && acceptsEarlyCompletion !== false ise → completed_hidden (earlyCompleted:true)
  // - locked && acceptsEarlyCompletion === false ise → eğer şu an aktive edilebiliyorsa
  //   aynı çağrıda active yap + hemen completed; değilse no-op
  const completeQuest = (id) => {
    setQuests((prev) => {
      const cur = prev.find((q) => q.id === id);
      if (!cur) return prev;

      // completed/failed ise tekrar işlem yapmayalım
      if (cur.status === "completed" || cur.status === "failed") return prev;

      const isEarlyCandidate =
        cur.status === "locked" && cur.acceptsEarlyCompletion !== false;

      const isLockedNoEarly =
        cur.status === "locked" && cur.acceptsEarlyCompletion === false;

      let updated = prev.map((q) => ({ ...q }));

      // 0) locked + erken yasak → şu an aktive edilebilir mi?
      if (isLockedNoEarly) {
        const idx = updated.findIndex((x) => x.id === id);
        if (idx !== -1 && canActivateQuest(updated, updated[idx])) {
          // aynı çağrıda aktif et ve hemen tamamla
          updated[idx].status = "active";
          // normal tamamlama akışına aşağıda girecek
        } else {
          // Aktivasyon mümkün değil → hiçbir şey yapma
          return prev;
        }
      }

      // 1) Durumu güncelle
      updated = updated.map((q) => {
        if (q.id !== id) return q;

        // Erken tamamlama
        if (isEarlyCandidate) {
          return {
            ...q,
            status: "completed_hidden",
            completedAtMs: gameMs,   // OYUN İÇİ zaman
            earlyCompleted: true,    // ← KRİTİK: erken tamamlandı
            score: q.point || 0,
            logEventType: q.logEventType,
          };
        }

        // Normal tamamlama (aktifken veya az önce aktive edildi)
        if (q.status === "active") {
          return {
            ...q,
            status: "completed",
            completedAtMs: gameMs,   // OYUN İÇİ zaman
            earlyCompleted: false,   // ← aktifken tamamlandı
            score: q.point || 0,
            logEventType: q.logEventType,
          };
        }

        // (Güvenlik için) diğer durumlar: hiçbir şey yapma
        return q;
      });

      // Tamamlama gerçekleşti mi?
      const after = updated.find((q) => q.id === id);
      const actuallyCompleted =
        after && (after.status === "completed" || after.status === "completed_hidden");
      if (!actuallyCompleted) return updated;

      // 2) Başarı dalı unlock’ları uygula
      updated = applyUnlocks(updated, id, "success");

      // 3) Skip analizi
      const skipRes = resolveSkips(updated);
      updated = skipRes.updated;

      // 4) Aktivasyon
      const { updated: activated, newlyActivated } = activateEligibleQuests(updated);
      updated = activated;

      // 5) Bildirim
      if (isTaskAppInstalled && newlyActivated.length > 0) {
        newlyActivated.forEach((q) =>
          addNotification({
            appType: "taskapp",
            title: "Yeni Görev Açıldı",
            message: q.title,
            isPopup: true,
            isTaskbar: false,
            duration: 3200,
          })
        );
      }

      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────
  // BAŞARISIZLIK
  const failQuest = (id) => {
    setQuests((prev) => {
      const quest = prev.find((q) => q.id === id);
      if (!quest || quest.status === "completed") {
        // completed görevi faile çevirmeyelim
        return prev;
      }

      // 1) failed
      let updated = prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "failed",
              completedAtMs: gameMs, // OYUN İÇİ zaman
              // earlyCompleted'a dokunmuyoruz
              score: q.penalty || 0,
              logEventType: q.logEventType,
            }
          : q
      );

      // 2) Başarısızlık dalı unlock’ları uygula
      updated = applyUnlocks(updated, id, "fail");

      // 3) Skip analizi
      const skipRes = resolveSkips(updated);
      updated = skipRes.updated;

      // 4) Aktivasyon
      const { updated: activated, newlyActivated } = activateEligibleQuests(updated);
      updated = activated;

      // 5) Bildirim
      if (isTaskAppInstalled && newlyActivated.length > 0) {
        newlyActivated.forEach((q) =>
          addNotification({
            appType: "taskapp",
            title: "Yeni Görev Açıldı",
            message: q.title,
            isPopup: true,
            isTaskbar: false,
            duration: 3200,
          })
        );
      }

      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────
  // Reset – tüm görevleri normalize ederek sıfırla
  const resetQuests = () => {
    setQuests(
      normalizeList(
        QUEST_LIST.map((q) => ({
          ...q,
          status: q.status || "locked",
          completedAt: null,    // gerçek tarih tutulmuyorsa boş bırak
          completedAtMs: null,  // oyun içi ms sıfırla
          earlyCompleted: false,
          score: 0,
          logEventType: q.logEventType,
          _unlockFlag: false,
        }))
      )
    );
  };

  const value = {
    quests,
    getActiveQuests,
    completeQuest,       // ← Dışarıdan sadece bu…
    failQuest,           // ← …ve bu çağrılacak.
    resetQuests,
    setQuests,
    isTaskAppInstalled,
    setIsTaskAppInstalled,
  };

  return (
    <QuestManagerContext.Provider value={value}>
      {children}
    </QuestManagerContext.Provider>
  );
}
