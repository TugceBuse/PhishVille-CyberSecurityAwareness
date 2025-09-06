import React, { useState, useRef, useEffect } from "react";
import { useGameContext } from "../../Contexts/GameContext";
import { useFileContext } from "../../Contexts/FileContext";
import styles from "./CloudBox.module.css";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";
import { useMailContext } from "../../Contexts/MailContext";
import { createResetPasswordMail } from "../Mailbox/Mails"; 
import { useTimeContext } from "../../Contexts/TimeContext";

const generatePackageLink = () =>
  "https://cloudbox.com/package/" + Math.random().toString(36).slice(2, 10);

  const InfoScreen = ({ onLogin, onRegister }) => (
    <div className={styles.infoWrapper}>
      <div className={styles.infoHeader}>
        <img src="/Cloud/cloud-hosting.png" alt="CloudBox" className={styles.siteLogo} />
        <div>
          <h1 className={styles.siteTitle}>CloudBox</h1>
          <div className={styles.siteSubtitle}>Kişisel Bulut Yedekleme Merkezi</div>
        </div>
      </div>
      <div className={styles.infoBody}>
        <div className={styles.infoBox}>
          <b>CloudBox</b> ile önemli dosyalarınızı <b>güvenli ve şifreli</b> şekilde yedekleyin.<br /><br />
          Hesabınıza giriş yaptıktan sonra yüklediğiniz dosyalar <b>yalnızca size ait</b> olarak saklanır.<br />
          <b>Paylaşım linklerinin izin ve gizlilik ayarları tamamen sizin kontrolünüzdedir.</b>
          <ul>
            <li>Dosya ve yedek paketlerinizi <b>tek tıkla</b> paylaşabilirsiniz.</li>
            <li>Bağlantılarınızın <b>gizli veya herkese açık</b> olmasını siz belirlersiniz.</li>
            <li>İzin vermedikçe <b>hiçbir dosya paylaşılmaz</b> veya görüntülenmez.</li>
          </ul>
          <span className={styles.infoHighlight}>
            CloudBox, modern bulut güvenlik standartları ve <b>gizlilik önceliği</b> ile tasarlanmıştır.
          </span>
        </div>
      </div>
      <div className={styles.infoFooter}>
        <button onClick={onLogin} className={styles.loginButton}>Giriş Yap</button>
        <button onClick={onRegister} className={styles.registerButton}>Kayıt Ol</button>
      </div>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} CloudBox - Güvenli Yedekleme</span>
        <span style={{fontSize:12}}>CloudBox Teknolojileri A.Ş. tarafından geliştirilmiştir.</span>
      </footer>
    </div>
  );

const CloudBox = () => {
  const { CloudBoxInfo, setCloudBoxInfo, cloudBoxBackup, setCloudBoxBackup } = useGameContext();
  const { addEventLog } = useEventLog();
  const { files } = useFileContext();
  const { completeQuest } = useQuestManager();
  const { sendMail } = useMailContext(); 
  const { secondsRef } = useTimeContext();

  const backedUpFileLabels = cloudBoxBackup.files.map(file => file.label);
  const downloadsFiles = Object.values(files).filter(
    f => f.location === "downloads" && ["doc", "pdf", "txt", "jpg"].includes(f.type) && f.available &&
    !backedUpFileLabels.includes(f.label)
  );

  // Local UI state
  const [page, setPage] = useState("info"); // "info" / "login" / "register" / "main"
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email] = useState(CloudBoxInfo.email || "");
  const [successMessage, setSuccessMessage] = useState("");

  const [password, setPassword] = useState("");
  const isPasswordStrongEnough = (password) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(password);
  };
  const passwordStrong = isPasswordStrongEnough(password);

  const [error, setError] = useState("");
  const [lockMessage, setLockMessage] = useState("");
  const [codeTimer, setCodeTimer] = useState(120);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadState, setUploadState] = useState({});
  const errorRef = useRef(null);
  const [uploadPermissions, setUploadPermissions] = useState({
    isPublic: false,
    canDownload: true
  });

  useEffect(() => {
    // Eğer paket varsa onun izinlerini göster, yoksa default true olsun
    if (cloudBoxBackup.packageLink) {
      setUploadPermissions({
        isPublic: !!cloudBoxBackup.permissions?.isPublic,
        canDownload: !!cloudBoxBackup.permissions?.canDownload
      });
    } else {
      setUploadPermissions({
        isPublic: true,
        canDownload: true
      });
    }
  }, [cloudBoxBackup.packageLink, cloudBoxBackup.permissions]);

   const showTemporaryError = (msg) => {
      setError(msg);
      if (msg) {
          setTimeout(() => setError(""), 2000);
        }
   };

  useEffect(() => {
    if (!CloudBoxInfo.isLoggedIn) {
      setName("");
      setSurname("");
      setPassword("");
      showTemporaryError("");
    }
  }, [CloudBoxInfo.isLoggedIn]);

  // lockout süresi bittiğinde sıfırla
  useEffect(() => {
    if (CloudBoxInfo.lockoutUntil && Date.now() >= CloudBoxInfo.lockoutUntil) {
      setCloudBoxInfo((prev) => ({
        ...prev,
        lockoutUntil: null,
        loginAttempts: 0,
      }));
    }
  }, [CloudBoxInfo.lockoutUntil, setCloudBoxInfo]);

  const getLockoutRemainingMinutes = () => {
    if (!CloudBoxInfo.lockoutUntil) return 0;
    const diff = CloudBoxInfo.lockoutUntil - Date.now();
    return diff > 0 ? Math.ceil(diff / 60000) : 0;
  };

  

  // login/register işlemleri
  // Kayıt Ol
  const handleRegister = (e) => {
    e.preventDefault();
    if (CloudBoxInfo.isRegistered && CloudBoxInfo.email === email) {
      showTemporaryError("Bu e-posta adresi ile zaten bir hesap var!");
      return;
    }
    if (!name || !surname || !email || !password) {
      showTemporaryError("Lütfen tüm alanları doldurun!");
      return;
    }
    if (email.length < 6 || !email.includes("@")) {
      showTemporaryError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    if (password.length < 4) {
      showTemporaryError("Şifre en az 4 karakter olmalıdır!");
      return;
    }
    
    setCloudBoxInfo({
      name,
      surname,
      email,
      password,
      isRegistered: true,
      isLoggedIn: true,
      isPasswordStrong: true,
      lockoutUntil: null,
      loginAttempts: 0
    });
    addEventLog({
      type: "register_cloudbox",
      questId: "file_backup",
      logEventType: "register",
      value: passwordStrong ? 5 : -5,
      data: 
      {
        for: "CloudBox",
        isStrong: passwordStrong,
      }
    });
    setPage("main");
    showTemporaryError("");
  };


  // Giriş Yap
  const handleLogin = (e) => {
    e.preventDefault();
    if (!CloudBoxInfo.isRegistered || CloudBoxInfo.email !== email) {
      setError("Bu e-posta ile kayıtlı bir hesap yok.");
      return;
    }
    if (!password || password !== CloudBoxInfo.password) {
      // 3 deneme sonrası lockout
      if (CloudBoxInfo.loginAttempts >= 2) {
        const unlockAt = Date.now() + 10 * 60 * 1000; // 10 dk
        setCloudBoxInfo((prev) => ({
          ...prev,
          lockoutUntil: unlockAt,
          loginAttempts: 0,
        }));
        setLockMessage("🚫 Çok fazla giriş denemesi yapıldı.");
        setTimeout(() => {
          setLockMessage("");
          showTemporaryError("");
          setPage("info");
        }, 3000);
      } else {
        setCloudBoxInfo((prev) => ({
          ...prev,
          loginAttempts: prev.loginAttempts + 1,
        }));
        setError("Hatalı şifre!");
        setTimeout(() => setError(""), 2000);
      }
      return;
    }
    setCloudBoxInfo((prev) => ({
      ...prev,
      isLoggedIn: true,
      loginAttempts: 0
    }));
    addEventLog({
      type: "login_cloudbox",
      questId: "file_backup",
      logEventType: "login",
      value: 0,
      data: 
      {
        to: "CloudBox",
        password: password,
      }
    });
    setPage("main");
    showTemporaryError("");
  };

  const onRegister = () => {
    setPage("register");
    showTemporaryError("");
  }
  const onLogin = () => {
    setPage("login");
    showTemporaryError("");
  }
  // Çıkış
  const handleLogout = () => {
    setCloudBoxInfo((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    setName("");
    setSurname("");
    setPassword("");
    setPage("info");
    setUploadState({});
    setShowUpload(false);
  };

  // Yedekleme işlemi (tek paket, progress animasyonlu)
  const handleUploadAll = () => {
    let newUploadState = {};
    downloadsFiles.forEach(file => {
      newUploadState[file.label] = { progress: 0, status: "uploading" };
    });
    setUploadState(newUploadState);

    let progressAll = 0;
    const step = Math.max(2, Math.floor(100 / (downloadsFiles.length * 7 + 6)));
    const interval = setInterval(() => {
      progressAll += step;
      if (progressAll >= 100) {
        clearInterval(interval);
        setCloudBoxBackup({
          files: downloadsFiles,
          packageLink: generatePackageLink(),
          permissions: uploadPermissions
        });
        completeQuest("file_backup");
        addEventLog({
          type: "backup",
          questId: "file_backup",
          logEventType: "cloud_backup",
          value: 10,
          data: {
            site: "CloudBox",
            isFake: false,
            files: downloadsFiles.map(f => f.label),
            fileCount: downloadsFiles.length
          }
        });
        setUploadState({});
        setShowUpload(false);
      } else {
        setUploadState(prev =>
          Object.fromEntries(downloadsFiles.map(f => [
            f.label,
            { progress: Math.min(progressAll, 100), status: "uploading" }
          ]))
        );
      }
    }, 48);
  };

  // İzin toggle işlemleri
  const togglePermission = (perm) => {
    setCloudBoxBackup(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: !prev.permissions[perm]
      }
    }));
  };

   useEffect(() => {
    setName("");
    setSurname("");
    setPassword("");
    setError("");
    setLockMessage("");
  }, [page]);

 // Sayfa arası geçiş
  if (!CloudBoxInfo.isLoggedIn) {
    if (page === "info") {
      return (
          <InfoScreen onLogin={onLogin} onRegister={onRegister} />
      );
    }

    const handlePasswordReset = () => {
      if (!CloudBoxInfo.isRegistered || CloudBoxInfo.email !== email) {
        setPage("login");
        // effect'in temizlemesinden sonra göstermek için next tick
        setTimeout(() => {
          showTemporaryError("Bu e-posta ile kayıtlı bir hesap bulunmamaktadır.");
        }, 0);
        return; 
      }

    if (!email || !email.includes("@")) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      setTimeout(() => setError(""), 2000);
      return;
    }

    const expireAt = (secondsRef?.current || 0) + 60; // 10 dk = 600 sn

    // Mail gönder
    sendMail("resetPassword", {
      from: "cloudbox@support.com",
      title: "Şifre Sıfırlama Talebi",
      precontent: "Şifrenizi sıfırlamak için bu e-postayı inceleyin.",
      content: createResetPasswordMail({
        email,
        site: "cloudbox",
        siteDisplayName: "CloudBox",
        from: { id: 1012 },
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

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/Cloud/cloud-hosting.png" alt="CloudBox" className={styles.logo} />
          <span className={styles.title}>CloudBox</span>
          <span className={styles.slogan}>Kişisel Bulut Yedekleme Merkezi</span>
        </div>
        <div className={styles.authBox}>
          <div className={styles.authTitle}>
            {page !== "forgot" && (page === "login" ? "Giriş Yap" : "Kayıt Ol")}
          </div>
          {page !== "forgot" ? (
            <form onSubmit={page === "login" ? handleLogin : handleRegister}>
              {page === "register" && (
                <>
                  <input
                    type="text"
                    placeholder="Ad"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="given-name"
                  />
                  <input
                    type="text"
                    placeholder="Soyad"
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                    autoComplete="family-name"
                  />
                </>
              )}
              <input
                type="email"
                required
                placeholder="E-posta"
                value={email}
                readOnly
                autoComplete="username"
                disabled={CloudBoxInfo.lockoutUntil && Date.now() < CloudBoxInfo.lockoutUntil}
              />
              <input
                type="password"
                required
                placeholder="Şifre"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={page === "login" ? "current-password" : "new-password"}
                disabled={CloudBoxInfo.lockoutUntil && Date.now() < CloudBoxInfo.lockoutUntil}
              />
              {error && <div ref={errorRef} className={styles.error}>{error}</div>}
              {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
              {CloudBoxInfo.lockoutUntil && Date.now() < CloudBoxInfo.lockoutUntil && page === "login" && (
                <label className={styles.twoFAError}>
                  🚫 Çok fazla giriş denemesi yapıldı. <b>{getLockoutRemainingMinutes()}</b> dakika sonra tekrar deneyin.
                </label>
              )}
              <button
                type="submit"
                className={styles.authBoxButton}
                disabled={CloudBoxInfo.lockoutUntil && Date.now() < CloudBoxInfo.lockoutUntil}
              >
                {page === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
              {lockMessage && <span className={styles.twoFAError}>{lockMessage}</span>}
            </form> 

          ) : (   
            <div className={styles.forgotPasswordContainer}>
              <h2 className={styles.forgotTitle}>🔐 Şifremi Unuttum</h2>
              <p className={styles.forgotInfo}>Kayıtlı e-posta adresinizi girin. Size bir şifre sıfırlama bağlantısı gönderilecektir.</p>
    
              <input className={styles.forgotInput} type="email" placeholder="E-posta adresiniz" readOnly value={email} />
    
              <div className={styles.forgotButtonGroup}>
                <button className={styles.forgotButton} onClick={handlePasswordReset} type="button">
                  Gönder
                </button>
                <button className={styles.forgotBackButton} onClick={() => setPage("login")} type="button">
                  Geri Dön
                </button>
              </div>
            </div>
          )}
       
          <div className={styles.switchMode}>
            {page === "login"
              ? <>Hesabın yok mu? <span onClick={() => setPage("register")}>Kayıt Ol</span></>
              : <>Zaten hesabın var mı? <span onClick={() => setPage("login")}>Giriş Yap</span></>
            }
          </div>

          {page === "login" && (
              <button
              className={styles.forgotPasswordButton}
              type="button"
              onClick={() => setPage("forgot")}
              >
                🔐 Şifremi Unuttum
              </button>
          )}
        </div>
      </div>
    );
  }

  // Ana ekran
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/Cloud/cloud-hosting.png" alt="CloudBox" className={styles.logo} />
        <span className={styles.title}>CloudBox</span>
        <span className={styles.slogan}>Kişisel Bulut Yedekleme Merkezi</span>
        <div className={styles.userArea}>
          <span className={styles.userMail}>{CloudBoxInfo.email}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Çıkış</button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Kişisel Dosyalarını Yedekle</h3>
        <button className={styles.uploadBtn} onClick={() => setShowUpload(true)}>
          Dosya Yükle
        </button>
      </div>

      {/* Modal */}
      {showUpload && (
        <div className={styles.modalOverlay}>
          <div className={styles.uploadModal}>
            <h2>Personal Folder</h2>
            <div className={styles.folderContent}>
              {downloadsFiles.length === 0 ? (
                <span className={styles.noFile}>Yedeklenecek kişisel dosya yok.</span>
              ) : (
                downloadsFiles.map((f, i) => (
                  <div key={f.label} className={styles.folderFile}>
                    <span className={styles.fileIcon}>
                      <img src={f.icon} alt="Files"/>
                    </span>
                    <span>{f.label} ({f.size})</span>
                  </div>
                ))
              )}
            </div>
            {downloadsFiles.length > 0 && (
              <button className={styles.uploadAllBtn} onClick={handleUploadAll}>
                Hepsini Yedekle
              </button>
            )}
            <button className={styles.cancelBtn} onClick={() => setShowUpload(false)}>
              İptal
            </button>
            {downloadsFiles.length > 0 && Object.keys(uploadState).length > 0 && (
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{
                      width: `${uploadState[downloadsFiles[0].label]?.progress ?? 0}%`
                    }}
                  />
                </div>
                <span className={styles.progressText}>
                  {uploadState[downloadsFiles[0].label]?.progress ?? 0}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3>Yedeklenen Dosyalarım</h3>
        <div className={styles.uploadList}>
          {cloudBoxBackup.files.length === 0 ? (
            <span className={styles.noFile}>Henüz dosya yedeklenmedi.</span>
          ) : (
            cloudBoxBackup.files.map((file, idx) => (
              <div key={file.label} className={styles.uploadCard}>
                <div className={styles.uploadFileInfo}>
                  <span className={styles.fileIcon}>
                    <img src={file.icon} alt="Files"/>
                  </span>
                  <span>{file.label} ({file.size})</span>
                </div>
                <div className={styles.uploaded}>✔️ Yüklendi</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Yedek Paketi Linki & İzinler</h3>
        {cloudBoxBackup.packageLink ? (
          <div className={styles.packageLinkBox}>
            <b>Yedek Paketi Linki:</b>
            <span className={styles.fileLink}>{cloudBoxBackup.packageLink}</span>
            <button className={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(cloudBoxBackup.packageLink)}>
              Kopyala
            </button>
            <div className={styles.perms}>
              <label>
                <input
                  type="checkbox"
                  checked={uploadPermissions.isPublic}
                  onChange={() => {
                    const newValue = !uploadPermissions.isPublic;
                    setUploadPermissions(prev => ({
                      ...prev,
                      isPublic: newValue
                    }));
                    if (cloudBoxBackup.packageLink) {
                      setCloudBoxBackup(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          isPublic: newValue
                        }
                      }));
                    }
                  }}
                />
                Herkese Açık
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={uploadPermissions.canDownload}
                  onChange={() => {
                    const newValue = !uploadPermissions.canDownload;
                    setUploadPermissions(prev => ({
                      ...prev,
                      canDownload: newValue
                    }));
                    if (cloudBoxBackup.packageLink) {
                      setCloudBoxBackup(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          canDownload: newValue
                        }
                      }));
                    }
                  }}
                />
                İndirilebilir
              </label>
            </div>
          </div>
        ) : (
          <span className={styles.noFile}>Yedekleme sonrası link oluşturulacaktır.</span>
        )}
      </div>
    </div>
  );
};

export default CloudBox;
