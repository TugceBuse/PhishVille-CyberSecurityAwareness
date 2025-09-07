import React, { useState, useEffect } from "react";
import styles from "./ResetPassword.module.css";
import { useGameContext } from "../../Contexts/GameContext";
import { useTimeContext } from "../../Contexts/TimeContext";

const ResetPassword = ({ siteName = "DefaultSite", onSuccessRedirect }) => {
  const [isExpired, setIsExpired] = useState(false);

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { secondsRef } = useTimeContext();
  const gameContext = useGameContext();

  useEffect(() => {
    try {
      const currentUrl = window.currentBrowserUrl;
      if (!currentUrl || !currentUrl.startsWith("http://reset/")) return;

      // "http://reset/procareerhub?email=...&expire=123"
      const dummyUrl = currentUrl.replace("http://", "http://dummy.");
      const urlObj = new URL(dummyUrl);
      const expireParam = urlObj.searchParams.get("expire");
      const expireAt = Number(expireParam);

      if (expireAt && secondsRef?.current > expireAt) {
        setIsExpired(true);
      }
    } catch (err) {
      console.error("ResetPassword link parsing error:", err);
    }
  }, [secondsRef?.current]);

  useEffect(() => {
    if (successMessage && siteName) {
      const redirectUrl = `https://${siteName.toLowerCase()}.com`;
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open-browser-url", { detail: { url: redirectUrl } })
        );
      }, 3000);
    }
  }, [successMessage, siteName]);

  const handleReset = () => {
  if (password1.length < 4 || password2.length < 4) {
    setErrorMessage("Şifre en az 4 karakter olmalıdır.");
    setSuccessMessage("");
    return;
  }
  if (password1 !== password2) {
    setErrorMessage("Şifreler eşleşmiyor.");
    setSuccessMessage("");
    return;
  }

  const siteKey = siteName?.replace(/\s+/g, "").trim(); // boşluk varsa temizle
  const setterName = `set${siteKey}Info`;
  const setterFn = gameContext?.[setterName];

  if (typeof setterFn === "function") {
    setterFn((prev) => ({
      ...prev,
      password: password1,
    }));
  } else {
    console.warn("Şifre güncelleme başarısız: Setter bulunamadı →", setterName);
  }

  setErrorMessage("");
  setSuccessMessage("✅ Şifreniz başarıyla güncellendi!");
};

  if (isExpired) {
    return (
      <div className={styles.centerWrap}>
        <div className={`${styles.card} ${styles.expiredCard} ${styles.fadeIn}`}>
          <div className={styles.lockBadge}>
            <span className={styles.lockIcon}>⏰</span>
          </div>
          <h2 className={styles.title}>Bağlantı Süresi Doldu</h2>
          <p className={styles.subtitle}>
            Bu şifre sıfırlama bağlantısı artık geçerli değil. Lütfen yeni bir
            şifre sıfırlama talebinde bulunun.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.centerWrap}>
      {/* Arka plan ışıması */}
      <div className={styles.aura} aria-hidden />

      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.lockBadge}>
          <span className={styles.lockIcon}>🔐</span>
        </div>

        <h2 className={styles.title}>
          {siteName} • <span className={styles.thin}>Şifre Yenileme</span>
        </h2>
        <p className={styles.subtitle}>
          Yeni şifrenizi girin ve onaylayın. Güvenliğiniz için güçlü bir şifre
          tercih edin.
        </p>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Yeni Şifre</label>
          <div className={styles.inputRow}>
            <span className={styles.inputIcon} aria-hidden>●●</span>
            <input
              type={showP1 ? "text" : "password"}
              placeholder="Yeni şifre"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowP1((s) => !s)}
              aria-label={showP1 ? "Şifreyi gizle" : "Şifreyi göster"}
              title={showP1 ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showP1 ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Yeni Şifre (tekrar)</label>
          <div className={styles.inputRow}>
            <span className={styles.inputIcon} aria-hidden>●●</span>
            <input
              type={showP2 ? "text" : "password"}
              placeholder="Yeni şifre (tekrar)"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowP2((s) => !s)}
              aria-label={showP2 ? "Şifreyi gizle" : "Şifreyi göster"}
              title={showP2 ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showP2 ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          className={styles.cta}
          disabled={!!successMessage}
        >
          {successMessage ? "Yönlendiriliyor..." : "Şifreyi Güncelle"}
        </button>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && (
          <p className={styles.success}>
            {successMessage} <span className={styles.smallNote}>
              (3 sn içinde yönlendirileceksiniz)
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
