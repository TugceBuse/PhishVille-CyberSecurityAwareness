import React, { useState, useEffect } from "react";
import styles from "./SkillForgeHub.module.css";
import { useGameContext } from "../../Contexts/GameContext";
import { usePhoneContext } from "../../Contexts/PhoneContext";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";
import { useMailContext } from "../../Contexts/MailContext";
import { createResetPasswordMail } from "../Mailbox/Mails"; 
import { useTimeContext } from "../../Contexts/TimeContext";

const SkillForgeHub = () => {
  const { SkillForgeHubInfo, setSkillForgeHubInfo } = useGameContext();
  const { addEventLog, addEventLogOnChange } = useEventLog();
  const { completeQuest } = useQuestManager();
  const { sendMail } = useMailContext(); 
  const { secondsRef } = useTimeContext();

  const { generateCodeMessage, lastCodes, clearCode } = usePhoneContext();

  const [codeTimer, setCodeTimer] = useState(120);

  const [page, setPage] = useState("login"); // mevcut değerler: login, forgot

  const [lockMessage, setLockMessage] = useState("");
  const [is2FAwaiting, setIs2FAwaiting] = useState(false);
  const [twoFACodeInput, setTwoFACodeInput] = useState("");

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successPassword, setSuccessPassword] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isPasswordStrongEnough = (password) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(password);
  const passwordStrong = isPasswordStrongEnough(password);

  const email = SkillForgeHubInfo.email;

  const getLockoutRemainingMinutes = () => {
    if (!SkillForgeHubInfo.lockoutUntil) return 0;
    const diff = SkillForgeHubInfo.lockoutUntil - Date.now();
    return diff > 0 ? Math.ceil(diff / 60000) : 0;
  };

  const showTemporaryError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 2000);
  };

  const handleAuth = () => {
    if (
      SkillForgeHubInfo.lockoutUntil &&
      Date.now() < SkillForgeHubInfo.lockoutUntil
    ) {
      showTemporaryError(
        "🚫 Çok fazla deneme. Lütfen 10 dakika sonra tekrar deneyin."
      );
      return;
    }

    if (!isLogin) {
      if (
        SkillForgeHubInfo.isRegistered &&
        SkillForgeHubInfo.email === email
      ) {
        showTemporaryError(
          "Bu e-posta adresi ile zaten bir hesap oluşturulmuş!"
        );
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

      setSkillForgeHubInfo({
        ...SkillForgeHubInfo,
        name,
        surname,
        password,
        phone: "05416494438",
        is2FAEnabled: false,
        isRegistered: true,
        isLoggedIn: true,
        isPasswordStrong: passwordStrong,
      });

      addEventLog({
        type: "register_skillforgehub",
        questId: "register_career_site",
        logEventType: "register",
        value: passwordStrong ? 5 : -5,
        data: 
        {
          for: "SkillForgeHub",
          isStrong: passwordStrong,
        }
      });
        completeQuest("register_career_site"); 
      setIsLoginOpen(false);
      showTemporaryError("");
    } else {
      if (
        !SkillForgeHubInfo.isRegistered ||
        SkillForgeHubInfo.email !== email
      ) {
        showTemporaryError("Bu e-posta ile kayıtlı bir hesap yok.");
        return;
      }
      if (!password || password !== SkillForgeHubInfo.password) {
        showTemporaryError("Hatalı şifre! Lütfen tekrar deneyin.");
        return;
      }

      if (SkillForgeHubInfo.is2FAEnabled) {
        generateCodeMessage("SkillForgeHub", "skillforgehub");
        setIs2FAwaiting(true);
        setCodeTimer(120);
        setIsLoginOpen(false);
        return;
      }

      setSkillForgeHubInfo({
        ...SkillForgeHubInfo,
        isLoggedIn: true,
      });
      addEventLog({
        type: "login_skillforgehub",
        questId: "register_career_site",
        logEventType: "login",
        value: 0,
        data: 
        {
          to: "SkillForgeHub",
          password: password,
        }
      });
      setIsLoginOpen(false);
    }
  };

  useEffect(() => {
    if (
      SkillForgeHubInfo.lockoutUntil &&
      Date.now() >= SkillForgeHubInfo.lockoutUntil
    ) {
      setSkillForgeHubInfo((prev) => ({
        ...prev,
        lockoutUntil: null,
        loginAttempts: 0,
      }));
    }
  }, [SkillForgeHubInfo.lockoutUntil]);

  useEffect(() => {
    if (is2FAwaiting && codeTimer > 0) {
      const interval = setInterval(() => {
        setCodeTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (codeTimer === 0) {
      setLockMessage("⏱ Kod süresi doldu. Lütfen tekrar giriş yapın.");
      setSkillForgeHubInfo(prev => ({
        ...prev,
        loginAttempts: 0
      }));
      setTimeout(() => {
        setIs2FAwaiting(false);
        setLockMessage("");
        setPassword("");
        setTwoFACodeInput("");
      }, 2000);
    }
  }, [is2FAwaiting, codeTimer]);

  useEffect(() => {
    setName("");
    setSurname("");
    setPassword("");
    setNewPassword("");
    setTwoFACodeInput("");
    showTemporaryError("");
    setLockMessage("");
  }, [isLogin]);

  const handleLogout = () => {
    setSkillForgeHubInfo({
      ...SkillForgeHubInfo,
      isLoggedIn: false,
    });
    addEventLog({
      type: "logout_skillforgehub",
      questId: "register_career_site",
      logEventType: "logout",
      value: 0,
      data: { for: "SkillForgeHub" }
    });
    setName("");
    setSurname("");
    setPassword("");
    setNewPassword("");
    setSuccessPassword("");
    setShowSettings(false);
    setIsLogin(true);
    setPage("login");
  };

  const toggle2FA = () => {
    const prevValue = SkillForgeHubInfo.is2FAEnabled;
    const newValue = !SkillForgeHubInfo.is2FAEnabled;

    setSkillForgeHubInfo({
      ...SkillForgeHubInfo,
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
          for: "SkillForgeHub",
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

      const strong = isPasswordStrongEnough(newPassword);
        setSkillForgeHubInfo({
          ...SkillForgeHubInfo,
          password: newPassword,
          isPasswordStrong: strong,
        });

        addEventLog({
          type: "update_password",
          questId: "register_career_site",
          logEventType: "update",
          value: passwordStrong ? 1 : -1,
          data: 
          {
            for: "SkillForgeHub",
            isStrong: passwordStrong,
          }
        });
        setSuccessPassword("Şifreniz başarıyla güncellendi!");
        setNewPassword("");
        setTimeout(() => setSuccessPassword(""), 2000);
    };

    const handlePasswordReset = () => {
       if (!SkillForgeHubInfo.isRegistered || SkillForgeHubInfo.email !== email) {
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
        from: "skillforgehub@support.com",
        title: "Şifre Sıfırlama Talebi",
        precontent: "Şifrenizi sıfırlamak için bu e-postayı inceleyin.",
        content: createResetPasswordMail({
          email,
          site: "skillforgehub",
          siteDisplayName: "SkillForgeHub",
          from: { id: 1010 },
          expireAt,
        })
      });
  
      setSuccessMessage("Şifre sıfırlama bağlantısı e-posta kutunuza gönderildi.");
      // 2 saniye sonra otomatik temizle
      setTimeout(() => {
        setSuccessMessage("");
        setIsLoginOpen(false); // başarı mesajı gösterildikten sonra kapat
        setIsLogin(true);
        setPage("login"); // geri resetle
      }, 2000);
      
    };

  return (
    <div className={styles.skillPageWrapper}>
      <div className={styles.skillContainer}>
        <header className={styles.header}>
          <h1>🚀 SkillForgeHub</h1>
          <p>Geleceğe hazır olmak için becerilerini geliştir!</p>
        </header>

        {SkillForgeHubInfo.isLoggedIn && (
          <div className={styles.userPanel}>
            <p className={styles.userName}>👤 {SkillForgeHubInfo.name}</p>
            <button
              className={styles.settingsButton}
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙ Ayarlar
            </button>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Çıkış Yap
            </button>
          </div>
        )}

        {showSettings && (
          <div className={`${styles.settingsMenu} ${styles.active}`}>
            <div className={styles.settingsHeader}>
              <h3>⚙ Kullanıcı Ayarları</h3>
              <span
                className={styles.closeIcon}
                onClick={() => setShowSettings(false)}
              >
                ✖
              </span>
            </div>
            <p>📧 E-posta: {SkillForgeHubInfo.email}</p>
            <p>
              📷 Profil Fotoğrafı:{" "}
              <button className={styles.profilePictureButton}>Değiştir</button>
            </p>
            <p>📱 Telefon Numarası:</p>
            <input type="text" value={SkillForgeHubInfo.phone} disabled />

            <div>
              <p>🔐 Parola Güncelle:</p>
              <input
                type="password"
                placeholder="Yeni şifrenizi giriniz:"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {successPassword && (
                <p className={styles.successMessage}>{successPassword}</p>
              )}
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
              <button onClick={handlePasswordUpdate}>Güncelle</button>
              <p>
                📢 Bildirimler: <button>Değiştir</button>
              </p>
            </div>

            <button
              className={styles.twoFAButton}
              onClick={toggle2FA}
            >
              {SkillForgeHubInfo.is2FAEnabled ? "2FA Kapat" : "2FA Aç"}
            </button>
          </div>
        )}

        {!SkillForgeHubInfo.isLoggedIn && (
          <button
            className={styles.loginButton}
            onClick={() => setIsLoginOpen(true)}
          >
            Giriş Yap | Kayıt Ol
          </button>
        )}

        {isLoginOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsLoginOpen(false)}
          ></div>
        )}

        {!SkillForgeHubInfo.isLoggedIn && isLoginOpen && !is2FAwaiting && (
          <div className={`${styles.authBox} ${styles.active}`}>
            {page === "forgot" ? (
              <>
                <h2 className={styles.forgotTitle}>🔐 Şifremi Unuttum</h2>
                <p className={styles.forgotInfo}>
                  Kayıtlı e-posta adresinizi girin. Size bir şifre sıfırlama bağlantısı gönderilecektir.
                </p>

                <input
                  className={styles.forgotInput}
                  type="email"
                  placeholder="E-posta adresiniz"
                  readOnly
                  value={email}
                />
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                <div className={styles.forgotButtonGroup}>
                  <button className={styles.forgotButton} onClick={handlePasswordReset}>
                    Gönder
                  </button>
                  <button className={styles.forgotBackButton} onClick={() => setPage("login")}>
                    Geri Dön
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>

                {!isLogin && (
                  <>
                    <input
                      type="text"
                      placeholder="Ad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Soyad"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                    />
                  </>
                )}

                <input type="email" value={SkillForgeHubInfo.email} disabled />
                <input
                  type="password"
                  placeholder="Şifreniz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleAuth} disabled={isLogin && SkillForgeHubInfo.lockoutUntil && Date.now() < SkillForgeHubInfo.lockoutUntil}>
                  {isLogin ? "Giriş Yap" : "Kayıt Ol"}
                </button>

                {SkillForgeHubInfo.lockoutUntil && Date.now() < SkillForgeHubInfo.lockoutUntil && isLogin && (
                  <p className={styles.twoFAError}>
                    🚫 Çok fazla deneme yapıldı. <b>{getLockoutRemainingMinutes()}</b> dakika sonra tekrar deneyin.
                  </p>
                )}

                {errorMessage && (
                  <span className={styles.errorMessage}>{errorMessage}</span>
                )}

                <p className={styles.authBoxText} onClick={() => setIsLogin(!isLogin)}>
                  {isLogin
                    ? "Hesabınız yok mu? Kayıt olun!"
                    : "Zaten üye misiniz? Giriş yapın!"}
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
              </>
            )}
            <button
              onClick={() => {
                setIsLoginOpen(false);
                setIsLogin(true);
                setPage("login"); // geri resetle
              }}
            >
              Kapat
            </button>
          </div>
        )}


        {!SkillForgeHubInfo.isLoggedIn && is2FAwaiting && (
          <div className={`${styles.authBox} ${styles.active}`}>
            <h2>🔐 2 Adımlı Doğrulama</h2>
            <div className={styles.twoFAInputArea}>
              <p>📲 Telefonunuza gelen doğrulama kodunu girin:</p>
              <input
                type="text"
                placeholder="6 haneli kod"
                value={twoFACodeInput}
                onChange={(e) => setTwoFACodeInput(e.target.value)}
              />
              <p className={styles.timerText}>
                ⏳ Kalan süre: {Math.floor(codeTimer / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(codeTimer % 60).toString().padStart(2, "0")}
              </p>
              <button
                onClick={() => {
                  if (twoFACodeInput === lastCodes["skillforgehub"]) {
                    setSkillForgeHubInfo({
                      ...SkillForgeHubInfo,
                      isLoggedIn: true,
                      loginAttempts: 0,
                    });
                    setIs2FAwaiting(false);
                    clearCode("skillforgehub");
                    setCodeTimer(120);
                    setTwoFACodeInput("");
                    setLockMessage("");
                    setSkillForgeHubInfo(prev => ({
                      ...prev,
                      isLoggedIn: true,
                      loginAttempts: 0
                    }));
                  } else {
                    if (SkillForgeHubInfo.loginAttempts >= 2) {
                      setLockMessage("🚫 Çok fazla deneme yapıldı!");
                      const unlockAt = Date.now() + 10 * 60 * 1000;

                      setSkillForgeHubInfo((prev) => ({
                        ...prev,
                        lockoutUntil: unlockAt,
                        loginAttempts: 0
                      }));

                      setTimeout(() => {
                        setIs2FAwaiting(false);
                        setLockMessage("");
                        setPassword("");
                        clearCode("skillforgehub");
                      }, 1500);
                    } else {
                      setErrorMessage("⚠ Kod hatalı!");
                      setTimeout(() => setErrorMessage(""), 1500);
                      setTwoFACodeInput("");
                      setSkillForgeHubInfo(prev => ({
                        ...prev,
                        loginAttempts: prev.loginAttempts + 1
                      }));
                    }
                  }
                }}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => {
                  setIs2FAwaiting(false);
                  setTwoFACodeInput("");
                  setSkillForgeHubInfo(prev => ({
                    ...prev,
                    loginAttempts: 0
                  }));
                  setCodeTimer(120);
                  setLockMessage("");
                  clearCode("skillforgehub");
                  setPassword("");
                }}
              >
                Kapat
              </button>

              {errorMessage && (
                <span className={styles.errorMessage}>{errorMessage}</span>
              )}
              {lockMessage && (
                <span className={styles.twoFAError}>{lockMessage}</span>
              )}
            </div>
          </div>
        )}

        {/* Sayfa İçeriği */}
        <div className={styles.infoSection}>
          <div className={styles.popularSkills}>
            <h2>🔥 Popüler Beceriler</h2>
            <ul>
              <li>💻 Kodlama & Yapay Zeka</li>
              <li>🎨 UI/UX Tasarımı & Yaratıcılık</li>
              <li>📈 Dijital Pazarlama & SEO</li>
              <li>🚀 Girişimcilik & Ürün Yönetimi</li>
              <li>👔 Liderlik & Takım Yönetimi</li>
            </ul>
          </div>

          <div className={styles.learningTools}>
            <h2>📚 Öğrenme Araçları</h2>
            <p>SkillForgeHub, bilgi edinmeyi daha eğlenceli ve verimli hale getiriyor.</p>
            <ul className={styles.learningList}>
              <li>🎥 Canlı Dersler</li>
              <li>🛠️ Proje Tabanlı Öğrenme</li>
              <li>💡 Simülasyonlar</li>
              <li>🧑‍🏫 Mentor Görüşmeleri</li>
              <li>🏆 Hackathon ve Yarışmalar</li>
            </ul>
            <button className={styles.exploreButton}>Keşfet</button>
          </div>

          <div className={styles.communitySection}>
            <h2>🌍 Topluluğa Katıl</h2>
            <ul className={styles.communityList}>
              <li>💬 Forumlar</li>
              <li>🎤 Canlı Etkinlikler</li>
              <li>📢 Proje Paylaşımları</li>
              <li>🔗 LinkedIn Bağlantıları</li>
            </ul>
            <button className={styles.joinButton}>Topluluğa Katıl</button>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>© 2025 SkillForgeHub | Tüm hakları saklıdır.</p>
        </footer>
      </div>
  </div>
  );
};

export default SkillForgeHub;
