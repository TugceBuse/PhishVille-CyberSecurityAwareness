import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./IntroScreen.module.css";
import { useGameContext } from "../../Contexts/GameContext";

const introMessages = [
  "Simülasyon başlangıcında kurumumuz tarafından sana atanan [MAIL] e-posta adresi ve [PASS] geçici şifresi ile MailBox uygulamasına giriş yapmalısın. Özel wifi ağına bağlantı için ise 'XYZ2025' şifresini kullanabilirsin.",
  "Giriş sonrası, PhishVille ekibinden gelen bir hoş geldin e-postası ile karşılaşacaksın. Sana verilecek olan görevleri ve detaylarını ise mailde bulunan 'TaskApp' uygulamasını indirerek görüntüleyebilirsin. ",
  "Unutma, aldığın kararlar puanına ve güvenlik seviyene etki eder. Hazırsan simülasyonu başlatabilirsin.",
];

const IntroScreen = ({ onFinish }) => {
  const [stage, setStage] = useState("welcome");
  const [msgIdx, setMsgIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const audioRef = useRef(null);
  const { constUser } = useGameContext();

  const tempPassword = constUser.tempPassword;
  const userMail = constUser.email;

  // Welcome ekranında Enter veya Space ile animasyona geç
  useEffect(() => {
    if (stage !== "welcome") return;
    const handleAnyKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        setStage("typewriter");
      }
    };
    window.addEventListener("keydown", handleAnyKey, { once: true });
    return () => window.removeEventListener("keydown", handleAnyKey);
  }, [stage]);

  useEffect(() => {
    if (stage !== "typewriter") return;

    setDisplayed("");
    setTyping(true);
    let idx = 0;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio("/type.wav");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.13;
    audioRef.current.play().catch(()=>{});

    // İlk mesajı (msgIdx === 0) kişiselleştir
    let currentMessage = introMessages[msgIdx];
    if (msgIdx === 0) {
      currentMessage = currentMessage
        .replace("[MAIL]", userMail)
        .replace("[PASS]", tempPassword);
    }

    const interval = setInterval(() => {
      setDisplayed(currentMessage.slice(0, idx + 1));
      idx++;
      if (idx >= currentMessage.length) {
        clearInterval(interval);
        setTyping(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    }, 18);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [msgIdx, stage, userMail, tempPassword]);

  // Tuşla mesaj geçişi (sadece typewriter aşamasında)
  const handleKeyDown = useCallback((e) => {
    if (stage !== "typewriter") return;
    if (typing) {
      setDisplayed(introMessages[msgIdx]);
      setTyping(false);
      return;
    }
    if (msgIdx < introMessages.length - 1 && (e.key === "Enter" || e.key === " ")) {
      setMsgIdx(idx => idx + 1);
    }
  }, [typing, msgIdx, stage]);

  useEffect(() => {
    if (stage !== "typewriter") return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, stage]);

  // Render
  if (stage === "welcome") {
    return (
      <div className={styles.introScreen}>
        <div className={styles.introMessage}>
          <b>SİMÜLASYONA HOŞ GELDİN!</b><br /><br />
          <span style={{fontSize: "1.1rem", opacity: 0.85}}>
            Geçmek için <b>Enter</b> veya <b>Boşluk</b> tuşuna basabilirsin.
          </span>
        </div>
      </div>
    );
  }

  // typewriter fazı:
  return (
    <div className={styles.introScreen}>
        <h2>İPUÇLARI</h2>
      <div className={styles.introMessage}>
        {msgIdx === 0
          ? displayed
          : displayed}
        {typing && <span className={styles.blinkingCursor}>|</span>}
      </div>
      <div style={{ marginTop: 40 }}>
        {(msgIdx < introMessages.length - 1) ? (
          <div className={styles.introTip}>
            <span>Geçmek için <b>Enter</b> veya <b>Boşluk</b> tuşuna basabilirsin.</span>
          </div>
        ) : (
          <button className={styles.introStartBtn} onClick={onFinish}>Simülasyonu Başlat</button>
        )}
      </div>
    </div>
  );
};

export default IntroScreen;
