import React, { useState, useEffect, useRef } from "react";
import styles from './NovaBankSite.module.css';
import { useFileContext } from "../../Contexts/FileContext";
import { useEventLog } from "../../Contexts/EventLogContext";

const NovaBankSite = () => {
  const { updateFileStatus } = useFileContext();
  const { addEventLog } = useEventLog();

  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const intervalRef = useRef(null);

  const startDownload = () => {
    setDownloading(true);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setShowPopup(true);
          updateFileStatus("novabankappsetup", { available: true });
          addEventLog({
            type: "download_setup",
            questId: "download_novabank",
            logEventType: "download",
            value: 10,
            data: 
            {
              file: "novabankappsetup",
              isFake: false,
            }
          });
          setTimeout(() => setShowPopup(false), 3000);
          setDownloading(false);
          return 100;
        }
        const randomIncrease = Math.floor(Math.random() * 4) + 1;
        return Math.min(prev + randomIncrease, 100);
      });
    }, 200);
  };

  const cancelDownload = () => {
    clearInterval(intervalRef.current);
    setDownloading(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <div className={styles.leftSide}>
          <img src="/novaBank/novaHome.png" alt="NovaBank Logo" className={styles.logo} />
          <h1 className={styles.title}>NovaBank Masaüstü Uygulaması</h1>
          <p className={styles.subtitle}>Dijital bankacılık işlemleriniz için hızlı ve güvenli masaüstü çözüm.</p>

          <div className={styles.featureBox}>
            <h2>Uygulama Özellikleri</h2>
            <ul>
              <li>🔐 Gelişmiş Güvenlik (2FA & 256-bit şifreleme)</li>
              <li>💳 Kart ve IBAN Yönetimi</li>
              <li>⚡ Anında FAST / EFT / Havale</li>
              <li>📄 Ödeme & Transfer İşlemleri</li>
              <li>🧾 Hesap Geçmişi ve Raporlama</li>
            </ul>
          </div>

          <div className={styles.downloadSection}>
            <h2>İndirme</h2>
            <p>Windows için NovaBank uygulamasını aşağıdan indirebilirsiniz:</p>
            <button
              className={styles.downloadBtn}
              onClick={downloading ? cancelDownload : startDownload}
            >
              {downloading ? `${progress}% indiriliyor...` : "NovaBankSetup.exe"}
            </button>
            {downloading && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          {showPopup && <div className={styles.popup}>✅ Kurulum dosyası indirildi.</div>}

          <footer className={styles.footer}>
            © 2025 NovaBank | Tüm hakları saklıdır. | Destek: 0850 5050 4567
          </footer>
        </div>

        <div className={styles.rightSide}>
          <h2>NovaBank ile Güvendesiniz!</h2>
          <ul>
            <li>🕑 7/24 Müşteri Hizmeti</li>
            <li>🔒 Gelişmiş Şifreleme Teknolojisi</li>
            <li>⚡ Hızlı Para Transferleri</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default NovaBankSite;