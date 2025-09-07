import React, { useState, useRef } from "react";
import "./ShieldSecure.css";
import { useFileContext } from "../../Contexts/FileContext";
import { useEventLog } from "../../Contexts/EventLogContext";

const ShieldSecure = () => {
  const [progress, setProgress] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const intervalRef = useRef(null);

  const { files, updateFileStatus } = useFileContext();
  const { addEventLog } = useEventLog();

  const antivirusDownloaded = files?.antivirussetup?.available;

  // Başlat
  const handleDownloadClick = () => {
    setButtonLoading(true);
    setProgress(0);

    // LOG: İndirme başladı
    addEventLog({
      type: "antivirus_download_started",
      logEventType: "antivirus",
      questId: "antivirus_install",
      value: 0,
      data: { site: "ShieldSecure" },
    });

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setButtonLoading(false);
          setShowPopup(true);

          // FileContext'i güncelle
          updateFileStatus("antivirussetup", { available: true });

          // LOG: İndirme tamamlandı
          addEventLog({
            type: "antivirus_download_completed",
            logEventType: "antivirus",
            questId: "antivirus_install",
            value: 10,
            data: { site: "ShieldSecure" },
          });

          // Popup otomatik gizle
          setTimeout(() => {
            setShowPopup(false);
          }, 3000);

          return 100;
        }
        return prev + 2;
      });
    }, 200); // %2 ilerleme = 10sn'de biter
  };

  // İptal Et
  const handleCancel = () => {
    clearInterval(intervalRef.current);
    setButtonLoading(false);
    setProgress(0);
    // LOG: İndirme iptal edildi
    addEventLog({
      type: "antivirus_download_cancelled",
      logEventType: "antivirus",
      questId: "antivirus_install",
      value: 0,
      data: { site: "ShieldSecure" }
    });
  };

  return (
    <div className="shieldsecure-modern-container">
      <div className="shieldsecure-hero">
        <img src="/icons/shieldSecure.png" className="shieldsecure-hero-icon" alt="ShieldSecure" />
        <h2>ShieldSecure Antivirüs</h2>
        <p className="shieldsecure-hero-desc">
          Cihazınızı tehditlere karşı gerçek zamanlı koruyun.<br />
          <span className="shieldsecure-green">Siber güvenliğiniz emin ellerde!</span>
        </p>
      </div>

      <div className="shieldsecure-contentbox">
        <div className="shieldsecure-infobox">
          <h3>Avantajlar</h3>
          <ul>
            <li>Gerçek zamanlı tehdit algılama</li>
            <li>Gelişmiş güvenlik duvarı</li>
            <li>Otomatik güncelleme</li>
            <li>Güvenli internet gezintisi</li>
          </ul>
        </div>

        <div className="shieldsecure-downloadbox">
          <h3> Antivirüs Setup İndir</h3>
          {buttonLoading ? (
            <div className="shieldsecure-progress-row">
              <div className="shieldsecure-progress-outer">
                <div className="shieldsecure-progress-inner" style={{ width: `${progress}%` }}>
                  <span className="shieldsecure-progress-text">{progress}%</span>
                </div>
              </div>
              <button className="shieldsecure-cancel-btn" onClick={handleCancel}>İptal Et</button>
            </div>
          ) : (
            <button
              onClick={handleDownloadClick}
              disabled={antivirusDownloaded}
              className={`shieldsecure-download-btn${antivirusDownloaded ? " downloaded" : ""}`}
            >
              <strong>{antivirusDownloaded ? "Zaten indirildi" : "ShieldSecure Setup"}</strong>
            </button>
          )}
        </div>
      </div>

      {/* Kampanya kutusu (istersen kaldırabilirsin, sade olması için defaultta gizli) */}
      {/* <div className="shieldsecure-campaign">
        <h4>🎁 %50 İndirim!</h4>
        <span>Yıllık ShieldSecure Premium'da fırsatı kaçırmayın.</span>
      </div> */}

      {showPopup && <div className="shieldsecure-popup">İndirme tamamlandı!</div>}
    </div>
  );
};

export default ShieldSecure;
