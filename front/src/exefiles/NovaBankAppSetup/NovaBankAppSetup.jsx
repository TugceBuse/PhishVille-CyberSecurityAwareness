import React, { useState, useRef, useEffect } from 'react';
import './NovaBankAppSetup.css';
import { useUIContext } from '../../Contexts/UIContext';
import { useFileContext } from '../../Contexts/FileContext';
import { useWindowConfig } from '../../Contexts/WindowConfigContext';
import { useQuestManager } from '../../Contexts/QuestManager';
import { useEventLog } from '../../Contexts/EventLogContext'; // Log ekleme fonksiyonu

const NovaBankAppSetup = ({ fileName, onInstallComplete, onAntivirusCheck }) => {
  const { closeFile, files } = useFileContext();
  const { updateAvailableStatus, windowConfig } = useWindowConfig();
  const { completeQuest } = useQuestManager();
  const { addEventLog } = useEventLog();
  const SetupRef = useRef(null);

  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [blocked, setBlocked] = useState(false); // eklenen alan
  const intervalRef = useRef(null);

  // Kurulum tamamlandığında onInstallComplete çağrılır (adware burada eklenir)
  useEffect(() => {
    if (step === 4 && typeof onInstallComplete === 'function') {
      onInstallComplete();
    }
    // Sadece step değişince tetiklenir
    // eslint-disable-next-line
  }, [step]);

  const handleClose = () => {
    clearInterval(intervalRef.current);
    closeFile(fileName);
  };

  const handleNext = () => {
    if (windowConfig.novabankapp?.available) {
      setStep(0);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    if (progress > 0) {
      setProgress(0);
      setInstalling(false);
      clearInterval(intervalRef.current);
    }
  };

  // ANTIVIRUS CHECK ENTEGRASYONU
  const startInstallation = async () => {
    if (typeof onAntivirusCheck === "function") {
      const result = await onAntivirusCheck({ customVirusType: "adware" });
      if (result === "blocked") {
        setBlocked(true);
        return;
      }
    }
    setInstalling(true);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          setInstalling(false);
          setStep(4);
          updateAvailableStatus('novabankapp', true);

          const fileMeta = files?.[fileName];
          const isFake = fileMeta?.infected === true || fileMeta?.virusType === "adware";
          addEventLog({
            type: "setup_novabank",
            questId: "download_novabank",
            logEventType: "setup",
            value: isFake ? -10 : 10,
            data: 
            {
              file: fileName,
              infected: fileMeta?.infected,
              virusType: fileMeta?.virusType || null,
            }
          });
          completeQuest('download_novabank'); // Görev tamamlandı
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 4) + 1, 100);
      });
    }, 300);
  };

  const cancelInstallation = () => {
    clearInterval(intervalRef.current);
    setInstalling(false);
    setProgress(0);
  };

  if (blocked) {
    return (
      <div className="novabanksetup-overlay">
        <div className="novabanksetup-window" ref={SetupRef}>
          <div className="novabanksetup-header">
            <div className="novabanksetup-header-left">
              <img className="novabanksetup-img" src="/novaBank/NovaBankAppSetup.png" alt="Bank" />
              <h2>NovaBank Uygulama Kurulumu</h2>
            </div>
            <button className="novabanksetup-close" onClick={handleClose}>×</button>
          </div>
          <div className="novabanksetup-container">
            <h4>Kurulum Tehlikeden Dolayı Durduruldu</h4>
            <button onClick={handleClose}>Kapat</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="novabanksetup-overlay">
      <div className="novabanksetup-window" ref={SetupRef}>
        <div className="novabanksetup-header">
          <div className="novabanksetup-header-left">
            <img className="novabanksetup-img" src="/novaBank/NovaBankAppSetup.png" alt="Bank" />
            <h2>NovaBank Uygulama Kurulumu</h2>
          </div>
          <button className="novabanksetup-close" onClick={handleClose}>×</button>
        </div>
        <div className="novabanksetup-content">
          <div className="novabanksetup-content-left"
            style={{ backgroundImage: `url('/novaBank/NovaBankAppSetup.png')` }} />
          <div className="novabanksetup-container">
            {step === 0 && (
              <div className="novabanksetup-step">
                <h4>NovaBank Zaten Kurulu</h4>
                <p>Bu bilgisayarda NovaBank uygulaması zaten kurulu.</p>
                <button onClick={handleClose}>Tamam</button>
              </div>
            )}

            {step === 1 && (
              <div className="novabanksetup-step">
                <h4>Adım 1: Kullanıcı Sözleşmesi</h4>
                <p>Lütfen şartları okuyun ve kabul edin.</p>
                <textarea
                  readOnly
                  style={{ backgroundColor: "#1a2837", color: "#fff", height: 150 }}
                  value={`Bu uygulama finansal işlemler için tasarlanmıştır.\nYetkisiz kullanım yasaktır.\nVeri gizliliği garanti altındadır.`}
                />
                <button onClick={handleNext}>Kabul Ediyorum</button>
              </div>
            )}

            {step === 2 && (
              <div className="novabanksetup-step">
                <h4>Adım 2: Kurulum Dizini</h4>
                <p>NovaBank uygulaması şu konuma kurulacaktır:</p>
                <div style={{ backgroundColor: "#1a2837", color: "white", padding: 10, width: 300 }}>
                  C:\Program Files\NovaBankApp
                </div>
                <div className="novabanksetup-buttons">
                  <button onClick={handleBack}>Geri</button>
                  <button onClick={handleNext}>İleri</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="novabanksetup-step">
                <h4>Adım 3: Kurulum</h4>
                <p>Kurulumu başlatmak için tıklayın.</p>
                <div className="novabanksetup-buttons">
                  <button onClick={handleBack}>Geri</button>
                  {!installing ? (
                    <button onClick={startInstallation}>Kurulumu Başlat</button>
                  ) : (
                    <button onClick={cancelInstallation}>İptal Et</button>
                  )}
                </div>
                {installing && (
                  <div className="progress-bar3-wrapper">
                    <div className="progress-bar3">
                      <div className="progress-bar3-inner" style={{ width: `${progress}%` }} />
                      <span className="progress-bar3-label">% {progress}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="novabanksetup-step">
                <h4>✅ Kurulum Tamamlandı</h4>
                <p>NovaBank uygulaması başarıyla kuruldu.</p>
                <button onClick={handleClose}>Tamam</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaBankAppSetup;
