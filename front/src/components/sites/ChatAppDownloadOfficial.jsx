import React, { useState, useRef } from "react";
import styles from './ChatAppDownloadOfficial.module.css';
import { useWindowConfig } from '../../Contexts/WindowConfigContext';
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";

const userReviews = [
  {
    user: "elifcany",
    avatar: "/avatars/avatar7.png",
    comment: "Gerçekten çok hızlı ve stabil çalışıyor. Grup sohbetlerinde anlık bildirimler çok iyi!"
  },
  {
    user: "karamelmacchiato",
    avatar: "/avatars/avatar10.png",
    comment: "Kullanıcı arayüzü sade, annem bile rahatça kullanıyor. 🤩"
  },
  {
    user: "ozan_security",
    avatar: "/avatars/avatar20.png",
    comment: "Şirket içi iletişim için uçtan uca şifreleme çok kritik. Güvenilir bir uygulama!"
  }
];

const faqs = [
  {
    q: "ChatBox ücretsiz mi?",
    a: "Evet, ChatBox tamamen ücretsizdir ve herhangi bir gizli ücret içermez."
  },
  {
    q: "Kişisel verilerim güvende mi?",
    a: "Evet, ChatBox hiçbir verinizi 3. şahıslarla paylaşmaz. Tüm mesajlarınız uçtan uca şifrelenir."
  },
  {
    q: "Desteklenen platformlar neler?",
    a: "Windows, Mac ve Linux sürümleriyle tam uyumlu. Mobil versiyon ise yakında!"
  },
  {
    q: "Destek hattı var mı?",
    a: "7/24 canlı destek ve e-posta üzerinden yardım alabilirsiniz: support@chatbox.com"
  }
];


const ChatAppDownloadOfficial = () => {
  const { updateAvailableStatus } = useWindowConfig();
  const { addEventLog } = useEventLog();
  const { completeQuest } = useQuestManager();
  const [ downloading, setDownloading ] = useState(false);
  const [ progress, setProgress ] = useState(0);
  const [ showPopup, setShowPopup ] = useState(false);
  const intervalRef = useRef(null);

  const [alreadyDownloaded, setAlreadyDownloaded] = useState(false);

  const startDownload = () => {
     if (alreadyDownloaded) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
      return;
    }
    setDownloading(true);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setAlreadyDownloaded(true);
          setShowPopup(true);
          updateAvailableStatus("chatapp", { available: true});
          completeQuest("download_chatapp");
          addEventLog({
            type: "download_setup",
            questId: "download_chatapp",
            logEventType: "download",
            value: 10,
            data: 
            {
              site: "ChatAppDownload",
              infected: false,
            }
          });
          setTimeout(() => setShowPopup(false), 2500);
          setDownloading(false);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 6) + 3, 100);
      });
    }, 160);
  };

  return (
    <div className={styles.downloadContainer}>
      <div className={styles.header}>
        <img src="/icons/chatting.png" alt="ChatBox Logo" className={styles.logo} />
        <h1>ChatBox</h1>
      </div>

      {/* Tanıtım ve görsel */}
      <section className={styles.heroSection}>
        <div className={styles.heroLeft}>
          <p className={styles.introText}>
            ChatBox, birebir ve grup sohbetlerinizde <b>gizlilikten ödün vermeden</b> anında bağlantı kurmanızı sağlar.<br />
          </p>
          <ul className={styles.featureList}>
            <li>🔒 Uçtan uca şifreli mesajlaşma</li>
            <li>💻 Tüm masaüstü platformlarında sorunsuz</li>
            <li>🌙 Koyu & aydınlık tema desteği</li>
            <li>🔔 Akıllı bildirimler ve sessize alma</li>
          </ul>
          <div className={styles.platformGrid}>
            <button
              className={styles.platformBtn}
              disabled={downloading}
              onClick={startDownload}
              aria-label="ChatBox indir"
            >
              <span className={styles.iconBox}>
                <img src="/icons/downloading.png" alt="Download" />
              </span>
              <span>
                <b>Anında  İndir</b>
                <div className={styles.platformLabel}>ChatBox.exe</div>
              </span>
            </button>
          </div>
          {downloading &&
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              <span className={styles.progressText}>{progress}%</span>
            </div>
          }
          {showPopup && (
            <div className={styles.popup}>
              {alreadyDownloaded ? "Bu uygulama zaten indirildi." : "Uygulama başarıyla indirildi!"}
            </div>
          )}
        </div>
        <div className={styles.heroRight}>
          <img src="/icons/chatting.png" alt="ChatBox Sohbet Ekranı" className={styles.previewImg} />
          <div className={styles.ratingBox}>
            ⭐ 4.9/5 – 1.000+ kullanıcı yorumu
          </div>
        </div>
      </section>

      {/* Güvenlik ve şeffaflık alanı */}
      <section className={styles.securitySection}>
        <h2>🔒 Güvenliğiniz Bizim İçin Öncelik</h2>
        <ul>
          <li>256-bit AES ile uçtan uca şifreleme</li>
          <li>Veri toplamadan, izinsiz reklamdan uzak</li>
          <li>Açık kaynak çekirdek ve düzenli güvenlik güncellemesi</li>
          <li>2FA ve cihaz yönetimi</li>
        </ul>
      </section>

      {/* Kullanıcı Yorumları */}
      <section className={styles.reviewsSection}>
        <h2>Kullanıcılar Ne Diyor?</h2>
        <div className={styles.reviewGrid}>
          {userReviews.map((r, i) => (
            <div key={i} className={styles.reviewCard}>
              <img src={r.avatar} alt={r.user} />
              <b>@{r.user}</b>
              <span>"{r.comment}"</span>
            </div>
          ))}
        </div>
      </section>

      {/* SSS */}
      <section className={styles.faqSection}>
        <h2>Sıkça Sorulan Sorular</h2>
        <ul>
          {faqs.map((faq, i) => (
            <li key={i}>
              <details>
                <summary>{faq.q}</summary>
                <div>{faq.a}</div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <footer className={styles.footer}>
        <p>
          © 2025 ChatBox Inc. | <a href="mailto:support@chatbox.com">support@chatbox.com</a> | 
          <a href="/privacy">Gizlilik Politikası</a>
        </p>
      </footer>
    </div>
  );
};

export default ChatAppDownloadOfficial;
