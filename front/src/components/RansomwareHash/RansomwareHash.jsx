// components/Viruses/RansomwareHash.jsx
import React, { useEffect, useState } from 'react';
import styles from './RansomwareHash.module.css';
import { useFileContext } from '../../Contexts/FileContext';
import { useUIContext } from '../../Contexts/UIContext';
import { useEventLog } from '../../Contexts/EventLogContext';

const RansomwareHash = (style) => {
  const { files, updateFileStatus } = useFileContext();
  const {addEventLog} = useEventLog();
  const [showPopup, setShowPopup] = useState(false);

    function generateRandomHash(length = 12) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let hash = '';
        for (let i = 0; i < length; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash;
    }

    const encryptedFiles = [];
    useEffect(() => {
        // 🔒 Dosyaları şifrele
        Object.keys(files).forEach(fileName => {
        const file = files[fileName];
        if (file.available && !file.locked && !file.quarantined) {
            updateFileStatus(fileName, {
            locked: true,
            infected: true,
            virusType: "ransomwareHash",
            hash: generateRandomHash(12),
            label: `encrypted_${file.label}`
            });
            encryptedFiles.push(fileName);
        }
        });
        addEventLog({
            type: "open_file",
            questId: "save_invoice",
            logEventType: "open_file",
            value: -10,
            data: {
                files: encryptedFiles,                  
            }
        });
        // ⏱ 3 saniye sonra popup göster
        const timeout = setTimeout(() => {
        setShowPopup(true);
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    if (!showPopup) return null;

    return (
        <div className={styles.popupWrapper}>
        <button onClick={() => setShowPopup(false)} className={styles.closeButton}>X</button>
        <h2 className={styles.title}>💀 Dosyalarınız Şifrelendi!</h2>
        <p className={styles.message}>
            Tüm dosyalarınız <span className={styles.highlight}>SHA-256 algoritması</span> ile kilitlendi.<br /><br />
            <b>Geri almak için:</b>
            <ul>
            <li>300₺ değerinde hediye kartı satın alın</li>
            <li>Kodu şu adrese gönderin: <span className={styles.highlight}>decrypt@teehdeppo-pay.com</span></li>
            </ul>
            <div className={styles.example}>📎 Örnek dosya: <i>encrypted_OfisNotları.txt</i></div>
        </p>
        </div>
    );
};

export default RansomwareHash;
