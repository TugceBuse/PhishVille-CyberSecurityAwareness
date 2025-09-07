import React, { useEffect, useState } from "react";
import { useFileContext } from "../../Contexts/FileContext";
import styles from "./SyncNest.module.css";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";
import { useGameContext } from "../../Contexts/GameContext";

const dummyCommunityFiles = [
  { label: "hobby_photos.zip", type: "zip", size: "6.2 MB", owner: "Anonim" },
  { label: "internship_form.pdf", type: "pdf", size: "342 KB", owner: "Anonim" },
  { label: "shopping-list.xlsx", type: "xlsx", size: "18 KB", owner: "Anonim" }
];

const SyncNest = () => {
  const { constUser } = useGameContext();
  const { files } = useFileContext();
  const { addEventLog } = useEventLog();
  const { failQuest } = useQuestManager();
  const downloadsFiles = Object.values(files).filter(
  f => f.location === "downloads" && ["doc", "pdf", "txt"].includes(f.type) && f.available === true
);

  const [user, setUser] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState([]);
  const [communityFiles, setCommunityFiles] = useState(dummyCommunityFiles);

  // Kayıt ve giriş için dummy state
  const [registerMode, setRegisterMode] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", birth: "", address: "", phone: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      email: constUser.email || "",
      address: constUser.adres || "",
      phone: constUser.phone || "",
    })
  }, [constUser]);

  // Kayıt işlemi
  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.birth || !form.address) return setError("Tüm alanları doldurun.");
    setUser({ ...form });
    setError("");
    addEventLog({
      type: "register_SyncNest",
      questId: "file_backup",
      logEventType: "register",
      value: -20,
      data: {
        for: "SyncNest",
        isFake: true,
        email: form.email,
        birth: form.birth,
        address: form.address,
        phone: form.phone
      }
    });

  };
  // Giriş işlemi
  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ ...form, isLoggedIn: true });
    addEventLog({
      type: "login_SyncNest",
      questId: "file_backup",
      logEventType: "login",
      value: -10, 
      data: 
      {
        to: "SyncNest",
        isFake: true,
        email: form.email
      }
    });
    setError("");
  };
  // Çıkış
  const logout = () => {
    setUser(null);
    setShowUpload(false);
    setUploadProgress(0);
  };

  // Dosya yükle modalı
  const handleShowUpload = () => setShowUpload(true);
  const handleUploadAll = () => {
    setUploadProgress(0);
    let percent = 0;
    const step = Math.max(1, Math.floor(100 / (downloadsFiles.length * 7 + 7)));
    const interval = setInterval(() => {
      percent += step;
      setUploadProgress(percent);
      if (percent >= 100) {
        clearInterval(interval);
        setUploaded(downloadsFiles.map(f => ({ ...f })));
        // Kendi dosyanı community'ye ekle
        setCommunityFiles(prev => [
          ...downloadsFiles.map(f => ({ ...f, owner: user?.email?.split("@")[0] || "Anonim" })),
          ...prev
        ]);
        failQuest("file_backup");
        addEventLog({
          type: "backup",
          questId: "file_backup",
          logEventType: "cloud_backup",
          value: -4* downloadsFiles.length,
          data: {
            site: "SyncNest",
            isFake: true,
            files: downloadsFiles.map(f => ({
              label: f.label,
              size: f.size,
              type: f.type
            })),
            totalFiles: downloadsFiles.length
          }
        });
        setShowUpload(false);
        setUploadProgress(0);
      }
    }, 55);
  };

  // Kayıt/giriş ekranı
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/icons/syncnest-logo.png" alt="SyncNest" className={styles.logo} />
          <span className={styles.title}>SyncNest</span>
        </div>
        <div className={styles.infoBox}>
          <h2>Verinizin Yuvası</h2>
          <p>Dosyalarınız %100 güvenli, hızlı ve kolay yedeklenir.</p>
          <ul>
            <li>Her türlü dosya türünü yedekleyin</li>
            <li>Tüm dosyalarınız “gelişmiş analiz” için işlenir</li>
            <li>Oturumunuzu daha güvenli hale getirmek için cihaz bilgileri kaydedilir</li>
          </ul>
        </div>
        <div className={styles.authBox}>
          <div className={styles.tabs}>
            <span onClick={() => setRegisterMode(false)} className={!registerMode ? styles.active : ""}>Giriş Yap</span>
            <span onClick={() => setRegisterMode(true)} className={registerMode ? styles.active : ""}>Kayıt Ol</span>
          </div>
          <form onSubmit={registerMode ? handleRegister : handleLogin}>
            <input
              type="email"
              required
              placeholder="E-posta"
              value={form.email}
              readOnly
              autoComplete="username"
            />
            <input
              type="password"
              required
              placeholder="Şifre"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete={registerMode ? "new-password" : "current-password"}
            />
            {registerMode && (
              <>
                <input
                  type="date"
                  required
                  placeholder="Doğum Tarihi"
                  value={form.birth}
                  onChange={e => setForm(f => ({ ...f, birth: e.target.value }))}
                />
                <input
                  type="text"
                  required
                  placeholder="Adres"
                  value={form.address}
                  readOnly
                />
                <input
                  type="tel"
                  required
                  placeholder="Telefon"
                  value={form.phone}
                  readOnly
                />
                <div className={styles.checkboxArea}>
                  <input type="checkbox" checked readOnly />
                  <span style={{ opacity: 0.76 }}>Kişisel verilerimin analiz edilmesini kabul ediyorum</span>
                </div>
              </>
            )}
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit">{registerMode ? "Kayıt Ol" : "Giriş Yap"}</button>
          </form>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yaptıysa ana ekran
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/icons/syncnest-logo.png" alt="SyncNest" className={styles.logo} />
        <span className={styles.title}>SyncNest</span>
        <div className={styles.userArea}>
          <span>{user.email}</span>
          <button onClick={logout} className={styles.logoutBtn}>Çıkış</button>
        </div>
      </div>

      <div className={styles.banner}>
        Oturumunuzun güvenliği için cihaz ve yedek bilgileriniz analiz ediliyor.
      </div>

      <div className={styles.section}>
        <h3>Kişisel Dosyalarınızı Yedekleyin</h3>
        <button className={styles.uploadBtn} onClick={handleShowUpload}>Dosya Yükle</button>
        {uploaded.length > 0 && (
          <div className={styles.uploadedList}>
            <h4>Yedeklediğiniz Dosyalar</h4>
            <ul>
              {uploaded.map((f, i) => (
                <div key={i} className={styles.uploadedFile}>
                  <img src={f.icon} alt="Files"/>
                  <li key={i}>{f.label} <span className={styles.size}>{f.size}</span></li>
                </div>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal */}
      {showUpload && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h2>Kişisel Dosyalarım</h2>
            <div className={styles.folderGrid}>
              {downloadsFiles.length === 0 ? (
                <span className={styles.noFile}>Yedeklenecek kişisel dosya yok.</span>
              ) : (
                downloadsFiles.map((f, i) => (
                  <div key={f.label} className={styles.folderFile}>
                    <span className={styles.fileIcon}>
                      <img src={f.icon} alt="Files"/>
                    </span>
                    <span>{f.label} <span className={styles.size}>({f.size})</span></span>
                  </div>
                ))
              )}
            </div>
            {downloadsFiles.length > 0 &&
              <button className={styles.uploadAllBtn} onClick={handleUploadAll}>Hepsini Yedekle</button>
            }
            {uploadProgress > 0 && (
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div className={styles.progress} style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className={styles.progressText}>{uploadProgress}%</span>
              </div>
            )}
            <button className={styles.cancelBtn} onClick={() => setShowUpload(false)} disabled={uploadProgress > 0}>
              Kapat
            </button>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3>Topluluk Yedekleri</h3>
        <div className={styles.communityList}>
          {communityFiles.slice(0, 7).map((f, i) => (
            <div key={i} className={styles.communityFile}>
              <span className={styles.fileIcon}>
                {f.type === "pdf" ? "📄" : f.type === "jpg" ? "🖼️" : f.type === "zip" ? "🗜️" : f.type === "xlsx" ? "📊" : "📁"}
              </span>
              <span>{f.label}</span>
              <span className={styles.size}>{f.size}</span>
              <span className={styles.owner}>{f.owner}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <span>Tüm kullanıcı verileri şirket içi analiz için saklanır ve silinmez.</span>
      </footer>
    </div>
  );
};

export default SyncNest;
