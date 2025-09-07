import React, { useState, useRef } from "react";
import styles from "./OpenLitePDF.module.css";
import { useWindowConfig } from "../../Contexts/WindowConfigContext";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";

const OpenLitePDF = () => {
  const { completeQuest } = useQuestManager();
  const { updateAvailableStatus } = useWindowConfig();
  const { addEventLog } = useEventLog();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
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
          updateAvailableStatus("openlitepdfviewer", true);
          completeQuest("pdf_viewer_install");
          addEventLog({
            type: "download",
            questId: "pdf_viewer_install",
            logEventType: "pdf_viewer_download",
            value: 10,
            data: {
              site: "OpenLitePDF",
              isFake: false,
            }
          });
          setTimeout(() => setShowPopup(false), 3000);
          setDownloading(false);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 6) + 2, 100);
      });
    }, 200);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerSection}>
        
        <h1><img src="/PDFViewer/pdf-logo-open.png" alt="OpenLitePDF logo" /> OpenLite PDF Tools</h1>
        <p className={styles.slogan}>Gelişmiş, sade ve güvenli PDF çözümü</p>
      </div>
     
      <div className={styles.infoGrid}>
        <div className={styles.infoBox}>
          <h3>📂 Dosya Desteği</h3>
          <p>PDF, DOCX, XLS, PPT gibi tüm popüler formatları açar.</p>
        </div>
        <div className={styles.infoBox}>
          <h3>🛡 Güvenlik</h3>
          <p>Şifreli belgeleri açabilir, veri koruma modu içerir (simüle edilmiş).</p>
        </div>
        <div className={styles.infoBox}>
          <h3>💻 Uyumluluk</h3>
          <p>Windows 7 ve üzeri sistemlerle tam uyumlu.</p>
        </div>
        <div className={styles.infoBox}>
          <h3>⭐ Kullanıcı Puanı</h3>
          <p>4.8 / 5 — 6.430 değerlendirme</p>
        </div>
      </div>
      <img src="/PDFViewer/pdf-download.png" alt="PDF Download Icon" />
      İndirme işlemi için kaydırın!
      <div className={styles.continueNote}>
        Yazılım yüklendikten sonra masaüstünüzde <strong>OpenLite PDF</strong> simgesi belirecek.
        İndirme işlemi tamamlandıktan sonra simgeye çift tıklayarak yazılımı başlatabilirsiniz.
      </div>
      <div className={styles.sectionRow}>
        <div className={styles.sectionBox}>
          <h3>📌 Neden OpenLite?</h3>
          <ul>
            <li>⚡ Hızlı kurulum ve çalıştırma</li>
            <li>🔒 Basit ama etkili güvenlik önlemleri</li>
            <li>📁 Geniş belge desteği</li>
          </ul>
        </div>

        <div className={styles.sectionBox}>
          <h3>🧠 Kimler Kullanmalı?</h3>
          <ul>
            <li>👩‍💼 Ofis çalışanları</li>
            <li>👨‍🎓 Öğrenciler ve akademisyenler</li>
            <li>👨‍💻 Geliştiriciler ve test uzmanları</li>
          </ul>
        </div>

        <div className={styles.sectionBox}>
          <h3>🖥 Sistem Gereksinimleri</h3>
          <ul>
            <li>💽 200MB boş disk alanı</li>
            <li>🧠 Minimum 2GB RAM</li>
            <li>🪟 Windows 7+</li>
          </ul>
        </div>
      </div>
      <img src="/PDFViewer/pdf-download.png" alt="PDF Download Icon" /><br />
      <div className={styles.downloadSection}>
        <h2>OpenLitePDF.exe</h2>
        <p className={styles.desc}>Kurulum 14.3MB — Kurulumda kamera ve mikrofon izni istenebilir.</p>
        <button onClick={startDownload} disabled={downloading} className={styles.downloadBtn}>
          {downloading ? "İndiriliyor..." : "Ücretsiz İndir"}
        </button>
        {downloading && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
        {showPopup && (
          <div className={styles.popup}>
            ✅ OpenLitePDFSetup.exe başarıyla indirildi.
          </div>
        )}
      </div>

      <div className={styles.bottomNote}>
        🔐 Güvenli Yazılım Sertifikası © 2025 — OpenLite Software Labs <br />
        ISO/IEC 27001 Uyumlu (gibi gösteriliyor)
      </div>
    </div>
  );
};

export default OpenLitePDF;