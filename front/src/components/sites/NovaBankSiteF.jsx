import React, { useState, useRef } from "react";
import styles from './NovaBankSiteF.module.css';
import { useFileContext } from "../../Contexts/FileContext";
import { useEventLog } from "../../Contexts/EventLogContext";

const NovaBankSiteF = () => {
  const { setFiles } = useFileContext();
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
          setDownloading(false);
          setShowPopup(true);

          setFiles(prev => ({
            ...prev,
            novabankadware: {
              available: true,
              quarantined: false,
              clickable: true,
              infected: true,
              detectable: false,
              virusType: "adware",
              type: "exe",
              size: "18MB",
              location: "downloads",
              label: "NovaBankSetup.exe",
              icon: "/novaBank/NovaBankAppSetup.png",
              exeType: "novabankappsetupf"
            }
          }));
          addEventLog({
            type: "download_setup",
            questId: "download_novabank",
            logEventType: "download",
            value: -10,
            data: 
            {
              file: "novabankappsetup",
              isFake: true,
            }
          });

          setTimeout(() => setShowPopup(false), 4000);
          return 100;
        }

        const rand = Math.floor(Math.random() * 4) + 2;
        return Math.min(prev + rand, 100);
      });
    }, 200);
  };

  const cancelDownload = () => {
    clearInterval(intervalRef.current);
    setProgress(0);
    setDownloading(false);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.panel}>
        <h1 className={styles.header}>NovaBank Plus Desktop</h1>
        <p className={styles.subtext}>En hızlı bankacılık deneyimini şimdi yükleyin!</p>

        <ul className={styles.features}>
          <li>💸 Otomatik Yatırım Fırsatları</li>
          <li>🎁 Günlük Bonus ve Sürpriz</li>
          <li>🛡️ 2025 Güvenlik Sertifikalı</li>
        </ul>

        <ul className={styles.badges}>
          <li>✅ Windows Defender Uyumlu</li>
          <li>🔒 SSL Şifreleme Aktif</li>
          <li>🧠 AI Destekli Güvenlik Analizi</li>
        </ul>

        <div className={styles.downloadArea}>
          <button onClick={downloading ? cancelDownload : startDownload} className={styles.downloadBtn}>
            {downloading ? `${progress}% İndiriliyor...` : "NovaBankSetup.exe"}
          </button>
          <div className={styles.updateNote}>📦 Son Güncelleme: 2 gün önce</div>

          {downloading && (
            <div className={styles.progressBar}>
              <div className={styles.progressInner} style={{ width: `${progress}%` }} />
            </div>
          )}
          {showPopup && <div className={styles.successPopup}>✅ Dosya indirildi.</div>}
        </div>

        <p className={styles.warning}>⚠️ Not: Bazı antivirüs yazılımları bu uygulamayı yanlış tanıyabilir.</p>
        <footer className={styles.footer}>
            <div>© 2025 NovaBank Plus | Tüm hakları saklıdır.</div>
            <div>İletişim: destek@novabank.plus | 0850 8800 9090</div>
            <div className={styles.domainNote}>❗ Resmi web sitemiz: www.novabank.plus</div>
        </footer>
      </div>

      
    </section>
  );
};

export default NovaBankSiteF;
