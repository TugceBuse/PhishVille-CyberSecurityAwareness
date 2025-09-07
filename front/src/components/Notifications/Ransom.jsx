import React, { useState, useEffect, useRef } from 'react';
import EndGame from '../EndGame/EndGame'
import './Ransom.css';
import { useNavigate } from 'react-router-dom';

const Ransom = ( { score, saveSession }) => {
  const [timeLeft, setTimeLeft] = useState(72 * 60 * 60);
  const [showContent, setShowContent] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const kayitYapildi = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showContent) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [showContent]);

  useEffect(() => {
    if (showContent) {
      const audio = new Audio('/audio/ransomware.m4a');
      audio.play();
      return () => audio.pause();
    }
  }, [showContent]);

  useEffect(() => {
    if (showContent) {
      const endGameTimeout = setTimeout(() => {
        setShowEndGame(true);
      }, 10000);
      return () => clearTimeout(endGameTimeout);
    }
  }, [showContent]);

  useEffect(() => {
    if (showEndGame && !kayitYapildi.current) {
      kayitYapildi.current = true;
      saveSession().then((result) => {
        if (result === true) {
          // Oyun başarıyla kaydedildi
          console.log("Oyun başarıyla kaydedildi.");
        } else {
          // Oyun kaydedilemedi
          console.error("Oyun kaydedilemedi: " + result);
        }
      }).catch((error) => {
        console.error("Oyun kaydetme hatası:", error);
      });
    }
  }, [showEndGame, saveSession]);

  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 20000) + 10000;
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, randomDelay);

    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  // showContent true olana kadar null döndür
  if (!showContent) return null;
  if (showEndGame)
  return <EndGame
          title="Simülasyon Sonlandı!"
          description="Kritik bir virüs sebebiyle simülasyon sonlandı.!"
          score={score}
          onRestart={() => { navigate("/") }}
          onClose={() => navigate("/") }
        /> 
  return (
    <div className="ransomware-container">
      <div className="ransomware-timer">
        <img src="/icons/timer.png" alt="Timer Icon"/>
        {formatTime(timeLeft)}
      </div>
      <div className="ransomware-timer2">
        <img src="/icons/timer.png" alt="Timer Icon"/>
        {formatTime(timeLeft)}
      </div>
      <h1 className="ransomware-title">Your Computer is Locked!</h1>
      <div className="ransomware-icon">
        <img src="/icons/ransomlocked.png" alt="Lock Icon" />
      </div>
      <p className="ransomware-text">
        Your important files are encrypted! Many of your documents, photos, videos, databases, and other files are no
        longer accessible because they have been encrypted. Maybe you are busy looking for a way to recover your files,
        but do not waste your time. Nobody can recover your files without our decryption service.
      </p>
      <p className="ransomware-subtitle">Can I Recover My Files?</p>
      <p className="ransomware-text">
        Sure. We guarantee that you can recover all your files safely and easily. But you have not so much time. You
        have only 3 days to submit the payment. If you don't pay in 3 days, you
        won't be able to recover your files forever.
      </p>
      <p className="ransomware-subtitle">How Do I Pay?</p>
      <p className="ransomware-text">
        Payment is accepted in Bitcoin only. Please send the correct amount to the address below:
      </p>
      <div className="ransomware-payment">
      <img src="/icons/bitcoin.png" alt="Bitcoin Logo" className="bitcoin-logo" />
        <p>Send 0.5 Bitcoin to:</p>
        <p className="ransomware-wallet">C94x5fg6730kb3X4qx4xd0x</p>
      </div>
      <div className="ransomware-footer">
        <p>
          Once the payment is checked, you can start decrypting your files by getting the Decryption Code.
        </p>
        
      </div>
    </div>
  );
};



 

export default Ransom;
