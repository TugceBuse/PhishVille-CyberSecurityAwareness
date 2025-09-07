import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Desktop.css';
import { useWindowConfig }  from '../../Contexts/WindowConfigContext'
import { useUIContext } from '../../Contexts/UIContext';
import { useGameContext } from '../../Contexts/GameContext';
import { useFileContext } from '../../Contexts/FileContext';
import TaskBar from '../TaskBar/TaskBar';
import Alert from '../Notifications/Alert';
import RansomScreen from '../Notifications/Ransom';
import FileOpener from '../../viewers/FileOpener';
import { TodoProvider } from '../../Contexts/TodoContext';
import { useVirusContext } from '../../Contexts/VirusContext';
import TaskApp from '../TaskApp/TaskApp';
import PopupThrower from '../PopupThrower/PopupThrower';
import RansomwareHash from '../RansomwareHash/RansomwareHash';
import { useQuestManager } from '../../Contexts/QuestManager';
import EndGame from '../EndGame/EndGame';


const Desktop = ({ hacked, onFormat }) => {
  const { isWificonnected, saveSession, Totalscore } = useGameContext();
  const { openWindows, visibleWindows, handleIconClick, setZindex, windowProps } = useUIContext();
  const { openedFiles, files } = useFileContext();
  const { addVirus, viruses, removeVirus } = useVirusContext();
  const { quests, getActiveQuests } = useQuestManager();
  const { windowConfig } = useWindowConfig();
  const navigate = useNavigate();

  const [showEndGame, setShowEndGame] = useState(false);

  const finishCalled = useRef(false);
  const [showAlert, setShowAlert] = useState(false);

  // Yeni pencere konumlarını tutacak state
  const [windowPositions, setWindowPositions] = useState({});

useEffect(() => {
    if (getActiveQuests().length === 0 && !finishCalled.current) {
      finishCalled.current = true;
      saveSession().then((result) => {
        // Dilersen başarılıysa bildirim veya yönlendirme yapabilirsin
        if (result === true) {
          setShowEndGame(true); // EndGame penceresini aç
        } else {
          alert("Oyun kaydedilemedi: " + result);
        }
      });
    }
    // Eğer tekrar görev açılırsa tetikleyici sıfırlansın
    if (getActiveQuests().length > 0) finishCalled.current = false;
  }, [quests, getActiveQuests, saveSession]);


  useEffect(() => {
    if (!hacked) return;
    const audio = new Audio("/fan.mp3");
    audio.loop = true;
    audio.volume = 0.6;
    audio.play().catch(() => {});
    document.body.classList.add("hacked-cursor");
    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.body.classList.remove("hacked-cursor");
    };
  }, [hacked]);

  // Hacked mode'da popup ve overlay ekle
  useEffect(() => {
    if (!hacked) return;
    // Adware virüsünü context’e ekle
    addVirus({ type: "adware" });
    return () => {
      // Hacked moddan çıkınca adware’ı kaldırabilirsin
      removeVirus(viruses.find(v => v.type === "adware")?.id);
    };
  }, [hacked]);

  // handlers nesnesini dinamik oluşturma
  const handlers = Object.keys(windowConfig).reduce((acc, key) => {
    acc[key] = windowConfig[key].useComponent();
    return acc;
  }, {});

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  // ✅ Açık olan pencere sırasına göre pozisyon belirleme
  useEffect(() => {
    setWindowPositions((prevPositions) => {
      let updatedPositions = { ...prevPositions };

      visibleWindows.forEach((windowKey, index) => {
        if (!updatedPositions[windowKey]) {
          updatedPositions[windowKey] = {
            left: `${window.innerWidth / 10 + index * 30}px`,
            top: `${window.innerHeight / 10 + index * 30}px`,
            zIndex: 100 + index,
          };
          console.log('windowpositions:', updatedPositions[windowKey], 'zindex:', 100 + index);
          
        }
      });

      return updatedPositions;
    });
    setZindex((prevZindex) => prevZindex + 1);
  }, [visibleWindows]);

  useEffect(() => {
    if (openWindows.length === 0 && openedFiles.length === 0) {
      setWindowPositions({});
      setZindex(100);
    }
  }, [openWindows, openedFiles]);

  const handleDesktopClick = (windowKey) => {
    const handler = handlers[windowKey];

    if (handler?.openHandler) {
      if (!openWindows.includes(windowKey)) {
        const requiresInternet = windowConfig[windowKey]?.requiresInternet;
        if (requiresInternet && !isWificonnected) {
          setShowAlert(true);
        } else {
          handler.openHandler();
          handleIconClick(windowKey);
        }
      }
    } else {
      // Eğer bir pencere handler'ı yoksa ama dosyaysa
      const file = files[windowKey] || files.find?.(f => f.id === windowKey);
      if (file?.onOpen) {
        file.onOpen();
      }else {
        console.error(`No openHandler or onOpen found for ${windowKey}`);
      }
    }
  };


  return (
    <div  className={`desktop${hacked ? " hacked-wallpaper" : ""}`}>
      <div className="desktop-icons">

        {/* 🪟 Pencere ikonları */}
        {Object.keys(windowConfig)
          .filter((key) => windowConfig[key].available && windowConfig[key].location === 'desktop')
          .map((key) => (
            <div
              key={key}
              className="icon"
              {...(windowConfig[key].clickable && { onClick: () => handleDesktopClick(key) })}
            >
              <img src={windowConfig[key].icon} alt={`${windowConfig[key].label} Icon`} />
              <span>{windowConfig[key].label}</span>
            </div>
          ))}

        {/* 📂 Dosya ikonları */}
        {Object.entries(files)
          .filter(([_, file]) => file.available && file.location === 'desktop')
          .map(([fileName, file]) => (
            <div
              key={fileName}
              className="icon"
              {...(file.clickable && { onClick: () => handleDesktopClick(fileName) })}
            >
              <img src={file.icon} alt={`${file.label} Icon`} />
              <span>{file.label}</span>
            </div>
          ))}
      </div>


      <TodoProvider>
        {/* 📂 **Açılan Uygulamalar (windowConfig içindekiler) ** */}
        {openWindows.map((windowKey) => {
          if (!windowConfig[windowKey]) return null;
          const { component: WindowComponent } = windowConfig[windowKey];
          const { closeHandler } = handlers[windowKey];
          const props = windowProps[windowKey] || {}; // 👈 ekstra props al

          return (
            <WindowComponent
              key={windowKey}
              closeHandler={closeHandler}
              style={windowPositions[windowKey] || {}}
              {...props} // 👈 props'u geçir
            />
          );
        })}


        {/* 📂 **Açılan Dosyalar İçin Pencere Yönetimi** */}
        {openedFiles.map((fileName) => {
          const file = files[fileName];
          return (
            <div key={fileName} className="window file-window" 
            style={windowPositions[fileName] || {}}
            >
              <FileOpener file={file} fileName={fileName} {...(windowProps[fileName] || {})}/>
            </div>
          );
        })}
      </TodoProvider>

      {hacked && (
        <div>
          <div
            className="hackedOverlay"
            onClick={e => {
              // Start menu ve format butonu dışında engelle
              if (
                !e.target.closest('.start-menu-window') &&
                !e.target.closest('.format-button')
              ) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onMouseDown={e => e.preventDefault()}
            onMouseMove={e => e.preventDefault()}
            tabIndex={-1}
          >       
          </div>
          <div className="hacked-overlay-text">
              <svg className="skull-icon" width="72" height="72" viewBox="0 0 72 72" fill="none">
              <ellipse cx="36" cy="36" rx="34" ry="32" fill="#000" opacity="0.3"/>
              <circle cx="36" cy="36" r="26" stroke="#12FF33" strokeWidth="4" fill="none"/>
              <ellipse cx="26" cy="36" rx="4.5" ry="7" fill="#12FF33"/>
              <ellipse cx="46" cy="36" rx="4.5" ry="7" fill="#12FF33"/>
              <ellipse cx="36" cy="54" rx="8" ry="5" fill="#12FF33"/>
              <path d="M24 58 Q36 70 48 58" stroke="#12FF33" strokeWidth="3" fill="none"/>
              <ellipse cx="36" cy="48" rx="2" ry="1" fill="#111"/>
            </svg>
            <span className="hacked-main-text">HACKED</span>
            <span className="hacked-sub-text">BY PHISHVILLE</span>
          </div>
        </div>
      )}

      <TaskBar windowConfig={windowConfig} hacked={hacked} onFormat={onFormat}/>

      <Alert
        show={showAlert}
        handleClose={() => setShowAlert(false)}
        message="Internet bağlantısı bulunamadı"
      />
      {viruses.some(v => v.type === 'adware' || v.type === 'credential-stealer') && <PopupThrower/>}
      {viruses.some(v => v.type === 'ransomware') && <RansomScreen score={Totalscore} saveSession={saveSession}/>}
      {viruses.some(v => v.type === 'ransomwareHash') && <RansomwareHash />}
      <TaskApp />
      {showEndGame && (
      <EndGame
        title="Simülasyon Tamamlandı!"
        description="Tüm görevleri tamamladınız. Tebrikler!"
        score={Totalscore}
        onRestart={() => { navigate("/") }}
        onClose={() => navigate("/") }
      />
      )}
    </div>
  );
};

export default Desktop;
