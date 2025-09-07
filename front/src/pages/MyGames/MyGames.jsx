import React, { useEffect, useState } from "react";
import styles from "./MyGames.module.css";
import { useNavigate } from "react-router-dom";
import { fetchGameSessions } from "../../services/gameSessionService";
import { useAuthContext } from "../../Contexts/AuthContext";

// Türkçe tarih formatı
const toTurkishDate = (date) =>
  date ? new Date(date).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) : "-";

// Süreyi "X dk Y sn" formatında döndürür
const formatDuration = (seconds) => {
  if (seconds == null || isNaN(seconds) || seconds < 0) return "-";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min} dk ${sec} sn`;
};

// Yeni statü yardımcıları
const isSuccess = (st) => st === "completed" || st === "completed_hidden";
const isFail = (st) => st === "failed";
const isSkipped = (st) => st === "skipped";

const getStatus = (gs) => {
  const quests = gs?.quests || [];
  if (quests.length === 0) return "Başlatılmadı";

  const allSucceeded = quests.length > 0 && quests.every(q => isSuccess(q.status));
  const anyFailed = quests.some(q => isFail(q.status));
  const anySkipped = quests.some(q => isSkipped(q.status));

  if (allSucceeded) return "Başarıyla Tamamlandı";
  if (anyFailed) return "Erken Sonlandı";
  if (anySkipped) return "Bazı Görevler Atlandı";
  return "Tamamlandı";
};

// Oyun analizi için eventLogs'u işle
const extractErrors = (gs) => {
  const logs = gs?.eventLogs || [];

  // 1. Açık hata eventleri (fail/error)
  const logErrors = logs
    .filter(ev => ev?.type === "fail" || ev?.logEventType === "error")
    .map(ev => {
      let detay = "";
      if (ev?.data) {
        const reason = ev.data.reason || ev.data.message;
        if (reason) detay += ` (${reason})`;
        Object.entries(ev.data).forEach(([key, value]) => {
          if (key !== "reason" && key !== "message" && value) {
            detay += ` | ${key}: ${value}`;
          }
        });
      }
      return (ev?.logEventType || ev?.type || "Hata") + detay;
    });

  // 2. value < 0 ve özelleştirilmiş açıklama
  const negativeValueLogs = logs
    .filter(ev =>
      typeof ev?.value === "number" && ev.value < 0 &&
      !(ev?.type === "fail" || ev?.logEventType === "error")
    )
    .map(ev => {
      // Özelleştirilmiş register log metni
      if (ev?.type?.includes("register") && ev?.data?.for) {
        let desc = `[${ev.data.for}] kayıt - `;
        desc += ev.data.isStrong === false
          ? "Zayıf şifre seçildi"
          : ev.data.isStrong === true
            ? "Güçlü şifre seçildi"
            : "Şifre güvenliği bilinmiyor";
        return `${desc} (Puan: ${ev.value})`;
      }
      // Diğer tüm negatif loglar için
      let detay = "";
      if (ev?.data) {
        Object.entries(ev.data).forEach(([key, value]) => {
          if (value) detay += ` | ${key}: ${value}`;
        });
      }
      return (
        (ev?.data?.reason || ev?.data?.message || ev?.logEventType || ev?.type || "Negatif Etki") +
        ` (Puan: ${ev?.value})` +
        detay
      );
    });

  return [...logErrors, ...negativeValueLogs];
};

const extractViruses = (gs) => {
  const logs = gs?.eventLogs || [];
  return logs
    .filter(ev => ev?.logEventType === "virus" || ev?.type === "add_virus" || ev?.type === "remove_virus")
    .map(ev => {
      let action = "";
      if (ev?.type?.includes("add")) action = "Virüs Bulaşma: ";
      else if (ev?.type?.includes("remove")) action = "Virüs Temizleme: ";
      const tarih = toTurkishDate(ev?.timestamp);
      const name = ev?.virusType || ev?.data?.type || "Virüs";
      const impact = ev?.data?.impact ? ` (${ev.data.impact})` : "";
      const puan = typeof ev?.value === "number" && ev.value !== 0 ? ` (Puan: ${ev.value})` : "";
      return `${action}${name} - ${tarih}${impact}${puan}`;
    });
};

const mapGameSession = (gs, idx) => {
  // Süre hesabı
  let durationSec = null;
  if (gs?.startedAt && gs?.endedAt) {
    durationSec = Math.floor((new Date(gs.endedAt) - new Date(gs.startedAt)) / 1000);
  } else if (gs?.startTime && gs?.endTime) {
    durationSec = Math.floor((new Date(gs.endTime) - new Date(gs.startTime)) / 1000);
  } else if (gs?.duration != null) {
    durationSec = gs.duration;
  }

  const quests = gs?.quests || [];
  const completedCount = quests.filter(q => isSuccess(q.status)).length;

  return {
    id: gs?._id || idx + 1,
    date: toTurkishDate(gs?.endedAt || gs?.createdAt),
    score: gs?.totalScore ?? 0,
    completedQuests: completedCount,
    totalQuests: quests.length,
    duration: formatDuration(durationSec),
    status: getStatus(gs),
    tasks: quests.map(q => ({
      name: q?.title || "Görev Adı Yok",
      done: isSuccess(q?.status)
    })),
    errors: extractErrors(gs),
    viruses: extractViruses(gs),
  };
};

const GameDetailModal = ({ game, onClose }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h3>Oyun Detayı</h3>
        <span className={styles.modalDate}>{game.date}</span>
      </div>
      <div className={styles.detailRow}><b>Puan:</b> <span>{game.score}</span></div>
      <div className={styles.detailRow}><b>Süre:</b> <span>{game.duration}</span></div>
      <div className={styles.detailRow}><b>Durum:</b> <span>{game.status}</span></div>
      <div className={styles.detailRow}><b>Görevler:</b>
        <ul className={styles.tasksList}>
          {game.tasks.map((t, i) => (
            <li key={i}>
              <span className={t.done ? styles.done : styles.fail}>
                {t.done ? "✔" : "✘"}
              </span>{" "}
              {t.name}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.detailRow}>
        <b>Hatalar:</b>
        <ul>
          {game.errors.length === 0
            ? <li>Yok</li>
            : game.errors.map((err, i) => <li key={i} className={styles.error}>{err}</li>)
          }
        </ul>
      </div>
      <div className={styles.detailRow}>
        <b>Virüs Etkisi:</b>
        <ul>
          {game.viruses.length === 0
            ? <li>Yok</li>
            : game.viruses.map((v, i) => <li key={i}>{v}</li>)
          }
        </ul>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>Kapat</button>
    </div>
  </div>
);

const MyGames = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthContext();
  const navigate = useNavigate();

  // Güvenli dizi çevirici
  const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.sessions)) return value.sessions;
    return [];
  };

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const response = await fetchGameSessions(token);
        const list = asArray(response);
        setGames(list.map(mapGameSession));
      } catch (err) {
        console.error("Oyunlar çekilemedi:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, [token]);

  // Son oyun için animasyonlu puan
  useEffect(() => {
    if (!games[0]) return;
    let start = 0;
    const end = Number(games[0].score) || 0;
    if (start === end) {
      setDisplayedScore(end);
      return;
    }
    const step = Math.max(1, Math.floor(Math.abs(end) / 35));
    const interval = setInterval(() => {
      start += step * (end < 0 ? -1 : 1);
      if ((end >= 0 && start >= end) || (end < 0 && start <= end)) {
        start = end;
        clearInterval(interval);
      }
      setDisplayedScore(start);
    }, 16);
    return () => clearInterval(interval);
  }, [games]);

  const latestGame = games[0];
  const otherGames = games.slice(1);

  return (
    <div className={styles.wrapper}>
      <img src="/phishville.png" alt="PhishVilleLogo" className={styles.phishvilleGoback} title="www.safeClicks.com" onClick={() => navigate("/")}/>
      <h2>
        <span role="img" aria-label="gamepad" style={{fontSize: "1.6em", marginRight: 8}}>
          <img src="icons/gamepad.png" alt="My Games Icon"/> 
        </span>
        Oyun Bilgilerim
      </h2>
      {loading && <div>Yükleniyor...</div>}
      {latestGame && !loading && (
        <div className={styles.latestGameCard} onClick={() => setSelectedGame(latestGame)}>
          <div className={styles.latestTitle}>En Son Oynanan Oyun</div>
          <div className={styles.scoreCenterArea}>
            <div className={styles.scoreLabel}>Puan</div>
            <div className={styles.animatedScore}>{displayedScore}</div>
          </div>
          <div className={styles.latestContent}>
            <div><b>Süre:</b> <span>{latestGame.duration}</span></div>
            <div><b>Durum:</b> <span>{latestGame.status}</span></div>
            <div><b>Tarih:</b> <span>{latestGame.date}</span></div>
            <div><b>Görevler:</b> <span>{latestGame.completedQuests}/{latestGame.totalQuests}</span></div>
          </div>
          <button className={styles.detailBtn}>Detayları Görüntüle</button>
        </div>
      )}
      <div className={styles.sectionHeader}>Diğer Oyunlarım</div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Tarih</th>
              <th>Puan</th>
              <th>Görevler</th>
              <th>Süre</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {otherGames.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{textAlign:"center", opacity:0.7}}>Başka oyun kaydı bulunamadı.</td>
              </tr>
            )}
            {otherGames.map((game, idx) => (
              <tr key={game.id}>
                <td>{idx + 2}</td>
                <td>{game.date}</td>
                <td>{game.score}</td>
                <td>{game.completedQuests}/{game.totalQuests}</td>
                <td>{game.duration}</td>
                <td>{game.status}</td>
                <td>
                  <button className={styles.smallDetailBtn} onClick={() => setSelectedGame(game)}>
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
};

export default MyGames;
