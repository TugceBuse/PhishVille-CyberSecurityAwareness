import React, { useState, useEffect } from "react";
import styles from "./ProCareerHub.module.css";
import { useGameContext } from "../../Contexts/GameContext";
import { usePhoneContext } from "../../Contexts/PhoneContext";
import { useQuestManager } from "../../Contexts/QuestManager";
import  {useEventLog } from "../../Contexts/EventLogContext";
import { useMailContext } from "../../Contexts/MailContext";
import { createResetPasswordMail } from "../Mailbox/Mails"; 
import { useTimeContext } from "../../Contexts/TimeContext";


const ProCareerHub = () => {

  const { ProCareerHubInfo, setProCareerHubInfo} = useGameContext();
  const { addEventLog, addEventLogOnChange } = useEventLog();
  const { completeQuest } = useQuestManager();
  const { sendMail } = useMailContext(); 
  const { secondsRef } = useTimeContext();

  const [page, setPage] = useState("login"); // mevcut değerler: login, forgot

  const [isLogin, setIsLogin] = useState(true);
  const { generateCodeMessage, lastCodes, clearCode } = usePhoneContext();
  const [twoFACodeInput, setTwoFACodeInput] = useState("");
  const [is2FAwaiting, setIs2FAwaiting] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  const [password, setPassword] = useState("");
  const isPasswordStrongEnough = (password) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(password);
  };
  const passwordStrong = isPasswordStrongEnough(password);
  const [newPassword, setNewPassword] = useState("");
  const [successPassword, setSuccessPassword] = useState("");

  
  const [codeTimer, setCodeTimer] = useState(120);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lockMessage, setLockMessage] = useState("");

  const email = ProCareerHubInfo.email;

  const handlePasswordReset = () => {
     if (!ProCareerHubInfo.isRegistered || ProCareerHubInfo.email !== email) {
      setPage("login");
      setErrorMessage("Bu e-posta ile kayıtlı bir hesap bulunmamaktadır.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMessage("Lütfen geçerli bir e-posta adresi girin.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }

    const expireAt = (secondsRef?.current || 0) + 60; // 10 dk = 600 sn

    // Mail gönder
    sendMail("resetPassword", {
      from: "procareerhub@support.com",
      title: "Şifre Sıfırlama Talebi",
      precontent: "Şifrenizi sıfırlamak için bu e-postayı inceleyin.",
      content: createResetPasswordMail({
        email,
        site: "procareerhub",
        siteDisplayName: "ProCareerHub",
        from: { id: 1009 },
        expireAt,
      })
    });

    setSuccessMessage("Şifre sıfırlama bağlantısı e-posta kutunuza gönderildi.");
    // 2 saniye sonra otomatik temizle
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
    
    setPage("login");
    
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showAd, setShowAd] = useState(false); // Reklam gösterme kontrolü
  const [showFakeBrowser, setShowFakeBrowser] = useState(false);

  useEffect(() => {
    const adTimer = setTimeout(() => {
      setShowAd(true);
    }, 8000); 
  
    return () => clearTimeout(adTimer);
  }, []);

  // Hata mesajını göster ve 2 saniye sonra temizle
  const showTemporaryError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      showTemporaryError("");
    }, 3000);
  };

  const getLockoutRemainingMinutes = () => {
    if (!ProCareerHubInfo.lockoutUntil) return 0;
    const diff = ProCareerHubInfo.lockoutUntil - Date.now();
    return diff > 0 ? Math.ceil(diff / 60000) : 0;
  };
  
 useEffect(() => {
    if (ProCareerHubInfo.lockoutUntil && Date.now() >= ProCareerHubInfo.lockoutUntil) {
      setProCareerHubInfo(prev => ({ ...prev, lockoutUntil: null, loginAttempts: 0 }));
    }
  }, [ProCareerHubInfo.lockoutUntil]);

    useEffect(() => {
    if (is2FAwaiting && codeTimer > 0) {
      const interval = setInterval(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (codeTimer === 0) {
      setLockMessage("⏱ Kod süresi doldu. Lütfen tekrar giriş yapın.");
      setTimeout(() => {
        setIs2FAwaiting(false);
        setLockMessage("");
        setTwoFACodeInput("");
        setProCareerHubInfo(prev => ({ ...prev, loginAttempts: 0 }));
      }, 2000);
    }
  }, [is2FAwaiting, codeTimer, ProCareerHubInfo]);

  const handle2FACheck = () => {
    if (twoFACodeInput === lastCodes["procareerhub"]) {
      setProCareerHubInfo(prev => ({ ...prev, isLoggedIn: true, loginAttempts: 0 }));
      setIs2FAwaiting(false);
      clearCode("procareerhub");
      setCodeTimer(120);
      setTwoFACodeInput("");
      setLockMessage("");
    } else {
      if (ProCareerHubInfo.loginAttempts >= 2) {
        const unlockAt = Date.now() + 10 * 60 * 1000;
        setProCareerHubInfo(prev => ({ ...prev, lockoutUntil: unlockAt, loginAttempts: 0 }));
        setLockMessage("🚫 Çok fazla deneme yapıldı!");
        setTimeout(() => {
          setIs2FAwaiting(false);
          setLockMessage("");
          clearCode("procareerhub");
          setPassword("");
          setTwoFACodeInput("");
        }, 2000);
      } else {
        setProCareerHubInfo(prev => ({ ...prev, loginAttempts: prev.loginAttempts + 1 }));
        setErrorMessage("⚠ Kod hatalı!");
        setTimeout(() => setErrorMessage(""), 1500);
        setTwoFACodeInput("");
      }
    }
  };

  const handleAuth = () => {
    if (!isLogin) {
      if (ProCareerHubInfo.isRegistered && ProCareerHubInfo.email === email) {
        showTemporaryError("Bu e-posta adresi ile zaten bir hesap oluşturulmuş!");
        return;
      }
      if (!name || !surname || !password) {
        showTemporaryError("Lütfen tüm alanları doldurun!");
        return;
      }
      if (password.length < 4) {
        showTemporaryError("Şifre en az 4 karakter olmalıdır!");
        return;
      }

      setProCareerHubInfo({
        ...ProCareerHubInfo,
        name,
        surname,
        password,
        phone: "05416494438",
        is2FAEnabled: false,
        isRegistered: true,
        isLoggedIn: true,
      });
      addEventLog({
        type: "register_procareerhub",
        questId: "register_career_site",
        logEventType: "register",
        value: passwordStrong ? 0 : -10,
        data: 
        {
          for: "ProCareerHub",
          isStrong: passwordStrong,
        }
      });
        completeQuest("register_career_site");
      showTemporaryError("");
    } else {
      if (!ProCareerHubInfo.isRegistered || ProCareerHubInfo.email !== email) {
        showTemporaryError("Bu e-posta ile kayıtlı bir hesap bulunmamaktadır.");
        return;
      }
      if (!password || password !== ProCareerHubInfo.password) {
        showTemporaryError("Hatalı şifre! Lütfen tekrar deneyin.");
        return;
      }

      if (ProCareerHubInfo.is2FAEnabled) {
        generateCodeMessage("ProCareerHub", "procareerhub");
        setIs2FAwaiting(true);
        setCodeTimer(120);
        return;
      }

      setProCareerHubInfo(prev => ({ ...prev, isLoggedIn: true }));
      addEventLog({
        type: "login_procareerhub",
        questId: "register_career_site",
        logEventType: "login",
        value: -1, 
        data: 
        {
          to: "ProCareerHub",
          password: password,
        }
      });
      showTemporaryError("");
    }
  };


  useEffect(() => {
    return () => {
      // Bileşen kapatıldığında kodu temizle
      clearCode("procareerhub");
    };
  }, []);

  const handleLogout = () => {
    setProCareerHubInfo(prev => ({ ...prev, isLoggedIn: false }));
    addEventLog({
     type: "logout_procareerhub",
     questId: "register_career_site",
     logEventType: "logout",
     value: 0,
     data: { for: "ProCareerHub" }
    });
    setName("");
    setSurname("");
    setPassword("");
    setNewPassword("");
    setSuccessPassword("");
    setShowSettings(false);
    setIsLogin(true);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggle2FA = () => {
    const prevValue = ProCareerHubInfo.is2FAEnabled;
    const newValue = !ProCareerHubInfo.is2FAEnabled;
    setProCareerHubInfo({
      ...ProCareerHubInfo,
      is2FAEnabled: newValue,
    });
    addEventLogOnChange(
      "toggle_2fa",
      "state",
      newValue,
      {
        type: "toggle_2fa",
        questId: "register_career_site",
        logEventType: "2fa",
        value: newValue ? 5 : -5,
        data: {
          for: "ProCareerHub",
          state: newValue,
        }
      }
    );
  };

  const handlePasswordUpdate = () => {
    if (!newPassword) return;
  
    if (newPassword.length < 4) {
        showTemporaryError("Şifre en az 4 karakter olmalıdır!");
        return;
    }

    const passwordStrong = isPasswordStrongEnough(newPassword);

    setProCareerHubInfo({
      ...ProCareerHubInfo,
      password: newPassword,
      isPasswordStrong: passwordStrong,
    });
    addEventLog({
      type: "update_password",
      questId: "register_career_site",
      logEventType: "update",
      value: passwordStrong ? 1 : -1,
      data: 
      {
        for: "ProCareerHub",
        isStrong: passwordStrong,
      }
    });
    console.log(passwordStrong);
    setSuccessPassword("Şifreniz başarıyla güncellendi!");
    setNewPassword("");
  
    setTimeout(() => setSuccessPassword(""), 2000);
  };

  const handleAdClick = () => {
    setShowFakeBrowser(true);
    setShowAd(false);
    addEventLog({
      type: "click_ad_popup",
      questId: "register_career_site",
      logEventType: "click_ad",
      value: -5,
      data: 
      {
        site: "ProCareerHub",
      }
    });
    // 3 saniye sonra sahte siteyi kapat
    setTimeout(() => {
      setShowFakeBrowser(false);
    }, 3000);
  };

  useEffect(() => {
    setName("");
    setSurname("");
    setPassword("");
  }, [isLogin]);

  return (
    <div className={styles.careerContainer}>
      {ProCareerHubInfo.isLoggedIn && (
        <div className={styles.userPanel}>
          <p className={styles.userName}>👤 {ProCareerHubInfo.name}</p>
          <button className={styles.settingsButton} onClick={toggleSettings}>⚙ Ayarlar</button>
          <button className={styles.logoutButton} onClick={handleLogout}>Çıkış Yap</button>
        </div>
      )}

      {/* Reklam Pop-up (2 saniye sonra açılacak) */}
      {showAd && (
        <div className={`${styles.adPopup} ${showAd ? styles.show : ""}`} onClick={handleAdClick}>
          <h2>🚀 Kariyerinde Bir Adım Öne Geç!</h2>
          <p>📢 Yeni iş ilanları, uzmanlık kursları ve networking fırsatları seni bekliyor!</p>
          <ul>
            <li>✔ Ücretsiz CV Analizi</li>
            <li>✔ Günlük Yeni İş Fırsatları</li>
            <li>✔ Profesyonel Kariyer Koçluğu</li>
            <li>✔ Özel Web Seminerlerine Katıl</li>
          </ul>
          <button onClick={(e) => e.stopPropagation() || setShowAd(false)}>Kapat</button>
        </div>
      )}

      {/* Sahte Tarayıcı Penceresi */}
      {showFakeBrowser && (
        <div className={styles.fakeBrowser}>
          <div className={styles.fakeBrowserHeader}>
            <span className={styles.fakeCloseButton} onClick={() => setShowFakeBrowser(false)}>✖</span>
            <span className={styles.fakeUrlBar}>https://job-career-offers.com</span>
          </div>
          <div className={styles.fakeBrowserContent}>
            <h1>⚠ Dikkat!</h1>
            <p>Bilgileriniz izinsiz paylaşılıyor olabilir.</p>
          </div>
        </div>
      )}
      {showSettings && (
        <div className={styles.settingsMenu}>
          <h3>⚙ Kullanıcı Ayarları</h3>
          <p>📧 E-posta: {ProCareerHubInfo.email}</p>
          <p>📷 Profil Fotoğrafı:  <button>Değiştir</button></p>
          <p>📱 Telefon Numarası:</p>
          <input type="text" value={ProCareerHubInfo.phone} disabled/>

          <div>
            <p>🔐 Parola Güncelle:</p>
            <input
              type="password"
              placeholder="Yeni şifrenizi giriniz:"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handlePasswordUpdate}>Güncelle</button>
          </div>
          {successPassword && <p className={styles.successMessage}>{successPassword}</p>}
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <p>📢 Bildirimler: <button>Değiştir</button></p>

          <button className={styles.twoFAButton} onClick={toggle2FA}>{ProCareerHubInfo.is2FAEnabled ? "2FA Kapat" : "2FA Aç"}</button>
        </div>
      )}

      <header className={styles.header}>
        <h1>🚀 ProCareerHub</h1>
        <p>Kariyerini geliştirmek ve iş fırsatlarını yakalamak için doğru yerdesin!</p>
      </header>

      {!ProCareerHubInfo.isLoggedIn && !is2FAwaiting && page !== "forgot" && (
        <div className={styles.authBox}>
          <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>

          {!isLogin && (
            <>
              <input type="text" placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="text" placeholder="Soyad" value={surname} onChange={(e) => setSurname(e.target.value)} />
            </>
          )}

          <input className="disabled-input" type="email" placeholder="E-posta adresiniz" readOnly value={email} />
          <input type="password" placeholder="Şifreniz" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button            
            className={styles.loginRegisterButton}
            onClick={handleAuth}
            disabled={isLogin && ProCareerHubInfo.lockoutUntil && Date.now() < ProCareerHubInfo.lockoutUntil}
          >
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>

          {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
          {ProCareerHubInfo.lockoutUntil && Date.now() < ProCareerHubInfo.lockoutUntil && isLogin && (
            <p className={styles.twoFAError}>
              🚫 Çok fazla deneme yapıldı. <b>{getLockoutRemainingMinutes()}</b> dakika sonra tekrar deneyin.
            </p>
          )}
          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Hesabınız yok mu? Kayıt olun!" : "Zaten üye misiniz? Giriş yapın!"}
          </p>

          {isLogin && (
             <button
              className={styles.forgotPasswordButton}
              type="button"
              onClick={() => setPage("forgot")}
             >
               🔐 Şifremi Unuttum
             </button>
          )}
        </div>
      )}

      {page === "forgot" && (
        <div className={styles.forgotPasswordContainer}>
          <h2 className={styles.forgotTitle}>🔐 Şifremi Unuttum</h2>
          <p className={styles.forgotInfo}>Kayıtlı e-posta adresinizi girin. Size bir şifre sıfırlama bağlantısı gönderilecektir.</p>

          <input className={styles.forgotInput} type="email" placeholder="E-posta adresiniz" readOnly value={email} />

          <div className={styles.forgotButtonGroup}>
            <button className={styles.forgotButton} onClick={handlePasswordReset}>
              Gönder
            </button>
            <button className={styles.forgotBackButton} onClick={() => setPage("login")}>
              Geri Dön
            </button>
          </div>
        </div>
      )}

      {is2FAwaiting && (
        <div className={styles.twoFAInputArea}>
          <p>📲 Telefonunuza gelen doğrulama kodunu girin:</p>
          <input
            type="text"
            placeholder="6 haneli kod"
            value={twoFACodeInput}
            onChange={(e) => setTwoFACodeInput(e.target.value)}
          />
          <p className={styles.timerText}>
            ⏳ Kalan süre: {Math.floor(codeTimer / 60).toString().padStart(2, "0")}
            :{(codeTimer % 60).toString().padStart(2, "0")}
          </p>
          <button onClick={handle2FACheck}>Giriş Yap</button>
          {lockMessage && <span className={styles.twoFAError}>{lockMessage}</span>}
          {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
        </div>
      )}


      {/* İş İlanları Bölümü */}
      <div className={styles.jobListings}>
        <h2>📌 Güncel İş İlanları</h2>
        <ul>
          <li><strong>Yazılım Geliştirici</strong> - ABC Teknoloji | İstanbul | <span className={styles.salary}>75.000₺/yıl</span></li>
          <li><strong>Siber Güvenlik Uzmanı</strong> - XYZ Şirketi | Ankara | <span className={styles.salary}>85.000₺/yıl</span></li>
          <li><strong>Veri Analisti</strong> - DataCorp | İzmir | <span className={styles.salary}>70.000₺/yıl</span></li>
          <li><strong>Proje Yöneticisi</strong> - GlobalSoft | Uzaktan | <span className={styles.salary}>90.000₺/yıl</span></li>
        </ul>
      </div>

      {/* CV Hazırlama Bölümü */}
      <div className={styles.cvTips}>
        <h2>📄 CV Hazırlama Rehberi</h2>
        <ul>
          <li>✔ Kendinizi öne çıkaracak bir <strong>özet yazı</strong> ekleyin.</li>
          <li>✔ Deneyimlerinizi <strong>yıl ve şirket ismi</strong> ile belirtin.</li>
          <li>✔ Teknik becerilerinizi ve sertifikalarınızı açıkça listeleyin.</li>
          <li>✔ <strong>Hata içermeyen, temiz ve profesyonel</strong> bir CV hazırlayın.</li>
        </ul>
      </div>

      {/* Röportaj Teknikleri */}
      <div className={styles.interviewTips}>
        <h2>🎤 Mülakat Başarı Rehberi</h2>
        <p>İş görüşmesine hazırlanırken dikkat etmeniz gereken bazı noktalar:</p>
        <ul>
          <li>👔 <strong>Profesyonel bir kıyafet</strong> tercih edin.</li>
          <li>⏳ Görüşmeye <strong>en az 10 dakika önce</strong> gidin.</li>
          <li>💡 Şirket hakkında önceden <strong>araştırma yapın</strong>.</li>
          <li>🗣️ Kendinizi etkili şekilde <strong>tanıtmayı</strong> öğrenin.</li>
        </ul>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 ProCareerHub | Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default ProCareerHub;