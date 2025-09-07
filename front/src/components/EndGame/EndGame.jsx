import React from "react";
import styles from "./EndGame.module.css";
import { useNavigate } from "react-router-dom";

const EndGame = ({
  title = "Oyun Bitti!",
  description = "Tebrikler, oyunu tamamladınız.",
  score,
  onRestart,
  onClose,
}) => {
  const navigate = useNavigate();

  // Kapat fonksiyonu: prop gelirse onu, gelmezse ana sayfaya yönlendir
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.window}>
        <div className={styles.header}>
          <img src="icons/game-over.png" alt="Game Over Icon" />
          <h2>{title}</h2>
        </div>
        <div className={styles.body}>
          <p>{description}</p>
          {typeof score !== "undefined" && (
            <div className={styles.scoreBox}>
              <span>Puanınız:</span>
              <b>{score}</b>
            </div>
          )}
          Daha fazla bilgi için "Oyun Bilgilerim" sayfasını ziyaret edebilirsiniz.
        </div>
        <div className={styles.footer}>
          <button className={styles.button} onClick={handleClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndGame;
