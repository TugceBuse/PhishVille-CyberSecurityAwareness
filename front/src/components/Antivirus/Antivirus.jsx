import React, { useState, useRef, useEffect } from 'react';
import './Antivirus.css';
import { MakeDraggable } from '../../utils/Draggable';
import { useUIContext } from '../../Contexts/UIContext';
import { useVirusContext } from '../../Contexts/VirusContext';
import { useFileContext } from '../../Contexts/FileContext';
import { useSecurityContext } from '../../Contexts/SecurityContext';
import { useEventLog } from '../../Contexts/EventLogContext'; // <-- EKLENDİ

const icons = [
  "/icons/folder-home.png",
  "/icons/gallery.png",
  "/icons/desktop.png",
  "/icons/download.png",
  "/icons/docs.png",
  "/icons/picture.png",
  "/icons/music-player.png",
  "/icons/video.png",
  "/icons/computer.png",
  "/icons/network.png"
];

export const useAntivirus = () => {
  const { openWindow, closeWindow } = useUIContext();

  return {
    openHandler: () => openWindow('antivirus'),
    closeHandler: () => closeWindow('antivirus')
  };
};

const Antivirus = ({ closeHandler, style }) => {
  const antivirusRef = useRef(null);
  MakeDraggable(antivirusRef, '.antivirus-header');

  const [isScanning, setIsScanning] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [quarantinedFiles, setQuarantinedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("home");

  // Antivirüs güncellemeleri için durum değişkenleri
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [hasCheckedUpdates, setHasCheckedUpdates] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const updateIntervalRef = useRef(null);

  const { viruses, removeVirus, } = useVirusContext();
  const {
    isWificonnected,
    scanLogs, setScanLogs,
    realTimeProtection, setRealTimeProtection,
    antivirusUpdated, setAntivirusUpdated,
    antivirusUpdating, setAntivirusUpdating,
  } = useSecurityContext();
  const { files, updateFileStatus } = useFileContext();
  const { 
    addEventLog, 
    addEventLogOnce, 
    addEventLogWithCooldown, 
    addEventLogOnChange 
  } = useEventLog(); // <-- LOG FONKSİYONLARI

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Antivirüs Tarama Simülasyonu Karantinaya alma ve log tutma işlemleri
  const handleScanClick = () => {
    setIsScanning(true);
    setScanComplete(false);
    setQuarantinedFiles([]);
    
    // LOG: Tarama başlatıldı (cooldown'lu, 30sn tekrar engeli)
    addEventLogWithCooldown(
      "antivirus_scan",
      null,
      null,
      {
        type: "antivirus_scan",
        questId: "antivirus_install",
        logEventType: "antivirus",
        value: 10,
        data: {}
      },
      30 * 1000 * 60 // 30sn örnek, ihtiyaca göre artır
    );

    const now = new Date();
    const date = now.toLocaleDateString('tr-TR');
    const time = now.toLocaleTimeString('tr-TR');
    const scanDate = `${date} - ${time}`;

    setTimeout(() => {
      const quarantined = [];
      const quarantinedFilesSet = new Set();

      // 🔎 1. Aktif virüsleri analiz et (Virüs context’ten gelenler)
      const detectableViruses = antivirusUpdated
        ? viruses.filter(v => v.detectable && v.sourcefile)
        : [];
      console.log("Detectable Viruses:", detectableViruses);

      detectableViruses.forEach(virus => {
        const fileKey = Object.keys(files).find(
          file => files[file].label.toLowerCase() === virus.sourcefile.toLowerCase()
        );
        console.log("File Key:", fileKey);
        if (fileKey && !quarantinedFilesSet.has(fileKey)) {
          updateFileStatus(fileKey, {
            quarantined: true,
            available: false
          });

          quarantined.push({
            fileName: fileKey,
            virusType: virus.type,
            virusId: virus.id
          });

          quarantinedFilesSet.add(fileKey);
          removeVirus(virus.id); // virüs etkisizleştirildi

          // LOG: Dosya karantinaya alındı (bir kere logla)
          addEventLogOnce(
            "file_quarantined",
            "fileName",
            fileKey,
            {
              type: "file_quarantined",
              questId: "antivirus_install",
              logEventType: "antivirus",
              value: -10,
              data: { fileName: fileKey, virusType: virus.type, virusId: virus.id }
            }
          );
        }
      });

      // 🔍 2. Dosya içinden doğrudan enfekte olanları analiz et (aktif virüs olmasa bile)
      Object.entries(files).forEach(([fileName, fileData]) => {
        // console.log("FileName:", fileName);
        // console.log("FileData:", fileData);
        const isDetectableInfected =
          antivirusUpdated &&
          fileData.detectable &&
          fileData.infected &&
          fileData.available &&
          !fileData.quarantined;
        console.log("Is Detectable Infected:", isDetectableInfected);

        const alreadyHandled = quarantinedFilesSet.has(fileName);

        if (isDetectableInfected && !alreadyHandled) {
          updateFileStatus(fileName, {
            quarantined: true,
            available: false
          });

          quarantined.push({
            fileName,
            virusType: fileData.virusType || "unknown",
            virusId: fileData.virusId || null
          });

          quarantinedFilesSet.add(fileName);

          // LOG: Dosya karantinaya alındı (bir kere logla)
          addEventLogOnce(
            "file_quarantined",
            "fileName",
            fileName,
            {
              type: "file_quarantined",
              questId: "antivirus_install",
              logEventType: "antivirus",
              value: -10,
              data: { fileName, virusType: fileData.virusType || "unknown", virusId: fileData.virusId || null }
            }
          );
        }
      });

      console.log("Quarantined Files:", quarantined);
      console.log("Quarantined Files Set:", quarantinedFilesSet);

      // Durumları güncelle
      setIsScanning(false);
      setScanComplete(true);
      setQuarantinedFiles(quarantined); // Sadece array olarak setle
      setScanLogs(prev => [...prev, { date: scanDate, files: quarantined }]);

      setTimeout(() => setScanComplete(false), 3000);
    }, 5000);
  };

  // Güncelleme kontrolü ve yükleme simülasyonu
  const checkForUpdates = () => {
    setCheckingUpdates(true);
    setTimeout(() => {
      setCheckingUpdates(false);
      setHasCheckedUpdates(true);
      // LOG: Güncellemeler kontrol edildi (sadece 1 kez logla)
      addEventLogWithCooldown(
        "antivirus_update_check",
        null,
        null,
        {
          type: "antivirus_update_check",
          questId: "antivirus_install",
          logEventType: "antivirus",
          value: 5,
          data: { checked: true }
        },
        30 * 60 * 1000 // 30 dakika cooldown
      );
    }, 2000);
  };

  const handleUpdateDefinitions = () => {
    setAntivirusUpdating(true);
    setUpdateProgress(0);

    // LOG: Güncelleme başlatıldı (cooldown'lu, 2dk tekrar engeli)
    addEventLogWithCooldown(
      "antivirus_update_started",
      null,
      null,
      {
        type: "antivirus_update_started",
        questId: "antivirus_install",
        logEventType: "antivirus",
        value: 0,
        data: {}
      },
      2 * 60 * 1000
    );

    updateIntervalRef.current = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(updateIntervalRef.current);
          setAntivirusUpdating(false);
          setAntivirusUpdated(true);

          // LOG: Güncelleme tamamlandı (sadece bir kez logla)
          addEventLogOnce(
            "antivirus_update_completed",
            null,
            null,
            {
              type: "antivirus_update_completed",
              questId: "antivirus_install",
              logEventType: "antivirus",
              value: 10,
              data: { completed: true }
            }
          );
          return 100;
        }
        return prev + 5;
      });
    }, 200); // her 200ms'de %5 artar → ~4 saniye
  };

  useEffect(() => {
    return () => clearInterval(updateIntervalRef.current);
  }, []);
  useEffect(() => {
    if (antivirusUpdating && !isWificonnected) {
      clearInterval(updateIntervalRef.current);
      setAntivirusUpdating(false);
      setUpdateProgress(0);
    }
  }, [isWificonnected, antivirusUpdating]);

  const handleCancelUpdate = () => {
    clearInterval(updateIntervalRef.current);
    setAntivirusUpdating(false);
    setUpdateProgress(0);
    // LOG: Güncelleme iptal edildi (tekrarına izin ver, sadece aksiyon olarak log)
    addEventLog({
      type: "antivirus_update_canceled",
      questId: "antivirus_install",
      logEventType: "antivirus",
      value: 0,
      data: { canceled: true }
    });
  };

  const handleToggleAntivirus = () => {
    setRealTimeProtection(!realTimeProtection);

    // LOG: Gerçek zamanlı koruma toggle (onChange)
    addEventLogOnChange(
      "realtime_protection_toggle",
      "state",
      !realTimeProtection,
      {
        type: "realtime_protection_toggle",
        questId: "antivirus_install",
        logEventType: "antivirus",
        value: !realTimeProtection ? 5 : -5,
        data: { state: !realTimeProtection }
      }
    );
  };

  const handleDeleteFile = (fileName) => {
    updateFileStatus(fileName, { available: false, quarantined: false });
    // LOG: Dosya silindi
    addEventLog({
      type: "file_deleted",
      questId: null,
      logEventType: "antivirus",
      value: 0,
      data: { fileName }
    });
  };

  const handleRestoreFile = (fileName) => {
    updateFileStatus(fileName, { available: true, quarantined: false });
    // LOG: Dosya karantinadan çıkarıldı
    addEventLog({
      type: "file_restored",
      questId: null,
      logEventType: "antivirus",
      value: -3,
      data: { fileName }
    });
  };

  // 🔄 Tüm scanLogs içinden karantinaya alınmış ve hala karantinada olan dosyaları bul
  const allQuarantinedFiles = Object.entries(files)
    .filter(([fileName, fileData]) => fileData.quarantined)
    .map(([fileName, fileData]) => ({ fileName, ...fileData }));

  return (
    <div className="antivirus-window" style={style} ref={antivirusRef} data-window="antivirus">
      <div className="antivirus-header">
        <div className="antivirus-header-left">
          <img src="/icons/shieldSecure.png" alt="Antivirus Icon" />
          <h2>Shield Secure Antivirus</h2>
        </div>
        <button className="antivirus-close" onClick={closeHandler}>×</button>
      </div>

      <div className="antivirus-content">
        <div className="antivirus-menu">
          <button onClick={() => setActiveTab("home")}>Giriş</button>
          <button onClick={() => setActiveTab("scan")}>Tarama</button>
          <button onClick={() => setActiveTab("quarantine")}>Karantina</button>
          <button onClick={() => setActiveTab("updates")}>Güncellemeler</button>
          <button onClick={() => setActiveTab("settings")}>Ayarlar</button>
        </div>

        {activeTab === "home" && (
          <div className="antivirus-home">
            <h2>Shield Secure Antivirus'e Hoş Geldiniz</h2>
            <p>
              Shield Secure, cihazınızı zararlı yazılımlara, fidye yazılımlarına, casus yazılımlara ve diğer dijital tehditlere karşı korumak için tasarlanmıştır.
              Gerçek zamanlı koruma ve düzenli tarama seçenekleriyle sistem güvenliğinizi en üst düzeyde tutar.
            </p>
            <p><br />
              Aşağıda en son gerçekleştirilen taramaların kayıtlarını görüntüleyebilirsiniz. Yeni bir tarama başlatarak sisteminizi tekrar kontrol edebilir, karantinaya alınan dosyaları inceleyebilir veya antivirüs ayarlarını düzenleyebilirsiniz.
            </p>
            <h3>📜 Geçmiş Tarama Kayıtları:</h3>
            <div className="log-listbox">
              {scanLogs.length === 0 ? (
                <p>Henüz tarama yapılmadı.</p>
              ) : (
                <ul>
                  {scanLogs.map((log, index) => (
                    <li key={index}>
                      <strong>{log.date}</strong>
                      <ul>
                        {log.files.length === 0 ? (
                          <li>Herhangi bir tehdit bulunamadı.</li>
                        ) : (
                          log.files.map((file, i) => (
                            <li key={i}>
                              📄 <strong>{file.fileName}</strong> dosyasında <em>{file.virusType}</em> tespit edildi.
                            </li>
                          ))
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === "scan" && (
          <div className="antivirus-scan">
            <h3>Bilgisayarınızı tarayın ve tehditleri bulun!</h3>
            <div className="antivirus-controls">
              <button className="scan-button" onClick={handleScanClick} disabled={isScanning}>
                <img src="/icons/scanner.png" alt="Scanner Icon" />
                <span className="now">ŞİMDİ!</span>
                <span className="play">Taramayı başlat</span>
              </button>
            </div>

            {isScanning && (
              <div className="antivirus-scan-progress">
                <p>🌀 Tarama Yapılıyor...</p>
                <div className="antivirus-icons">
                  <img src={icons[currentIconIndex]} alt="Icon" />
                </div>
              </div>
            )}

            {scanComplete && quarantinedFiles.length === 0 && (
              <div className="antivirus-scan-complete success">
                <img src="/icons/security.png" alt="Security Icon" />
                <p>✅ Tarama tamamlandı. Herhangi bir tehdit bulunamadı.</p>
              </div>
            )}

            {scanComplete && quarantinedFiles.length > 0 && (
              <div className="antivirus-scan-complete warning">
                <img src="/icons/warning.png" alt="Warning Icon" />
                <p>Tarama tamamlandı. {quarantinedFiles.length} dosya karantinaya alındı:</p>
                <ul>
                  {quarantinedFiles.map(({ fileName, virusType }) => (
                    <li key={fileName}>
                      <strong>{fileName}</strong> — ({virusType})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "quarantine" && (
          <div className="antivirus-quarantine">
            <h3>🛑 Karantinadaki Dosyalar</h3>
            {allQuarantinedFiles.length === 0 ? (
              <p>Şu anda karantinada dosya bulunmuyor.</p>
            ) : (
              allQuarantinedFiles.map(({ fileName, virusType }) => (
                <div key={fileName} className="quarantine-entry">
                  <strong>{fileName}</strong> — ({virusType})
                  <button onClick={() => {
                    handleDeleteFile(fileName);
                    setScanLogs([...scanLogs]); // Görünümü tetikle
                  }}>Sil</button>
                  <button onClick={() => {
                    handleRestoreFile(fileName);
                    setScanLogs([...scanLogs]); // Görünümü tetikle
                  }}>Karantinadan Çıkar</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="antivirus-updates">
            <h3>🧬 Virüs Veritabanı Güncellemeleri</h3>
            {!isWificonnected && (
              <div className="antivirus-update-warning">
                <img src="/icons/no-wifi.png" alt="No Wifi" style={{width: 32, verticalAlign: "middle", marginRight: 8}} />
                <span>İnternet bağlantısı yok. Güncelleme yapılamaz.</span>
              </div>
            )}
            {!hasCheckedUpdates && (
              <button
                onClick={checkForUpdates}
                disabled={checkingUpdates || !isWificonnected}
                title={!isWificonnected ? "Güncelleme için internet gerekli" : ""}
              >
                {checkingUpdates ? "Güncellemeler kontrol ediliyor..." : "Güncellemeleri Kontrol Et"}
              </button>
            )}
            {hasCheckedUpdates && antivirusUpdated && (
              <p className="updated-msg">✅ Sisteminiz zaten güncel.</p>
            )}
            {hasCheckedUpdates && !antivirusUpdated && (
              <>
                {!antivirusUpdating && (
                  <>
                    <p>🚨 Yeni bir güvenlik yükseltmesi bulundu.</p>
                    <button
                      onClick={handleUpdateDefinitions}
                      disabled={!isWificonnected}
                      title={!isWificonnected ? "Güncelleme için internet gerekli" : ""}
                    >
                      Güncellemeyi Yükle
                    </button>
                  </>
                )}
                {antivirusUpdating && (
                  <>
                    <p>🔄 Güncelleme yükleniyor: %{updateProgress}</p>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${updateProgress}%` }}></div>
                    </div>
                    <button onClick={handleCancelUpdate}>İptal Et</button>
                  </>
                )}
              </>
            )}
          </div>
        )}


        {activeTab === "settings" && (
        <div className="antivirus-settings">
          <h3>⚙️ Ayarlar</h3>
          <div className="toggle-setting">
            <span>Gerçek Zamanlı Koruma:</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={realTimeProtection}
                onChange={handleToggleAntivirus}
              />
              <span className="slider"></span>
            </label>
            <span className="status-text">{realTimeProtection ? "Açık" : "Kapalı"}</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Antivirus;
