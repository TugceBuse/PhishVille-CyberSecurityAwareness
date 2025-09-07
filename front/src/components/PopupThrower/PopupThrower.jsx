import React, { useEffect, useState, useRef } from "react";
import { useVirusContext } from "../../Contexts/VirusContext";
import { useNotificationContext } from "../../Contexts/NotificationContext";
import { useUIContext } from "../../Contexts/UIContext";
import "./PopupThrower.css";
import { useEventLog } from "../../Contexts/EventLogContext";

// Sahte sistem bildirimleri
const fakeNotifications = [
  {
    title: "Sistem Performansı",
    message: "RAM kullanımı %97 seviyesine ulaştı!",
    type: "warning",
    icon: "/icons/warning.png"
  },
  {
    title: "Güncelleme Mevcut",
    message: "Sistem bileşenleriniz güncel değil.",
    type: "info",
    icon: "/icons/info.png"
  },
  {
    title: "Güvenlik Uyarısı",
    message: "Bilinmeyen ağ trafiği tespit edildi. Bağlantınızı kontrol edin.",
    type: "danger",
    icon: "/icons/danger.png"
  },
  {
    title: "Tarayıcı Önerisi",
    message: "NovaSecure Browser ile daha hızlı, güvenli ve reklamsız gezinme!",
    type: "info",
    icon: "/icons/info.png"
  }
];

// Reklam popup içerikleri
const AdPopupVPN = ({ onClick, onLog }) => (
  <div>
    <h3>🔒 NovaVPN - 6 Aylık Ücretsiz!</h3>
    <p>
      Tüm cihazlarınızda sınırsız koruma. <br />
      Kimliğinizi gizleyin, internet özgürlüğünün tadını çıkarın.
    </p>
    <button className="popup-btn" onClick={() => {
    onLog && onLog({
      type: "adware_popup",
      questId: null,
      logEventType: "adware_click",
      value: -5,
      data: { popupType: "vpn", button: "Şimdi Etkinleştir" }
    });
    onClick();
  }}>Şimdi Etkinleştir</button>
  </div>
);

const AdPopupPrize = ({ onClick, onLog  }) => (
  <div>
    <h3>🎁 1000 TL Değerinde Alışveriş Çeki!</h3>
    <p>
      Sadece bugün için geçerli! <br />
      Şanslı 100 kişiden biri siz olun. Numaranızı doğrulayın.
    </p>
    <button className="popup-btn" onClick={() => {
    onLog && onLog({
      type: "adware_popup",
      questId: null,
      logEventType: "adware_click",
      value: -5,
      data: { popupType: "vpn", button: "Şimdi Etkinleştir" }
    });
    onClick();
  }}>Ödülümü Al</button>
  </div>
);

const AdPopupCleaner = ({ onClick, onLog  }) => (
  <div>
    <h3>🧼 NovaCleaner - Ücretsiz Sistem Temizleyici</h3>
    <p>
      Bilgisayarınız yavaşladı mı? <br />
      Tek tıkla derin temizlik, gereksiz dosyalardan kurtulun!
    </p>
    <button className="popup-btn" onClick={() => {
    onLog && onLog({
      type: "adware_popup",
      questId: null,
      logEventType: "adware_click",
      value: -5,
      data: { popupType: "vpn", button: "Şimdi Etkinleştir" }
    });
    onClick();
  }}>Temizlemeye Başla</button>
  </div>
);

const AdPopupCard = ({ onClick, onLog  }) => (
  <div>
    <h3>💳 Kart Aidatı Geri Ödeme</h3>
    <p>
      Banka aidatlarınızı geri alın. <br />
      Başvurunuzu yapın, son 6 ayın ücretlerini anında iade alın!
    </p>
    <button className="popup-btn" onClick={() => {
      onLog && onLog({
        type: "adware_popup",
        questId: null,
        logEventType: "adware_click",
        value: -5,
        data: { popupType: "vpn", button: "Şimdi Etkinleştir" }
      });
      onClick();
  }}>Geri Ödeme Talep Et</button>
  </div>
);

// Banka - Credentail Stealer Popup
const CredentialStealerPopup = ({ onClick, onLog }) => {
  const [form, setForm] = useState({ tckn: '', password: '' });
  return (
    <div>
      <h3>🔑 NovaBank Giriş</h3>
      <p>
        Şüpheli oturum tespit edildi. Lütfen tekrar giriş yapın!
      </p>
      <input
        type="text"
        required
        placeholder="TCKN"
        value={form.tckn}
        maxLength={11}
        onChange={e => setForm(f => ({ ...f, tckn: e.target.value.replace(/\D/g, '') }))}
        style={{
          marginBottom: 9, width: "75%", padding: 8, borderRadius: 5, border: "1px solid #ddd", fontSize: "1rem"
        }}
      />
      <input
        type="password"
        required
        placeholder="NovaBank Şifresi"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        style={{
          marginBottom: 14, width: "75%", padding: 8, borderRadius: 5, border: "1px solid #ddd", fontSize: "1rem"
        }}
      />
      <button
        className="popup-btn"
        onClick={() => {
        onLog && onLog({
          type: "credential_stealer",
          questId: null,
          logEventType: "credential_submit",
          value: -5,
          data: { popupType: "novabank", tckn: form.tckn }
        });
        onClick(form);
      }}
      >
        Giriş Yap
      </button>
    </div>
  );
};

// ChatApp - Credential Stealer Popup
const ChatAppStealerPopup = ({ onClick, onLog }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  return (
    <div>
      <h3>🔒 ChatBox Hesap Girişi</h3>
      <p>
        Sistem güncellemesi nedeniyle tekrar giriş yapmanız gerekmektedir.
      </p>
      <input
        type="email"
        required
        placeholder="E-posta"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        style={{
          marginBottom: 9, width: "80%", padding: 8, borderRadius: 5, border: "1px solid #ddd", fontSize: "1rem"
        }}
      />
      <input
        type="password"
        required
        placeholder="Şifre"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        style={{
          marginBottom: 13, width: "80%", padding: 8, borderRadius: 5, border: "1px solid #ddd", fontSize: "1rem"
        }}
      />
      <button className="popup-btn" onClick={() => {
        onLog && onLog({
          type: "credential_stealer",
          questId: null,
          logEventType: "credential_submit",
          value: -5,
          data: { popupType: "novabank", tckn: form.tckn }
        });
        onClick(form);
      }}>
        Giriş Yap
      </button>
    </div>
  );
};


const PopupThrower = () => {
  const { viruses } = useVirusContext();
  const { addNotification } = useNotificationContext();
  const { openWindows, openWindow, setWindowProps, setActiveWindow } = useUIContext();
  const [ openPopups, setOpenPopups ] = useState([]);
  const { addEventLog } = useEventLog();

  const handlePopupLog = ({ type, questId, logEventType, value = 0, data = {} }) => {
    addEventLog({
      type,
      questId,
      logEventType,
      value,
      data: { ...data, time: Date.now() }
    });
  };


  const adwarePopups = [
    { component: AdPopupVPN, url: "https://novasecure.com/vpn-promo" },
    { component: AdPopupPrize, url: "https://novasecure.com/prize" },
    { component: AdPopupCleaner, url: "https://novasecure.com/cleaner" },
    { component: AdPopupCard, url: "https://novasecure.com/card-refund" },
  ];
  const credentialPopups = [
    { component: CredentialStealerPopup },
    { component: ChatAppStealerPopup }
  ];

  const handleBrowserOpen = (url) => {
    if (openWindows.includes("browser")) {
      setWindowProps(prev => ({
        ...prev,
        browser: {
          ...prev.browser,
          initialUrl: prev.browser?.initialUrl || url,
          url // URL'yi de dışarıdan gönderiyoruz
        }
      }));
      setActiveWindow("browser");
    } else {
      openWindow("browser", { initialUrl: url, url });
    }
  };

  const isAdwareActive = viruses.some(v => v.type === "adware");
  const isCredentialActive = viruses.some(v => v.type === "credential-stealer");

  const credStealerTimeoutRef = useRef(null);
   // Adware popup/notification yönetimi
  useEffect(() => {
    if (!isAdwareActive) return;
    let stopped = false;

    function scheduleNextAdware() {
      if (stopped) return;
      const delay = Math.floor(Math.random() * 5000) + 10000;
      setTimeout(() => {
        if (Math.random() < 0.5) {
          // Adware popup
          const { component: Component, url } = adwarePopups[Math.floor(Math.random() * adwarePopups.length)];
          setOpenPopups(prev => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              type: "adware",
              Component,
              url,
              position: {
                top: `${Math.floor(Math.random() * 300) + 50}px`,
                left: `${Math.floor(Math.random() * 600) + 100}px`
              }
            }
          ]);
        } else {
          // Sistem bildirimi
          const notif = fakeNotifications[Math.floor(Math.random() * fakeNotifications.length)];
          addNotification({
            type: notif.type,
            appType: "system",
            title: notif.title,
            message: notif.message,
            icon: notif.icon,
            isPopup: true,
            isTaskbar: false,
            duration: 10000,
            actions: []
          });
        }
        scheduleNextAdware();
      }, delay);
    }
    scheduleNextAdware();
    return () => { stopped = true; };
  }, [isAdwareActive]);


  useEffect(() => {
    if (credStealerTimeoutRef.current) {
      clearTimeout(credStealerTimeoutRef.current);
      credStealerTimeoutRef.current = null;
    }
    if (!isCredentialActive) return;
    const delay = Math.floor(Math.random() * 60000) + 60000;
    credStealerTimeoutRef.current = setTimeout(() => {
      setOpenPopups(prev => {
        // Aynı tip zaten açık mı kontrolü
        const alreadyOpen = prev.some(
          p => credentialPopups.some(cp => p.Component === cp.component)
        );
        if (alreadyOpen) return prev;
        const { component: Component } = credentialPopups[Math.floor(Math.random() * credentialPopups.length)];
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: "credential-stealer",
            Component,
            url: null,
            position: {
              top: `${Math.floor(Math.random() * 200) + 80}px`,
              left: `${Math.floor(Math.random() * 400) + 120}px`
            }
          }
        ];
      });
    }, delay);
    return () => {
      if (credStealerTimeoutRef.current) clearTimeout(credStealerTimeoutRef.current);
    };
  }, [isCredentialActive]);

  const closePopup = (id) => {
    setOpenPopups(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      {openPopups.map(({ id, Component, position, url, type }) => (
        <div
          key={id}
          className="adware-browser-popup"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: "480px",
            height: "320px",
            background: "#fff",
            border: "2px solid #333",
            zIndex: 9999,
            borderRadius: "6px",
            boxShadow: "0 0 20px rgba(0,0,0,0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{
            background: "#222", color: "#fff", padding: "8px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span>
              {type === "adware" ? "Reklam - Sponsorlu İçerik" : "Güvenlik Bildirimi"}
            </span>
            <button onClick={() => closePopup(id)}
              style={{
                background: "#e74c3c", color: "#fff",
                border: "none", padding: "4px 8px", cursor: "pointer"
              }}>
              ×
            </button>
          </div>
          <div style={{ padding: "16px", fontSize: "14px", overflowY: "auto", flexGrow: 1 }}>
            <div className="ad-popup-content">
              <Component
                onClick={() => {
                  if (type === "adware" && url) handleBrowserOpen(url);
                  closePopup(id);
                }}
                onLog={handlePopupLog}
                url={url}
                popupType={type}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PopupThrower;
