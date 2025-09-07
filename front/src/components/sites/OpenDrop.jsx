import React, { useState } from "react";
import { useFileContext } from "../../Contexts/FileContext";
import { useGameContext } from "../../Contexts/GameContext";
import styles from "./OpenDrop.module.css";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";

const generateLink = (label) =>
  "https://opendrop.com/file/" +
  label.toLowerCase().replace(/[^a-z0-9]/g, '') +
  Math.random().toString(36).substr(2, 4);

const OpenDrop = () => {
  const { files } = useFileContext();
  const { addEventLog } = useEventLog();
  const { failQuest } = useQuestManager();
  const [allBackedUpFiles, setAllBackedUpFiles] = useState([]);
  const allBackedUpLabels = (allBackedUpFiles ?? []).map(file => file.label);
  const { openDropPublicFiles, setOpenDropPublicFiles } = useGameContext();

  const downloadsFiles = Object.values(files).filter(
    f => f.location === "downloads" && ["doc", "pdf", "txt", "jpg"].includes(f.type) &&
    !allBackedUpLabels.includes(f.label)
  );

  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dosya yükle modalı açıldığında
  const handleShowUpload = () => setShowModal(true);

  // Yükleme simülasyonu (tüm personal dosyaları yükle)
  const handleUploadAll = () => {
    setUploading(true);
    setProgress(0);
    let step = Math.max(1, Math.floor(100 / (downloadsFiles.length * 4 + 6)));
    let percent = 0;
    const interval = setInterval(() => {
      percent += step;
      setProgress(percent);
      if (percent >= 100) {
        clearInterval(interval);
        setUploading(false);
        setShowModal(false);
        failQuest("file_backup");
        addEventLog({
          type: "backup",
          questId: "file_backup",
          logEventType: "cloud_backup",
          value: -10,
          data: {
            site: "OpenDrop",
            isFake: false,
          }
        });
        // Dosyaları public olarak context'e ekle
        const uploaded = downloadsFiles.map(f => ({
          ...f,
          url: generateLink(f.label),
        }));

        // Bütün yedeklenenleri tut
        setAllBackedUpFiles(prev => {
          const prevLabels = prev.map(f => f.label);
          // Sadece yeni olanları ekle
          const newUnique = uploaded.filter(f => !prevLabels.includes(f.label));
          return [...prev, ...newUnique];
        });

        setOpenDropPublicFiles(prev => {
          const total = [...uploaded, ...prev];
          // Farklı label’lar, tekrar yok
          const unique = [];
          const labels = new Set();
          for (let f of total) {
            if (!labels.has(f.label)) {
              unique.push(f);
              labels.add(f.label);
            }
          }
          return unique.slice(0, 3); // son 3 (en yeni yüklenenler başta)
        });
        setProgress(0);
      }
    }, 60);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="46" height="46" viewBox="0 0 52 52">
            <ellipse cx="26" cy="32" rx="18" ry="14" fill="#4fc3f7" />
            <ellipse cx="26" cy="19" rx="8" ry="7" fill="#0288d1" />
          </svg>
        </div>
        <div>
          <div className={styles.title}>OpenDrop</div>
          <div className={styles.slogan}>Dosya Paylaşım Platformu</div>
        </div>
      </header>

      <section className={styles.introBox}>
        <div className={styles.introTitle}>Platformun İşleyişi</div>
        <div className={styles.introDesc}>
          OpenDrop ile yüklediğiniz dosyalar sistemde listelenir ve paylaşılabilir bir bağlantı ile erişime sunulur.
          Her dosya için otomatik bir paylaşım linki oluşturulur ve yüklenen dosyalar ana sayfada görüntülenir.
          <br />Amacımız hızlı ve kolay dosya paylaşımı sağlamaktır. Kayıt olmadan kullanabilirsiniz.
        </div>
      </section>

      <section className={styles.uploadSection}>
        <div className={styles.uploadCard}>
          <button className={styles.uploadBtn} onClick={handleShowUpload}>
            Dosya Yükle
          </button>
        </div>
      </section>

      {/* Yükleme Modalı */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.folderModal}>
            <div className={styles.folderHeader}>
              <span className={styles.folderIcon}>📁</span>
              <span className={styles.folderTitle}>Dosyalarım</span>
            </div>
            <div className={styles.folderGrid}>
              {downloadsFiles.length === 0 ? (
                <span className={styles.noFile}>Yedeklenecek dosya yok.</span>
              ) : (
                downloadsFiles.map((f, i) => (
                  <div key={f.label} className={styles.folderFile}>
                    <div className={styles.bigIcon}>
                      <img src={f.icon} alt="Files"/>
                    </div>
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName}>{f.label}</span>
                      <span className={styles.fileSize}>{f.size}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {downloadsFiles.length > 0 && (
              <button className={styles.uploadAllBtn} onClick={handleUploadAll} disabled={uploading}>
                Tümünü Yükle
              </button>
            )}
            <button className={styles.cancelBtn} onClick={() => setShowModal(false)} disabled={uploading}>
              Kapat
            </button>
            {uploading && (
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div className={styles.progress} style={{ width: `${progress}%` }} />
                </div>
                <span className={styles.progressText}>{progress}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      <section className={styles.listSection}>
        <div className={styles.listTitle}>Son Paylaşılan Dosyalar</div>
        <div className={styles.fileList}>
          {openDropPublicFiles.length === 0
            ? <div className={styles.noFile}>Henüz dosya yüklenmedi.</div>
            : openDropPublicFiles.slice(0, 8).map((file, idx) => (
              <div key={file.url + idx} className={styles.fileCard}>
                <span className={styles.fileIcon}>
                  <img src={file.icon} alt="Files"/>
                </span>
                <span className={styles.fileName}>{file.label}</span>
                <span className={styles.fileSize}>{file.size}</span>
                <span className={styles.linkBtn}>{file.url}</span>
              </div>
            ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2025 OpenDrop</span>
      </footer>
    </div>
  );
};

export default OpenDrop;
