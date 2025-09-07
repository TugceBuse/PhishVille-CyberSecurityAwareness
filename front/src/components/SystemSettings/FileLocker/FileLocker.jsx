import React, { useState } from "react";
import styles from "./FileLocker.module.css";
import { useFileContext } from "../../../Contexts/FileContext";
import { useEventLog } from "../../../Contexts/EventLogContext";

const LOCK_ICON = (
  <img src="/FileLocker/locked.png" alt="Locked File" />
);

const FileLocker = ({ onClose }) => {
  const { files, updateFileStatus } = useFileContext();
  // Değişiklik: addEventLog yerine addEventLogOnce fonksiyonu kullanıyoruz
  const { addEventLogOnce } = useEventLog();

  // Şifrelenmiş dosya isimleri
  const lockedFiles = Object.keys(files).filter(
    name => files[name].locked
  );
  // Sadece PDF ve DOCX dosyaları
  const fileList = Object.entries(files)
    .filter(([_, f]) =>
      (f.type === "pdf" || f.type === "docx") && f.available
    );

  const [selected, setSelected] = useState(null);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [lockSuccess, setLockSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // 👁 Şifreyi göster için state

  // Şifre gücü kontrol fonksiyonu
  function checkPasswordStrength(password) {
    if (password.length < 8)
      return "Şifre en az 8 karakter olmalı.";
    if (!/[A-Z]/.test(password))
      return "Şifre en az bir büyük harf içermeli.";
    if (!/[a-z]/.test(password))
      return "Şifre en az bir küçük harf içermeli.";
    if (!/[0-9]/.test(password))
      return "Şifre en az bir rakam içermeli.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password))
      return "Şifre en az bir özel karakter içermeli.";
    return null;
  }

  // Dosyayı şifrele (ilk şifrelemede dosya başına 1 puan)
  const handleLock = () => {
    if (!selected) return;
    const error = checkPasswordStrength(password);
    if (error) {
      setPasswordError(error);
      setTimeout(() => setPasswordError(""), 2000);
      return;
    }
    // Her dosya için sadece 1 kez puan verilecek şekilde logla
    addEventLogOnce(
      "locked_file",   // type
      "file",          // uniqueField
      selected,        // uniqueValue
      {
        type: "locked_file",
        questId: null,
        logEventType: "locked_file",
        value: 1,
        data: { file: selected }
      }
    );
    updateFileStatus(selected, { locked: true, hash: password });
    setLockSuccess(true);
    setTimeout(() => setLockSuccess(false), 1200);
    setPassword("");
    setPasswordError("");
    setShowPassword(false); // Şifre gösterimi otomatik kapanır
  };

  // Kilidi aç (loglanır ama puan vermez)
  const handleUnlock = () => {
    if (!selected) return;
    if (!password) {
      setPasswordError("Lütfen şifrenizi girin.");
      setTimeout(() => setPasswordError(""), 2000);
      return;
    }
    if (files[selected].hash !== password) {
      setPasswordError("Şifre yanlış!");
      setTimeout(() => setPasswordError(""), 2000);
      return;
    }
    updateFileStatus(selected, { locked: false, hash: "" });
    addEventLogOnce(
      "unlocked_file",
      "file",
      selected,
      {
        type: "unlocked_file",
        questId: null,
        logEventType: "unlocked_file",
        value: 0,
        data: { file: selected }
      }
    );
    setUnlockSuccess(true);
    setTimeout(() => setUnlockSuccess(false), 1200);
    setPassword("");
    setPasswordError("");
    setShowPassword(false); // Şifre gösterimi otomatik kapanır
  };

  return (
    <div className={styles.lockerBox}>
      <div className={styles.header}>
        <img src="/FileLocker/secureFile.png" alt="FileLocker" />
        <h2>FileLocker — Dosya Şifreleme</h2>
      </div>
      <div className={styles.info}>
        <p>
          Şifrelemek istediğiniz <b>PDF</b> veya <b>Word (DOCX)</b> dosyasını seçin.<br />
          Seçilen dosya şifrelenerek erişime kapatılır.
        </p>
      </div>
      <div className={styles.fileListArea}>
        {fileList.length === 0 && (
          <div className={styles.noFiles}>Şifrelenebilir dosya bulunamadı.</div>
        )}
        {fileList.length > 0 && (
          <div className={styles.fileList}>
            {fileList.map(([fileName, file]) => (
              <div
                key={fileName}
                className={`${styles.fileItem} ${file.locked ? styles.locked : ""} ${selected === fileName ? styles.selected : ""}`}
                onClick={() => {
                  setSelected(fileName);
                  setPassword("");
                  setPasswordError("");
                  setShowPassword(false);
                }}
                tabIndex={file.locked ? -1 : 0}
                aria-disabled={file.locked}
                title={file.locked ? "Bu dosya zaten şifreli" : "Şifrelemek için seç"}
              >
                <img src={file.icon} alt="icon" className={styles.icon} />
                <span className={styles.fileLabel}>{file.label}</span>
                <span className={styles.fileType}>.{file.type}</span>
                {file.locked && <span className={styles.lockedTag}>{LOCK_ICON} Kilitli</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      {lockSuccess && <span className={styles.successMsg}>Dosya şifrelendi!</span>}
      {unlockSuccess && <span className={styles.successMsg}>Kilit açıldı!</span>}
      {/* Şifre inputu sadece dosya seçilirse çıkar */}
      {selected && (
        <div className={styles.passwordArea}>
          <div className={styles.passwordInputRow}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={files[selected].locked ? "Kilidi açmak için şifre girin" : "Dosyayı kilitlemek için şifre girin"}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              autoFocus
            />
            {/* Şifreyi Göster Toggle */}
            <label className={styles.showPasswordLabel}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(v => !v)}
              />
              <span className={styles.showPasswordText}>Şifreyi Göster</span>
            </label>
          </div>
          {passwordError && <span className={styles.errorMsg}>{passwordError}</span>}
        </div>
      )}
      <div className={styles.actions}>
        {/* Şifrele */}
        <button
          className={styles.lockBtn}
          onClick={handleLock}
          disabled={!selected || (selected && files[selected].locked)}
        >
          {selected && files[selected].locked ? "Zaten Şifreli" : "Dosyayı Şifrele"}
        </button>
        {/* Kilidi aç */}
        {selected && files[selected].locked && (
          <button className={styles.lockBtn} onClick={handleUnlock}>
            Kilidi Aç
          </button>
        )}
      </div>
      <div className={styles.footer}>
        <span>
          🔒 Şifrelenen dosyalar koruma altına alınır ve içeriklerine erişilemez.
        </span>
      </div>
    </div>
  );
};

export default FileLocker;
