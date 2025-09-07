import React, { useState, useRef } from "react";
import styles from "./QuickPDFView.module.css";
import { useWindowConfig } from "../../Contexts/WindowConfigContext";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";

const QuickPDFViewSite = () => {
  const { completeQuest } = useQuestManager();
  const { updateAvailableStatus } = useWindowConfig();
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
        updateAvailableStatus("quickpdfviewer", true);
        completeQuest("pdf_viewer_install");
        addEventLog({
          type: "download",
          questId: "pdf_viewer_install",
          logEventType: "pdf_viewer_download",
          value: -5,
          data: {
            site: "QuickPDFView",
            isFake: true,
          }
        });
        setTimeout(() => setShowPopup(false), 3000);
        setDownloading(false);
        return 100;
      }
      return Math.min(prev + Math.floor(Math.random() * 5) + 3, 100);
    });
  }, 180);
};


  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.left}>
          <img src="/PDFViewer/pdf-logo.png" alt="QuickPDFView Logo" className={styles.logo} />
          <h2>QuickPDFView Setup</h2>
          <p className={styles.subtext}>PDF dosyalarınızı hızlıca açmak için tek tıkla kurulum.</p>

          <div className={styles.stars}>
            ⭐⭐⭐⭐⭐ 4.9/5.0 (12.384 indirme)
          </div>

          <button
            onClick={startDownload}
            disabled={downloading}
            className={styles.downloadBtn}
          >
            {downloading ? "İndiriliyor..." : "Ücretsiz İndir (.exe)"}
          </button>

          {downloading && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          )}

          {showPopup && (
            <div className={styles.popup}>
              ✅ QuickPDFViewSetup.exe başarıyla indirildi.
            </div>
          )}
        </div>

        <div className={styles.right}>
          <h3>Neden QuickPDFView?</h3>
          <ul>
            <li> PDF ve Office belgelerini destekler</li>
            <li> Hafif ve hızlı kurulum</li>
            <li> Gelişmiş yazdırma ve yakınlaştırma</li>
            <li> Ofis ortamları için ideal</li>
            <li> Reklamsız kullanım</li>
          </ul>
        </div>
      </div>

      <div className={styles.reviews}>
            <h3>Kullanıcı Yorumları</h3>

            <div className={styles.reviewBox}>
                <div className={styles.reviewStars}>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                </div>
                <p><strong>👩‍💼 Aylin K.:</strong> "İşe yeni başladım, kullanıcı dostu bu program sayesinde çok rahatım. Harika!"</p>
            </div>

            <div className={styles.reviewBox}>
                <div className={styles.reviewStars}>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                </div>
                <p><strong>🧑‍💻 Murat T.:</strong> "Karmaşık kurulumlar yok, tek tıkla çalıştı. Çok kullanışlı."</p>
            </div>

            <div className={styles.reviewBox}>
                <div className={styles.reviewStars}>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starEmpty}>★</span>
                </div>
                <p><strong>👩 Elif S.:</strong> "Diğer programlar çok ağır geliyordu, bu program çok hafif ve sade. Teşekkürler!"</p>
            </div>

            <div className={styles.reviewBox}>
                <div className={styles.reviewStars}>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starEmpty}>★</span>
                    <span className={styles.starEmpty}>★</span>
                </div>
                <p><strong>🧔 Cem D.:</strong> "İndirdikten sonra bazı belgeleri açmakta zorlandım. Belki güncelleme gerekir."</p>
            </div>

            <div className={styles.reviewBox}>
                <div className={styles.reviewStars}>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starEmpty}>★</span>
                </div>
                <p><strong>👨 Kenan M.:</strong> "Kurulumu sorunsuzdu ve sade arayüzü hoşuma gitti. Bazı büyük boyutlu belgelerde hafif yavaşlama oldu ama genel olarak başarılı."</p>
            </div>

            <div className={styles.reviewBox}>
                <div className={styles.reviewStars}>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starFull}>★</span>
                    <span className={styles.starEmpty}>★</span>
                </div>
                <p><strong>👩‍🔧 Nisanur A.:</strong> "Küçük işler için ideal ve hızlı çalışıyor. Bazı gelişmiş özellikler eksik ama basit görüntüleme için yeterli. İlk kullanım için gayet iyi bir seçenek."</p>
            </div>
      </div>


    </div>
  );
};

export default QuickPDFViewSite;
