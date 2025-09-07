import { useState, useEffect, useRef } from 'react';
import styles from './DownloadButton.module.css';
import { useFileContext } from '../Contexts/FileContext';
import { useGameContext } from '../Contexts/GameContext';
import { useMailContext } from '../Contexts/MailContext';
import { useChatContext } from '../Contexts/ChatContext';
import { useTimeContext } from '../Contexts/TimeContext';
import { useQuestManager } from '../Contexts/QuestManager';
import { useEventLog } from '../Contexts/EventLogContext';

const DownloadButton = ({ label, fileName, fileContent, fileLabel, mailId }) => {
  const { addEventLog } = useEventLog();
  const { addFile, updateFileStatus, files, openFile } = useFileContext();
  const { isWificonnected } = useGameContext();
  const { selectedMail } = useMailContext();
  const { addChatMessage, setUserOptions, addUploadTask } = useChatContext();
  const { gameDate } = useTimeContext();
  const { completeQuest, failQuest } = useQuestManager();

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const downloadMailIdRef = useRef(null);

  // Dosya daha önce indirildiyse
  const isDownloaded = !!files[fileName]?.available;

  // Sadece bu maile ait butonda etkileşim
  const isActive = !mailId || (selectedMail?.id === mailId);

  const handleDownload = () => {
    if (!isWificonnected || !isActive || isDownloaded) return;
    setDownloading(true);
    setCancelled(false);
    setProgress(0);
    downloadMailIdRef.current = mailId;
  };

  const cancelDownload = () => {
    setCancelled(true);
    setDownloading(false);
    setProgress(0);
    setShowCancelled(true);
    setTimeout(() => setShowCancelled(false), 2500);
  };

  useEffect(() => {
    if (downloading && downloadMailIdRef.current !== selectedMail?.id) {
      cancelDownload();
    }
  }, [selectedMail, downloading]);

  useEffect(() => {
    if (downloading && !cancelled && isWificonnected) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const randomIncrease = Math.floor(Math.random() * 4) + 2;
          if (prev >= 100) {
            clearInterval(interval);
            return prev;
          }
          return Math.min(prev + randomIncrease, 100);
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [downloading, cancelled, isWificonnected]);

  useEffect(() => {
    if (progress >= 100 && downloading && !cancelled && isActive) {
      // Dosya indirme tamamlandıysa
      if (fileName === "sahtefatura") {
        updateFileStatus("sahtefatura", {
          available: true,
        });
        failQuest("save_invoice");
      }

      if (!files[fileName]) {
        addFile(fileName, {
          available: true,
          quarantined: false,
          clickable: true,
          infected: false,
          virusType: null,
          type: "pdf",
          size: `${(fileContent?.length || 1024) / 1024}KB`,
          location: "downloads",
          label: fileLabel || fileName,
          icon: "/icons/pdf.png",
          content: fileContent
            ? URL.createObjectURL(new Blob([fileContent], { type: "text/plain" }))
            : "",
        });
      } else {
        updateFileStatus(fileName, { available: true });
      }

      if ((fileName?.toLowerCase()?.includes('fatura') || fileLabel?.toLowerCase()?.includes('fatura'))) {
        addUploadTask({
          userId: 3,
          allowedTypes: ["pdf"],
          filterLabelContains: "fatura",
          buttonText: "Fatura Yükle"
        });
        completeQuest("save_invoice");
        addChatMessage(3, {
          sender: "them",
          text: "Merhaba, fatura belgenizi dosya olarak bize iletir misiniz? İnceleme için yükleme alanını kullanabilirsiniz.",
          senderName: "Satış Departmanı",
          time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          requestInvoice: true,
        }, true);
        setUserOptions(3, []);
      }

      setDownloading(false);
      setShowSuccess(true);

      if( fileName === "sahtefatura" ) {
        addEventLog({
          type: "download_phishing_mail",
          questId: "save_invoice",
          value: -10,
          data: 
          {
            mailId: mailId,
            file: fileName
          },
        });
      } 
      else if (fileName?.toLowerCase()?.includes('fatura')){
        addEventLog({
          type: "download_mail",
          questId: "save_invoice",
          value: 10,
          data: {
            mailId: mailId,
            file: fileName
          },
        });
      }
      else if (fileName === "taskappsetup") {
        addEventLog({
          type: "download_mail",
          questId: "download_taskapp",
          value: 10,
          data: {
            mailId: mailId,
            file: fileName
          },
        });
      }
      else if (fileName === "taskappsetupf") {
        addEventLog({
          type: "download_phishing_mail",
          questId: "download_taskapp",
          value: -10,
          data: {
            mailId: mailId,
            file: fileName
          },
        });
      }
      else if (fileName === "rapor_2025") {
        addEventLog({
          type: "download_phishing_mail",
          questId: null,
          value: -5,
          data: {
            mailId: mailId,
            file: fileName
          },
        });
      }
      setTimeout(() => setShowSuccess(false), 2500);
    }
  }, [progress, downloading, cancelled, isActive, fileName, fileContent, addFile, updateFileStatus, files, fileLabel]);

  // Mail değişince popup otomatik açıksa kapat (örneğin kullanıcı başka maile geçti, eski popup’ı gizle)
  useEffect(() => {
    setShowSuccess(false);
    setShowCancelled(false);
    setDownloading(false);
    setProgress(0);
    setCancelled(false);
  }, [selectedMail?.id, mailId, fileName]);

  return (
    <div className={styles.container}>
      {downloading ? (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
            <span className={styles.progressLabel}>{label}</span>
          </div>
          <button className={styles.cancel} onClick={cancelDownload}>✕</button>
        </div>
      ) : (
        <div className={`${styles.attachmentBox} ${styles.wrapperWithBubble}`}>
          {showSuccess && <div className={styles.successBubble}>✔ İndirildi</div>}
          {showCancelled && <div className={styles.cancelBubble}>❌ İptal Edildi</div>}
          <span className={styles.downloadIcon}>📎</span>
          <span>{label}</span>
          <button
            className={styles.downloadAction}
            onClick={handleDownload}
            disabled={!isWificonnected || !isActive || isDownloaded}
            style={isDownloaded ? { opacity: 0.4, cursor: "not-allowed" } : {}}
            title={
              !isWificonnected
                ? 'Wi-Fi bağlantısı yok'
                : !isActive
                ? 'Yanlış mail'
                : isDownloaded
                ? 'Bu dosya zaten indirildi'
                : ''
            }
          >
            İndir
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
