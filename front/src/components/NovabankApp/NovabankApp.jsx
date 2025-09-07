import React, { useState, useRef, useEffect } from 'react';
import styles from './NovabankApp.module.css';
import { MakeDraggable } from '../../utils/Draggable';
import { useUIContext } from '../../Contexts/UIContext';
import { useGameContext } from '../../Contexts/GameContext';
import { usePhoneContext } from '../../Contexts/PhoneContext';
import { useEventLog } from '../../Contexts/EventLogContext';
import ConnectionOverlay from '../../utils/ConnectionOverlay'; // import path projene göre ayarlanmalı

export const useNovabankApp = () => {
  const { openWindow, closeWindow } = useUIContext();

  const openHandler = () => {
    openWindow('novabankapp');
  };

  const closeHandler = () => {
    closeWindow('novabankapp');
  };

  return { openHandler, closeHandler };
};

const NovabankApp = ({ closeHandler, style }) => {
  const { constUser, BankInfo, setBankInfo, cardBalance, isWificonnected } = useGameContext();
  const { generateCodeMessage, lastCodes, clearCode } = usePhoneContext();
  const { addEventLogOnce } = useEventLog();

  const [is2FAwaiting, setIs2FAwaiting] = useState(false);
  const [twoFACodeInput, setTwoFACodeInput] = useState("");

  const BankAppRef = useRef(null);
  MakeDraggable(BankAppRef, `.${styles.bankHeader}`);

  const [page, setPage] = useState('login');
  const [tcNo, setTcNo] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formatPrice = (price) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2
    }).format(price);
  };

  const [errors, setErrors] = useState({
    tcNo: '',
    password: '',
    login: ''
  });

  const handleLogin = () => {
    if (!isWificonnected) {
      setErrorMessage("İnternet bağlantısı yok.");
      setTimeout(() => setErrorMessage(""), 2000);
      return;
    }
    let newErrors = { tcNo: '', password: '', login: '' };

    if (!tcNo.trim()) {
      newErrors.tcNo = 'TC kimlik numarası zorunludur.';
    }
    if (!password.trim()) {
      newErrors.password = 'Şifre zorunludur.';
    }

    if (tcNo.trim() && password.trim()) {
      if (tcNo === constUser.tcNo && password === constUser.digitalPassword) {
        if (BankInfo.rememberMe) {
          setBankInfo(prev => ({ ...prev, savedTcNo: tcNo }));
        } else {
          setBankInfo(prev => ({ ...prev, savedTcNo: '' }));
        }
        generateCodeMessage("NovaBank", "novabank");
        setIs2FAwaiting(true);
        setErrors({ tcNo: '', password: '', login: '' });
        return;
      } else {
        newErrors.login = 'Giriş bilgileriniz hatalı.';
      }
    }
    setErrors(newErrors);

    setTimeout(() => {
      setErrors({ tcNo: '', password: '', login: '' });
    }, 2000);
  };

  useEffect(() => {
    if (BankInfo.rememberMe && BankInfo.savedTcNo) {
      setTcNo(BankInfo.savedTcNo);
    }
  }, []);

  useEffect(() => {
    return () => clearCode("novabank");
  }, []);

  return (
    <div className={styles.bankWindow} style={style} ref={BankAppRef} data-window="novabankapp">
      <div className={styles.bankHeader}>
        <h2>NovaBank</h2>
        <button className={styles.bankClose} onClick={closeHandler}>×</button>
      </div>
      <ConnectionOverlay isConnected={isWificonnected} top={48}>
        {/* İçerik alanı başlıyor */}
        {page === 'login' && (
          <div className={styles.loginPage}>
            <div className={styles.leftPanel}>
              {!is2FAwaiting ? (
                <>
                  <img src="/novaBank/novaLogo.png" alt="Nova Logo" className={styles.logo} />
                  <h2>NovaBank Şubemize Hoşgeldiniz</h2>

                  <div className={styles.inputGroup}>
                    <label>TC/Müşteri No</label>
                    <input
                      type="text"
                      value={tcNo}
                      maxLength={10}
                      onChange={(e) => setTcNo(e.target.value)}
                      placeholder={errors.tcNo ? "Bu alan zorunludur" : "TC Kimlik Numaranız"}
                      className={errors.tcNo || errors.login ? styles.inputError : ''}
                    />
                    {errors.tcNo && <span className={styles.errorText}>{errors.tcNo}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Dijital Bankacılık Şifresi</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={errors.password ? "Bu alan zorunludur" : "Şifreniz"}
                      className={errors.password || errors.login ? styles.inputError : ''}
                    />
                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                  </div>

                  {errors.login && <div className={styles.errorText}>{errors.login}</div>}
                  {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}

                  <div className={styles.options}>
                    <div className={styles.options}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={BankInfo.rememberMe}
                          onChange={() =>
                            setBankInfo(prev => ({
                              ...prev,
                              rememberMe: !prev.rememberMe
                            }))
                          }
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span className={styles.switchLabel}>Beni Hatırla</span>
                    </div>
                    <button className={styles.forgotPassword}>Şifremi Unuttum</button>
                  </div>

                  <button className={styles.loginButton} onClick={handleLogin}>
                    Giriş Yap
                  </button>
                </>
              ) : (
                <>
                  <h2 className={styles.codeVerificationTitle}>📲 NovaBank Giriş Doğrulama</h2>
                  <p className={styles.codeVerificationText}>
                    Kayıtlı numaranıza gelen 6 haneli doğrulama kodunu giriniz.
                  </p>
                  <input
                    type="text"
                    placeholder="6 haneli kod"
                    value={twoFACodeInput}
                    onChange={(e) => setTwoFACodeInput(e.target.value)}
                    className={styles.codeVerificationInput}
                  />
                  {errorMessage && <div className={styles.codeVerificationError}>{errorMessage}</div>}
                  <button
                    className={styles.codeVerificationButton}
                    onClick={() => {
                      if (twoFACodeInput === lastCodes["novabank"]) {
                        clearCode("novabank");
                        setTwoFACodeInput("");
                        setIs2FAwaiting(false);
                        setPage("dashboard");
                        addEventLogOnce(
                          "login_novabank",
                          "rememberMe",
                          BankInfo.rememberMe,
                          {
                            type: "login_novabank",
                            questId: null,
                            logEventType: "login",
                            value: BankInfo.rememberMe ? -5 : 0,
                            data: {
                              to: "novabank",
                              rememberMe: BankInfo.rememberMe,
                            }
                          }
                        );
                      } else {
                        setErrorMessage("⚠ Kod hatalı!");
                        setTimeout(() => setErrorMessage(""), 2000);
                      }
                    }}
                  >
                    Doğrula ve Giriş Yap
                  </button>
                </>
              )}
            </div>
            <div className={styles.rightPanel}>
              <h3>NovaBank ile Güvendesiniz!</h3>
              <ul>
                <li>7/24 Müşteri Hizmeti</li>
                <li>Gelişmiş Şifreleme Teknolojisi</li>
                <li>Hızlı Para Transferleri</li>
              </ul>
            </div>
          </div>
        )}

        {page === 'dashboard' && (
          <div className={styles.dashboard}>
            <header className={styles.dashboardHeader}>
              <span className={styles.userInfo}>👋 Hoşgeldin, {constUser.fullName}</span>
            </header>

            <section className={styles.accountInfo}>
              <div className={styles.card}>
                <div className={styles.cardBackground}>
                  <h3 className={styles.cardBankName}>NovaBank</h3>
                  <div className={styles.cardNumber}>**** **** **** 1064</div>
                  <div className={styles.cardDetails}>
                    <div>
                      <label>Son Kullanım</label>
                      <p>{constUser.cardExpiryDate}</p>
                    </div>
                    <div>
                      <label>Kart Sahibi</label>
                      <p>{constUser.cardName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardInfo}>
                <h3>IBAN</h3>
                <p>TR12 3456 7890 1234 5678 9012 34</p>
              </div>
              <div className={styles.cardInfo}>
                <h3>Bakiye</h3>
                <p>{formatPrice(cardBalance)}</p>
              </div>
            </section>

            <section className={styles.otherServices}>
              <h3>🚧 Diğer Bankacılık İşlemleri</h3>
              <div className={styles.serviceButtons}>
                <button disabled>💸 Para Transferi</button>
                <button disabled>🧾 Fatura Ödeme</button>
                <button disabled>🏦 Kredi Başvurusu</button>
              </div>
            </section>
          </div>
        )}
        {/* İçerik alanı bitiyor */}
      </ConnectionOverlay>
    </div>
  );
};

export default NovabankApp;
