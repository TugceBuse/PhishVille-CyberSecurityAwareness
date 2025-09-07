import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useGameContext } from '../../Contexts/GameContext';
import { useUIContext } from '../../Contexts/UIContext';
import Alert from "../Notifications/Alert";
import "./Taskbar.css";
import { useMailContext } from '../../Contexts/MailContext';
import { useFileContext } from '../../Contexts/FileContext';
import SystemSettings from '../SystemSettings/SystemSettings';
import { useNotificationContext } from '../../Contexts/NotificationContext';
import { useTimeContext } from '../../Contexts/TimeContext';
import { useSecurityContext } from '../../Contexts/SecurityContext';
import { useQuestManager } from '../../Contexts/QuestManager';
import { useEventLog } from '../../Contexts/EventLogContext';


const TaskBar = ({ windowConfig, hacked, onFormat }) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const startMenuRef = useRef(null);
  const [shuttingDown, setShuttingDown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWifiList, setShowWifiList] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState('');
  const [showPassAlert, setShowPassAlert] = useState(false);
  const [showWifiAlert, setShowWifiAlert] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [wifiname, setWifiname] = useState('');

  const pass = "XYZ2025";
  const navigate = useNavigate();

  const { addEventLogOnce } = useEventLog();
  const { gameDate } = useTimeContext();

  const { completeQuest } = useQuestManager();

  const {
    isWificonnected, setIsWificonnected
  } = useGameContext();

  const { antivirusUpdated, antivirusUpdating } = useSecurityContext();

  const { setSelectedMail, inboxMails, setInboxMails } = useMailContext();
  const {
    openWindows, activeWindow, setActiveWindow,
    visibleWindows, setVisibleWindows,
    handleIconClick, zindex, setZindex,
    openWindow
  } = useUIContext();

  const { openedFiles, files } = useFileContext();

  // NotificationContext'ten karma sıralı, okunmamış taskbar bildirimleri
  const {
    taskbarNotifications,
    removeNotification
  } = useNotificationContext();

  // Taskbar ikonlarını oluştur
  const renderIcons = () => {
    const uniqueWindows = [...new Set([...openWindows, ...openedFiles])];
    return uniqueWindows.map((windowName) => {
      const appConfig = windowConfig[windowName];
      const fileConfig = files[windowName];
      if (!appConfig && !fileConfig) {
        console.warn(`❌ Taskbar'da bilinmeyen pencere/dosya: ${windowName}`);
        return null;
      }
      return (
        <img
          key={appConfig ? `app-${windowName}` : `file-${windowName}`}
          src={appConfig?.icon || fileConfig?.icon || "/icons/file.png"}
          alt={`${windowName} Icon`}
          className={activeWindow === windowName ? 'active' : ''}
          onClick={() => handleIconClickWithVisibility(windowName)}
        />
      );
    });
  };

  const handleStartButtonClick = () => {
    setShowStartMenu(!showStartMenu);
  };

  const handleShutdownClick = () => {
    setShuttingDown(true);
    setTimeout(() => navigate("/"), 2000);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleWifiList = () => {
    setShowWifiList(!showWifiList);
  };

  const handleWifiClick = (wifiName, requiresPassword) => {
  if (requiresPassword) {
    setSelectedWifi(wifiName);
    setShowPasswordPrompt(true);
  } else {
    setIsWificonnected(true);
    setWifiname(wifiName);
    // Her wifi için sadece ilk bağlantıda log tut
    addEventLogOnce(
      "wifi_connect",         // type
      "wifi",                 // uniqueField
      wifiName,               // uniqueValue
      {
        type: "wifi_connect",
        questId: "wifi_connect",
        logEventType: "wifi",
        value: -10,
        data: {
          wifi: wifiName,
          isPrivate: false
        }
      }
    );
    completeQuest("wifi_connect");
  }
};

const handlePasswordSubmit = (e) => {
  e.preventDefault();
  const password = e.target.elements.password.value;
  setShowPasswordPrompt(false);
  if (password === pass) {
    setIsWificonnected(true);
    setWifiname(selectedWifi);
    completeQuest("wifi_connect");
    addEventLogOnce(
      "wifi_connect",
      "wifi",
      selectedWifi,
      {
        type: "wifi_connect",
        questId: "wifi_connect",
        logEventType: "wifi",
        value: 10,
        data: {
          wifi: selectedWifi,
          isPrivate: true
        }
      }
    );
  } else {
    setShowPassAlert(true);
    setIsWificonnected(false);
  }
};


  // Taskbarda bir ikona tıklandığında pencereyi öne al/gizle
  const handleIconClickWithVisibility = (windowName) => {
    const isFile = files[windowName] !== undefined;
    const innerSelector = isFile
      ? `[data-filename="${windowName}"]`
      : `[data-window="${windowName}"]`;
    const innerElement = document.querySelector(innerSelector);
    const element = isFile
      ? innerElement?.closest('.file-window')
      : innerElement;

    if (!element) {
      console.log(`.${windowName}-window elementi bulunamadı`);
      return;
    }

    if (!element.dataset.originalDisplay) {
      const computedDisplay = getComputedStyle(element).display;
      element.dataset.originalDisplay = computedDisplay;
    }

    if (activeWindow === windowName) {
      element.style.display = 'none';
      setVisibleWindows((prevVisibleWindows) => {
        const filteredWindows = prevVisibleWindows.filter(name => name !== windowName);
        return [...filteredWindows];
      });
      handleIconClick(windowName);
    } else {
      setZindex((prevZindex) => {
        let newZindex = prevZindex + 1;
        element.style.display = element.dataset.originalDisplay || 'flex';
        element.style.zIndex = `${newZindex}`;
        return newZindex;
      });

      setVisibleWindows((prevVisibleWindows) => {
        const filteredWindows = prevVisibleWindows.filter(name => name !== windowName);
        return [...filteredWindows, windowName];
      });

      handleIconClick(windowName);
    }
  };

  // Mail bildirimi tıklandığında açma
  const handleOpenMailNotification = (notification) => {
    if (!isWificonnected) {
      setShowWifiAlert(true);
      return;
    }
    const mailObj = inboxMails.find(mail => mail.id === notification.appData?.mailId);
    if (mailObj) {
      setSelectedMail(mailObj);
      setInboxMails(prev =>
        prev.map(m =>
          m.id === mailObj.id ? { ...m, readMail: true } : m
        )
      );
    }
    if (!openWindows.includes('mailbox')) {
      openWindow('mailbox');
    }
    removeNotification(notification.id);
    setShowNotifications(false);
  };

  // SMS/Phone bildirimi tıklandığında PhoneApp açma
  const handleOpenPhoneNotification = (notification) => {
    openWindow('phoneapp');
    removeNotification(notification.id);
    setShowNotifications(false);
  };

  // Sistem bildirimi tıklandığında (örneği)
  const handleOpenSystemNotification = (notification) => {
    // Buraya sistem bildirimi aksiyonu ekleyebilirsin.
    removeNotification(notification.id);
    setShowNotifications(false);
  };

  // Bildirim türüne göre tıklama aksiyonu belirle
  const handleNotificationClick = (notif) => {
    if (notif.appType === "mail") {
      handleOpenMailNotification(notif);
    } else if (notif.appType === "phone") {
      handleOpenPhoneNotification(notif);
    } else if (notif.appType === "chatapp") {
      openWindow('chatapp', { userId: notif.appData?.userId });
      removeNotification(notif.id);
      setShowNotifications(false);
    } else {
      handleOpenSystemNotification(notif);
    }
  };

  // Aktif pencereyi güncelle
  useEffect(() => {
    setActiveWindow(visibleWindows[visibleWindows.length - 1]);
  }, [visibleWindows, setActiveWindow]);

  // Start menüsü dışında bir yere tıklanırsa kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showStartMenu &&
        startMenuRef.current &&
        !startMenuRef.current.contains(event.target)
      ) {
        setShowStartMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStartMenu]);

  // Antivirüs ikonunu güncelle
  const setAntivirus = () => {
    if (antivirusUpdating) {
      return {
        icon: <img src="/icons/antivirus_in_progress.png" alt="Antivirus Updating Icon" />,
        tooltip: (
          <div className="tooltip tooltip-visible">
            Antivirus güncelleniyor...
            <div className="loading-bar">
              <div className="loading-bar-progress"></div>
            </div>
          </div>
        )
      };
    } else if (antivirusUpdated) {
      return {
        icon: <img src="/icons/antivirus_latest.png" alt="Antivirus Latest Icon" />,
        tooltip: (
          <div className="tooltip">
            Antivirus güncel!
          </div>
        )
      };
    } else {
      return {
        icon: <img src="/icons/antivirus_update.png" alt="Antivirus Warning Icon" />,
        tooltip: (
          <div className="tooltip">
            Antivirus güncellemesi gerekli!
          </div>
        )
      };
    }
  };
  const { icon: antivirusIcon, tooltip: antivirusTooltip } = setAntivirus();

  const wifiIcon = isWificonnected
    ? <img src="/icons/wifi.png" alt="Wifi Connected Icon" />
    : <img src="/icons/no-wifi.png" alt="Wifi Disconnected Icon" />;
  const wifiTooltip = isWificonnected
    ? (
      <>
        <b>{wifiname}</b>
        <br />
        Internet erişimi
      </>
    )
    : "WiFi Bağlı Değil";

  // Bildirim sayacı (karma tüm okunmamış taskbar bildirimleri)
  const totalNotificationCount = taskbarNotifications.length;

  // === ANTİVİRÜS İKONUNA TIKLANINCA AÇILMASI ===
  const handleAntivirusIconClick = () => {
    openWindow('antivirus'); // ShieldSecureAntivirus veya antivirüs pencerenin windowConfig içinde tanımı 'antivirus' ise
  };

  return (
    <div className="taskbar">
      {/* Başlat Menüsü */}
      <div className="taskbar-icons" onClick={handleStartButtonClick}>
        <img src="/icons/menu (1).png" alt="Start Button" />
      </div>
      {showStartMenu && (
        <div className="start-menu-window" ref={startMenuRef}>
          <h2>Başlat Menüsü</h2>
          <div className="start-menu-container">
            {!hacked && (
              <>
                <div className="start-menu-item"
                  onClick={() => setShowSystemSettings(true)}
                >
                  <img src="/icons/system-settings.png" alt="Firewall Icon" />
                  <p>Sistem Ayarları</p>
                </div>
              </>
            )}
            {/* HACKED ise sadece formatla aktif */}
            {hacked && (
              <div
                className="format-button"
                onClick={() => {
                  setShowStartMenu(false);
                  setShowSystemSettings(false);
                  if (typeof onFormat === "function") onFormat();
                }}
              >
                <img src="/reset.png" alt="Format Icon" />
              </div>
            )}
          </div>
          {showSystemSettings && (
            <SystemSettings onClose={() => setShowSystemSettings(false)} />
          )}
          {!hacked && (
            <div className="shutdown-button" onClick={handleShutdownClick}>
              <img src="/icons/switch.png" alt="Switch Icon" />
              Bilgisayarı Kapat
            </div>
          )}
          {shuttingDown && (
            <div className="shutdown-screen">
              <p className="shutdown-text">Kapanıyor...</p>
            </div>
          )}
        </div>
      )}

      <div className="taskbar-icons">
        {renderIcons().map((icon, i) => {
          if (!React.isValidElement(icon)) return null;
          // Mevcut className'i al, üzerine "hacked-disabled" ekle
          const newClass = hacked
            ? ((icon.props.className || "") + " hacked-disabled").trim()
            : icon.props.className || "";
          return React.cloneElement(icon, {
            className: newClass,
            style: hacked
              ? { ...(icon.props.style || {}), pointerEvents: "none", opacity: 0.4 }
              : icon.props.style || {},
            key: i,
          });
        })}
      </div>

      <div className="taskbar-right">
        {windowConfig.antivirus?.available && (
          <div
            className="taskbar-antivirus"
            onClick={handleAntivirusIconClick}
            style={hacked ? { pointerEvents: "none", opacity: 0.4 } : { cursor: 'pointer' }}
          >
            {antivirusIcon}
            {antivirusTooltip}
          </div>
        )}

        <div
          className="taskbar-wifi"
          onClick={toggleWifiList}
          style={hacked ? { pointerEvents: "none", opacity: 0.4 } : {}}
        >
          {wifiIcon}
          <div className="tooltip">
            {wifiTooltip}
          </div>
          {showWifiList && (
            <div className="wifi-list">
              <ul>
                <li onClick={() => handleWifiClick('XYZCompany Network', true)}>
                  XYZCompany Network<img src="/icons/lock.png" alt="Lock Icon" />
                </li>
                <li onClick={() => handleWifiClick('Avoa Cafe Network', false)}>Avoa Cafe Network</li>
                <li onClick={() => handleWifiClick('QWERTY Network', false)}>QWERTY Network</li>
              </ul>
            </div>
          )}
        </div>

        <div
          className="taskbar-status"
          style={hacked ? { pointerEvents: "none", opacity: 0.4 } : {}}
        >
          <div className="taskbar-clock">
            <div className="clock">
              {gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div>
              {gameDate.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </div>
          </div>

          <div className="taskbar-notifications" onClick={toggleNotifications}>
            <img src="/icons/notification_blck.png" alt="Notification Icon" />
            {totalNotificationCount > 0 &&
              <span className="notification-count">
                {totalNotificationCount}
              </span>
            }
            {showNotifications && (
              <div className="notifications-window">
                <h3>Bildirimler</h3>
                {(totalNotificationCount > 0) ? (
                  <>
                    {taskbarNotifications.map((notif) => (
                      <div key={notif.id} className="notification-item"
                        onClick={() => handleNotificationClick(notif)}>
                         <strong>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
                            <img style={{ width: 30, height: 30 }} src={notif.icon} alt="Notification Icon" />
                            <p className='notif-title'>{notif.title}</p>
                            <p
                              className='mail-notification-close'
                              onClick={e => { e.stopPropagation(); removeNotification(notif.id); }}
                            >x</p>
                          </div>
                        </strong>
                        <p>{notif.message}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="non-notification">
                    <p>Henüz bir bildiriminiz yok.</p>
                    <img className='sad-face' src="/anxiety.png" alt="Sad Face Icon" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {showPasswordPrompt && (
        <div className="password-prompt">
          <form onSubmit={handlePasswordSubmit}>
            <h3>{selectedWifi} için şifre girin:</h3>
            <input type="password" name="password" required />
            <button type="submit">Bağlan</button>
            <button type="button" onClick={() => setShowPasswordPrompt(false)}>İptal</button>
          </form>
        </div>
      )}
      <Alert show={showPassAlert} handleClose={() => setShowPassAlert(false)} message={'Şifre yanlış'} />
      <Alert show={showWifiAlert} handleClose={() => setShowWifiAlert(false)} message={'İnternet bağlantısı bulunamadı'} />
    </div>
  );
};

export default TaskBar;
