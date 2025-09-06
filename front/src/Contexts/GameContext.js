import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMailContext } from './MailContext';
import { statusSteps } from '../utils/cargoStatus';
import { useTimeContext } from './TimeContext';
import { useSecurityContext } from './SecurityContext';
import { useQuestManager } from './QuestManager';
import { useAuthContext } from './AuthContext';
import { usePhoneContext } from './PhoneContext';
import { useEventLog } from './EventLogContext';
import { useGameSession } from '../Hooks/useGameSession';
import EndGame from '../components/EndGame/EndGame';
import { useRef } from 'react';

const GameContext = createContext();

export const GameContextProvider = ({ children }) => {
  const { user } = useAuthContext();
  const { seconds, secondsRef, gameStart, getRelativeDate, getDateFromseconds, realStartRef } = useTimeContext();
  const { sendMail, addMailToMailbox, isMailboxLoggedIn, setIsMailboxLoggedIn } = useMailContext();
  const { isPhoneConnected, setIsPhoneConnected } = usePhoneContext();
  const { failQuest } = useQuestManager();
  const { quests, resetQuests } = useQuestManager();
  const { eventLogs, resetEventLogs } = useEventLog();
  const { isWificonnected, setIsWificonnected } = useSecurityContext();
  const { saveGameSession } = useGameSession();

  const [updating_antivirus, setUpdating_antivirus] = useState(false);
  const [cardBalance, setCardBalance] = useState("12345");
  const [cargoTrackingList, setCargoTrackingList] = useState([]);
  const [cargoTrackingSiteVisited, setCargoTrackingSiteVisited] = useState({});
  const [Totalscore , setTotalscore] = useState(0);
  const eventLogsRef = useRef(eventLogs);
  const questsRef = useRef(quests);

  // EndGame ekranı kontrolü için state
  const [showEndGame, setShowEndGame] = useState(false);
  const [endGameProps, setEndGameProps] = useState({
    title: "Oyun Bitti!",
    description: "Tebrikler, oyunu tamamladınız.",
  });

  useEffect(() => {
    eventLogsRef.current = eventLogs;
  }, [eventLogs]);

  useEffect(() => {
    questsRef.current = quests;
  }, [quests]);

  // ▲▲▲ EKLENDİ: React güncellemelerini kesin olarak flush eden yardımcı fonksiyon
  const flushReactUpdates = async () => {
    // micro/macro task kuyruğu ve iki kare/pain sonrası effect'lerin çalıştığından emin ol
    await Promise.resolve();
    await new Promise(r => setTimeout(r, 0));
    await new Promise(r => requestAnimationFrame(() => r()));
    await new Promise(r => requestAnimationFrame(() => r()));
  };

  // Oyun sonlandırıcı global fonksiyon
  const endGame = async ({ title, description } = {}) => {
    if (showEndGame) return; // İkinci kez tetiklenmesin
    setEndGameProps(prev => ({
      ...prev,
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
    }));
    setShowEndGame(true);

    // ▼▼▼ EKLENDİ: Son görev/log güncellemeleri tamamen işlensin
    await flushReactUpdates();

    await saveSession(); // Oyun kaydı (asenkron)
  };

  function generateTempPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  useEffect(() => { console.log("user: ", user); }, [user]);

  const [constUser, setConstUser] = useState({
    email: "hilal.kaya@oriontech.colum",
    phone: "054164944",
    adres: "Atatürk Mahallesi, Gökkuşağı Sokak No:17/3, 34850, Yıldızlı İlçesi, İstanbul",
    tcNo:"5281749362",
    digitalPassword: "123456",
    cardNumber: "5369 4821 3754 1064",
    cardName: 'Tugce Buse',
    cardExpiryDate: '05/26',
    cardCVV: '697',
    firstName: "",
    lastName: "",
    fullName: "",
    tempPassword: generateTempPassword(),
  });

  useEffect(() => {
    if (!user) return;
    setConstUser(prev => ({
      ...prev,
      firstName: user.firstName !== undefined ? user.firstName : prev.firstName,
      lastName: user.lastName !== undefined ? user.lastName : prev.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email !== undefined ? user.email : prev.email,
      username: user.username !== undefined ? user.username : prev.username,
      phone: user.phone !== undefined ? user.phone : prev.phone,
      adres: user.adres !== undefined ? user.adres : prev.adres,
      tcNo: user.tcNo !== undefined ? user.tcNo : prev.tcNo,
      digitalPassword: user.digitalPassword !== undefined ? user.digitalPassword : prev.digitalPassword,
      cardNumber: user.cardNumber !== undefined ? user.cardNumber : prev.cardNumber,
      cardName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : prev.cardName,
      cardExpiryDate: user.cardExpiryDate !== undefined ? user.cardExpiryDate : prev.cardExpiryDate,
      cardCVV: user.cardCVV !== undefined ? user.cardCVV : prev.cardCVV,
    }));
  }, [user]);

  useEffect(() => { console.log("Const User güncellendi:", constUser); }, [constUser]);

  useEffect(() => {
    setProCareerHubInfo(prev => ({
      ...prev,
      email: constUser.email,
      phone: constUser.phone,
      name: constUser.firstName,
      surname: constUser.lastName,
    }));
    setSkillForgeHubInfo(prev => ({
      ...prev,
      email: constUser.email,
      phone: constUser.phone,
      name: constUser.firstName,
      surname: constUser.lastName,
    }));
    setPostifyInfo(prev => ({
      ...prev,
      email: constUser.email,
      phone: constUser.phone,
      name: constUser.firstName,
      surname: constUser.lastName,
    }));
    setTechDepoInfo(prev => ({
      ...prev,
      email: constUser.email,
      phone: constUser.phone,
      name: constUser.firstName,
      surname: constUser.lastName,
      cardNumber: constUser.cardNumber,
      cardName: constUser.cardName,
      cardExpiryDate: constUser.cardExpiryDate,
      cardCVV: constUser.cardCVV,
      adres: constUser.adres,
    }));
    setTechDepoInfoF(prev => ({
      ...prev,
      email: constUser.email,
      phone: constUser.phone,
      name: constUser.firstName,
      surname: constUser.lastName,
      cardNumber: constUser.cardNumber,
      cardName: constUser.cardName,
      cardExpiryDate: constUser.cardExpiryDate,
      cardCVV: constUser.cardCVV,
      adres: constUser.adres,
    }));
    setCloudBoxInfo(prev => ({
      ...prev,
      email: constUser.email,
      name: constUser.firstName,
      surname: constUser.lastName,
    }));
  }, [constUser]);

  useEffect(() => {
    if (parseFloat(cardBalance) < 4979) {
      failQuest("buy_printer");
    }
  }, [cardBalance]);

  const [ProCareerHubInfo, setProCareerHubInfo] = useState({
    name: '',
    surname: '',
    email: constUser.email,
    password: '',
    phone: constUser.phone,
    is2FAEnabled: false,
    isRegistered: false,
    isLoggedIn: false,
    isPasswordStrong: false,
    lockoutUntil: null,
    loginAttempts: 0
  });
  const [SkillForgeHubInfo, setSkillForgeHubInfo] = useState({
    name: '',
    surname: '',
    email: constUser.email,
    password: '',
    phone: constUser.phone,
    is2FAEnabled: false,
    isRegistered: false,
    isLoggedIn: false,
    isPasswordStrong: false,
    lockoutUntil: null,
    loginAttempts: 0
  });
  const [PostifyInfo, setPostifyInfo] = useState({
    name: '',
    surname: '',
    email: constUser.email,
    password: '',
    phone: constUser.phone,
    is2FAEnabled: false,
    isRegistered: false,
    isLoggedIn: false,
    isPasswordStrong: false,
    accountPrivacy: "Herkese Açık",
    privacySettings: "Herkese Açık",
    userPosts: [],
    likedPosts: [],
    lockoutUntil: null,
    loginAttempts: 0
  });

  const [orders, setOrders] = useState([]);
  const [TechDepoInfo, setTechDepoInfo] = useState({
    name: '',
    surname: '',
    email: constUser.email,
    password: '',
    phone: constUser.phone,
    is2FAEnabled: false,
    isRegistered: false,
    isLoggedIn: false,
    isPasswordStrong: false,
    cardNumber: constUser.cardNumber,
    cardName: constUser.cardName,
    cardExpiryDate: constUser.cardExpiryDate,
    cardCVV: constUser.cardCVV,
    saveCard: false,
    is3DChecked: false,
    adres: constUser.adres,
    lockoutUntil: null,
    loginAttempts: 0,
  });

  // Kargo takibi fonksiyonları
  const addCargoTracking = ({ trackingNo, shippingCompany, startSeconds }) => {
    setCargoTrackingList(prev => [
      ...prev,
      {
        trackingNo,
        shippingCompany,
        startSeconds,
        currentStep: 0,
        delivered: false,
      }
    ]);
  };

  const updateCargoStep = (trackingNo, step, statusSteps) => {
    setCargoTrackingList(prev => prev.map(item =>
      item.trackingNo === trackingNo
        ? { ...item, currentStep: step, delivered: step === statusSteps.length - 1 }
        : item
    ));
  };

  const [TechDepoInfoF, setTechDepoInfoF] = useState({
    name: '',
    surname: '',
    email: constUser.email,
    password: '',
    phone: constUser.phone,
    isRegistered: false,
    isLoggedIn: false,
    isPasswordStrong: false,
    cardNumber: constUser.cardNumber,
    cardName: constUser.cardName,
    cardExpiryDate: constUser.cardExpiryDate,
    cardCVV: constUser.cardCVV,
    saveCard: false,
    adres: constUser.adres,
    tckn: "",
    birthDate: "",
    motherMaiden: "",
    acceptedPreApprovedLoan: false,
    acceptedCampaignTerms: false,
    isGuest: null
  });

  const [productInfo, setProductInfo] = useState({
    productIDs: []
  });

  const [BankInfo, setBankInfo] = useState({
    rememberMe: false,
    lockoutUntil: null,
    loginAttempts: 0,
  });
  const [openlitePermissions, setOpenlitePermissions] = useState({
    permissionsOpened: true,
    fileAccess: true,
    printAccess: true,
    annotationAccess: true,
    microphone: true,
    camera: true
  });

  // CloudBox
  const [CloudBoxInfo, setCloudBoxInfo] = useState({
    name: '',
    surname: '',
    email: constUser.email,
    password: '',
    isRegistered: false,
    isLoggedIn: false,
    isPasswordStrong: false,
    lockoutUntil: null,
    loginAttempts: 0
  });
  const [cloudBoxBackup, setCloudBoxBackup] = useState({
    files: [],
    packageLink: "",
    permissions: { isPublic: true, canDownload: true },
  });

  const [openDropPublicFiles, setOpenDropPublicFiles] = useState([
    { label: "YeniÇıkanlar2025.pdf", type: "pdf", size: "2.1 MB", icon: "/icons/pdf.png", url: "https://opendrop.com/file/yenicikanlar2025ab2x" },
    { label: "EtkinlikPosteri.jpg", type: "jpg", size: "1.4 MB", icon: "/icons/gallery.png", url: "https://opendrop.com/file/etkinlikposteri9sd7" }
  ]);

  // --- Kargo takibi için zaman bazlı adım güncelleyici (TimeContext ile) ---
  useEffect(() => {
    setCargoTrackingList(prevList =>
      prevList.map(item => {
        if (item.startSeconds == null) return item;
        let elapsed = seconds - item.startSeconds;
        let total = 0, currentStep = 0;
        for (let i = 0; i < statusSteps.length; i++) {
          total += statusSteps[i].durationSeconds || 0;
          if (elapsed < total) {
            currentStep = i;
            break;
          } else {
            currentStep = i;
          }
        }
        const delivered = (currentStep === statusSteps.length - 1);
        return { ...item, currentStep, delivered };
      })
    );
  }, [seconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (!order.orderPlacedSeconds) return order;
          const elapsed = (secondsRef.current || 0) - order.orderPlacedSeconds;
          let newStatus = order.status || 0;
          if (elapsed >= 60 && order.status < 2) newStatus = 2;
          else if (elapsed >= 15 && order.status < 1) newStatus = 1;
          if (order.status !== newStatus) {
            return { ...order, status: newStatus };
          }
          return order;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRef]);

  useEffect(() => {
    orders.forEach(order => {
      if (
        order.status === 2 &&
        !order.cargoMailSent
      ) {
        sendMail("cargo", {
          mailId: 101,
          name: `${TechDepoInfo.name} ${TechDepoInfo.surname}`,
          productName: order.items.map(item => item.name).join(", "),
          trackingNo: order.trackingNo,
          shippingCompany: order.shipping,
          orderNo: order.id,
          from: "info@" + (order.shipping || "cargo") + ".com",
          title: (order.shipping || "") + " Kargo Takip",
          precontent: `${order.shipping} ile gönderiniz yola çıktı!`,
          isFake: false
        });

        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.id === order.id ? { ...o, cargoMailSent: true } : o
          )
        );

        if (typeof addCargoTracking === "function" && !order.cargoTrackingStarted) {
          addCargoTracking({
            trackingNo: order.trackingNo,
            shippingCompany: order.shipping,
            startSeconds: order.orderPlacedSeconds + 60
          });
          setOrders(prevOrders =>
            prevOrders.map(o =>
              o.id === order.id ? { ...o, cargoTrackingStarted: true } : o
            )
          );
        }
      }
    });
  }, [orders, sendMail, TechDepoInfo, addCargoTracking, setOrders]);

  // Wifi bağlanınca ilk mailleri gönder (kendi fonksiyonunu bozmadan)
  useEffect(() => {
    addMailToMailbox('inbox', 5);
    addMailToMailbox('inbox', 1);
    addMailToMailbox('inbox', 2);
    addMailToMailbox('spam', 31);
    addMailToMailbox('spam', 32);
  }, []);

  // ---------------------------
  // OYUN SONU VERİTABANINA KAYDETME FONKSİYONU
  // ---------------------------
  const saveSession = async () => {
    try {
      // ▼▼▼ EKLENDİ: Her ihtimale karşı burada da flush et
      await flushReactUpdates();

      // 1) Quests'i backend'e uygun şekilde map et
      const latestQuests = questsRef.current || quests;
      const sanitizedQuests = latestQuests.map(q => {
        let completedISO = null;
        if (typeof q.completedAt === "number" && !isNaN(q.completedAt)) {
          // Eğer epoch ms gibi büyükse doğrudan kullan; küçükse gameStart'a relatif say
          const asMs = q.completedAt > 1e12
            ? q.completedAt
            : gameStart.getTime() + q.completedAt;
          completedISO = new Date(asMs).toISOString();
        }
        return {
          questId: q.questId || q.id,
          title: q.title,
          description: q.description,
          status: q.status,
          unlocks: q.unlocks,
          requires: q.requires,
          score: q.point,
          penalty: q.penalty,
          logEventType: q.logEventType,
          completedAt: completedISO,
        };
      });

      // 2) EventLogs'u ISO timestamp ile map et
      const latestLogs = eventLogsRef.current || eventLogs;
      const sanitizedEventLogs = latestLogs.map(log => ({
        ...log,
        timestamp: log.timestampMs
          ? new Date(log.timestampMs).toISOString()
          : new Date().toISOString()
      }));

      // 3) Puan hesapla
      const questPoints = sanitizedQuests.reduce((sum, q) => {
        if (q.status === 'completed') return sum + (q.score || 0);
        if (q.status === 'failed') return sum - (q.penalty || 0);
        return sum;
      }, 0);
      const logPoints = sanitizedEventLogs.reduce((sum, log) => sum + (log.value || 0), 0);
      const totalScore = questPoints + logPoints;
      setTotalscore(totalScore);

      const gameVersion = "1.0.0";
      const deviceInfo = navigator.userAgent;
      await saveGameSession({
        quests: sanitizedQuests,
        eventLogs: sanitizedEventLogs,
        totalScore,
        gameVersion,
        deviceInfo,
        startedAt: realStartRef.current.toISOString(),
      });
      resetQuests();
      resetEventLogs();
      return true;
    } catch (err) {
      return err.message || "Kayıt başarısız.";
    }
  };

  return (
    <GameContext.Provider
      value={{
        seconds,
        secondsRef,
        gameStart,
        getRelativeDate,
        isWificonnected, setIsWificonnected,
        updating_antivirus, setUpdating_antivirus,
        ProCareerHubInfo, setProCareerHubInfo,
        SkillForgeHubInfo, setSkillForgeHubInfo,
        PostifyInfo, setPostifyInfo,
        TechDepoInfo, setTechDepoInfo,
        cargoTrackingList, setCargoTrackingList,
        addCargoTracking,
        updateCargoStep,
        TechDepoInfoF, setTechDepoInfoF,
        orders, setOrders,
        productInfo, setProductInfo,
        constUser,
        BankInfo, setBankInfo,
        openlitePermissions, setOpenlitePermissions,
        CloudBoxInfo, setCloudBoxInfo,
        cloudBoxBackup, setCloudBoxBackup,
        openDropPublicFiles, setOpenDropPublicFiles,
        cardBalance, setCardBalance,
        cargoTrackingSiteVisited, setCargoTrackingSiteVisited,
        isMailboxLoggedIn, setIsMailboxLoggedIn,
        isPhoneConnected, setIsPhoneConnected,
        saveSession,
        Totalscore,
        endGame,          // Global oyun bitirme fonksiyonu
        showEndGame,      // EndGame ekran durumu
        setShowEndGame,   // EndGame ekran kontrol fonksiyonu
      }}
    >
      {children}
      {/* EndGame ekranı merkezi olarak burada açılır */}
      {showEndGame && (
        <EndGame
          title={endGameProps.title}
          description={endGameProps.description}
          score={Totalscore}
        />
      )}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
