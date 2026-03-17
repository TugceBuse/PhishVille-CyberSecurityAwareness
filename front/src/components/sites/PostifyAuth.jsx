import React, { useEffect, useState } from 'react';
import Postify from './Postify';
import styles from './PostifyAuth.module.css';
import { useGameContext } from "../../Contexts/GameContext";
import { usePhoneContext } from "../../Contexts/PhoneContext";
import { useMailContext } from "../../Contexts/MailContext";
import { createResetPasswordMail } from "../Mailbox/Mails"; 
import { useTimeContext } from "../../Contexts/TimeContext";

const PostifyAuth = () => {
  const { PostifyInfo, setPostifyInfo } = useGameContext();
  const { generateCodeMessage, lastCodes, clearCode } = usePhoneContext();
  const { sendMail } = useMailContext(); 
  const { secondsRef } = useTimeContext();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [twoFACodeInput, setTwoFACodeInput] = useState("");
  const [is2FAwaiting, setIs2FAwaiting] = useState(false);
  const [codeTimer, setCodeTimer] = useState(120);
  const [lockMessage, setLockMessage] = useState("");
  const [page, setPage] = useState("login");

  const email = PostifyInfo.email;
  const passwordStrong = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(password);

  const now = Date.now();

  const isLocked = PostifyInfo.lockoutUntil && PostifyInfo.lockoutUntil > now;

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
        setPostifyInfo(prev => ({ ...prev, loginAttempts: 0 }));
        clearCode("postify");
        setCodeTimer(120);
      }, 2000);
    }
  }, [is2FAwaiting, codeTimer]);

  const showTemporaryError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handle2FACheck = () => {
    if (twoFACodeInput === lastCodes["postify"]) {
      setPostifyInfo(prev => ({ ...prev, isLoggedIn: true, loginAttempts: 0 }));
      setIs2FAwaiting(false);
      clearCode("postify");
      setTwoFACodeInput("");
      setCodeTimer(120);
      setLockMessage("");
    } else {
      if (PostifyInfo.loginAttempts >= 2) {
        const unlockAt = Date.now() + 10 * 60 * 1000;
        setPostifyInfo(prev => ({ ...prev, lockoutUntil: unlockAt, loginAttempts: 0 }));
        setLockMessage("🚫 Çok fazla yanlış deneme! 10 dakika bekleyin.");
        setTimeout(() => {
          setIs2FAwaiting(false);
          setLockMessage("");
          clearCode("postify");
          setPassword("");
          setTwoFACodeInput("");
        }, 2000);
      } else {
        setPostifyInfo(prev => ({ ...prev, loginAttempts: prev.loginAttempts + 1 }));
        setErrorMessage("⚠ Kod hatalı!");
        setTwoFACodeInput("");
        setTimeout(() => setErrorMessage(""), 2000);
      }
    }
  };

  const handleAuth = () => {
    if (isLocked) {
      const remaining = Math.ceil((PostifyInfo.lockoutUntil - now) / 60000);
      showTemporaryError(`🚫 Hesap geçici olarak kilitli. ${remaining} dakika sonra tekrar deneyin.`);
      return;
    }

    if (!isLogin) {
      if (PostifyInfo.isRegistered && PostifyInfo.email === email) {
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
      setPostifyInfo({
        ...PostifyInfo,
        name,
        surname,
        password,
        phone: "05416494438",
        is2FAEnabled: false,
        isRegistered: true,
        isLoggedIn: true,
        isPasswordStrong: passwordStrong,
        loginAttempts: 0,
        lockoutUntil: null
      });
      setErrorMessage("");
      setIsLogin(true);
    } else {
      if (!PostifyInfo.isRegistered || PostifyInfo.email !== email) {
        showTemporaryError("Bu e-posta ile kayıtlı bir hesap bulunmamaktadır.");
        return;
      }
      if (!password || password !== PostifyInfo.password) {
        const attempts = PostifyInfo.loginAttempts + 1;
        if (attempts >= 3) {
          const unlockAt = Date.now() + 10 * 60 * 1000;
          setPostifyInfo(prev => ({ ...prev, lockoutUntil: unlockAt, loginAttempts: 0 }));
          showTemporaryError("🚫 Çok fazla yanlış giriş. Hesap 10 dakika kilitlendi.");
        } else {
          setPostifyInfo(prev => ({ ...prev, loginAttempts: attempts }));
          showTemporaryError(`⚠ Hatalı şifre! (${attempts}/3)`);
        }
        return;
      }

      if (PostifyInfo.is2FAEnabled) {
        generateCodeMessage("Postify", "postify");
        setIs2FAwaiting(true);
        return;
      }

      setPostifyInfo(prev => ({ ...prev, isLoggedIn: true, loginAttempts: 0 }));
      setErrorMessage("");
    }
  };

  useEffect(() => {
    return () => {
      clearCode("postify");
    };
  }, []);

  useEffect(() => {
    if (!PostifyInfo.isLoggedIn) {
      setName("");
      setSurname("");
      setPassword("");
      setErrorMessage("");
    }
  }, [PostifyInfo.isLoggedIn]);

  const handleSignInOut = () => {
    setIsLogin(!isLogin);
    setName("");
    setSurname("");
    setPassword("");
    setErrorMessage("");
  };

   const handlePasswordReset = () => {
       if (!PostifyInfo.isRegistered || PostifyInfo.email !== email) {
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
        from: "postify@support.com",
        title: "Şifre Sıfırlama Talebi",
        precontent: "Şifrenizi sıfırlamak için bu e-postayı inceleyin.",
        content: createResetPasswordMail({
          email,
          site: "postify",
          siteDisplayName: "Postify",
          from: { id: 1013 },
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

  if (PostifyInfo.isLoggedIn) return <Postify />;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1><span>🌟</span> Postify <span>🚀</span></h1>
        <p>Arkadaşlarınla paylaşımlarını yap, beğen ve yorum yap!</p>
        <div className={styles.avatars}>
          {[...Array(21)].map((_, i) => (
            <img key={i} src={`/avatars/avatar${i + 1}.png`} alt="avatar" />
          ))}
          {[...Array(15)].map((_, i) => (
            <img key={i} src={`/avatars/avatar${i + 1}.png`} alt="avatar" />
          ))}
        </div>
        <div className={styles.mainPic}>
          <img src="/avatars/postifyAuth3.png" alt="avatar" />
          <img src="/avatars/postifyAuth1.png" alt="avatar" />
          <img src="/avatars/postifyAuth2.png" alt="avatar" />
        </div>
      </div>

      <div className={styles.authRight}>
        {!PostifyInfo.isLoggedIn && !is2FAwaiting && page !== "forgot" && (
          <div className={styles.authBox}>
            <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>
            {!isLogin && <input type="text" placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} />}
            {!isLogin && <input type="text" placeholder="Soyad" value={surname} onChange={(e) => setSurname(e.target.value)} />}
            <input type="email" placeholder="E-posta adresiniz" value={PostifyInfo.email} disabled />
            <input type="password" placeholder="Şifreniz" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleAuth}>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</button>
            {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            <p onClick={handleSignInOut}>{isLogin ? "Hesabınız yok mu? Kayıt olun!" : "Zaten üye misiniz? Giriş yapın!"}</p>
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
          <div className={styles.authBox}>
            <h2>📲 Doğrulama Kodu</h2>
            <p>Telefonunuza gelen 6 haneli kodu girin:</p>
            <input
              type="text"
              placeholder="6 haneli kod"
              value={twoFACodeInput}
              onChange={(e) => setTwoFACodeInput(e.target.value)}
            />
            <p className={styles.timerText}>
              ⏳ Kalan süre: {Math.floor(codeTimer / 60).toString().padStart(2, "0")}:
              {(codeTimer % 60).toString().padStart(2, "0")}
            </p>
            <button onClick={handle2FACheck}>Giriş Yap</button>
            {lockMessage && <span className={styles.errorMessage}>{lockMessage}</span>}
            {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostifyAuth;
