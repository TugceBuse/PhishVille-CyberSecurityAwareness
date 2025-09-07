import React, { useState, useRef, useEffect } from "react";
import styles from './DocuLite.module.css';
import { useWindowConfig } from '../../Contexts/WindowConfigContext';
import FeatureCard from './FeatureCard'; 
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";

const DocuLiteSite = () => {
  const { updateAvailableStatus } = useWindowConfig();
  const { completeQuest } = useQuestManager();
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
          updateAvailableStatus("pdfviewer", { available: true });
          completeQuest("pdf_viewer_install");
          addEventLog({
            type: "download",
            questId: "pdf_viewer_install",
            logEventType: "pdf_viewer_download",
            value: 10,
            data: {
              site: "DocuLitePDFViewer",
              isFake: false,
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
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/PDFViewer/pdf.png" alt="DocuLite Logo" className={styles.logo} />
        <h2>DocuLite PDF Viewer</h2>
        <p className={styles.tagline}>Belgelerinizi hızlı, güvenli ve ücretsiz bir şekilde görüntüleyin.</p>
        <div className={styles.badges}>
          <span className={styles.version}>v2.3.1</span>
          <span className={styles.license}>✔ Ücretsiz Lisans</span>
          <span className={styles.rating}>⭐ 4.8 / 5</span>
        </div>
      </div>

      <div className={styles.infobox}>
        <h3>Neden DocuLite?</h3>
        <p>
          DocuLite, gereksiz karmaşadan uzak, sade ve kullanıcı dostu bir PDF görüntüleyici sunar. Belgelerinizi açmak, okumak ve yazdırmak hiç bu kadar kolay olmamıştı. Açık kaynaklı yapısıyla hem güvenilir hem de özgür.
        </p>
      </div>

      <div className={styles.cardGrid}>
        <FeatureCard
            icon="✅"
            title="Sade Ama Güçlü"
            description="DocuLite, yalnızca PDF dosyalarınızı açar. Hızlı, sorunsuz ve modern bir deneyim sunar."
        />
        <FeatureCard
            icon="🔒"
            title="Dosya Dostu"
            description="Sadece belge okuma yapar, sistem kaynaklarına erişmez veya işlem yapmaz."
        />
        <FeatureCard
            icon="🧩"
            title="Hafif Kurulum"
            description="12MB boyutundaki kurulum dosyası ile düşük bellek tüketimi sağlar."
        />
        <FeatureCard
            icon="🌐"
            title="Açık Kaynak"
            description="Topluluk destekli, şeffaf ve geliştirilebilir bir yazılımdır."
        />
       </div>

      <button className={styles.downloadButton} onClick={startDownload} disabled={downloading}>
        {downloading ? `İndiriliyor... %${progress}` : "Ücretsiz İndir"}
      </button>

      {showPopup && (
        <div className={styles.popup}>
          <img src="/PDFViewer/checklist.png" alt="PDF Icon" className={styles.popupIcon} />
          DocuLitePDF başarıyla indirildi!
        </div>
      )}
    </div>
  );
};

export default DocuLiteSite;
