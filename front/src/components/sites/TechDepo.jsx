import React, { useState, useEffect, useRef } from "react";
import styles from "./TechDepo.module.css";
import { useGameContext } from "../../Contexts/GameContext";
import { usePhoneContext } from "../../Contexts/PhoneContext"; 
import { useMailContext } from '../../Contexts/MailContext';
import { useChatContext } from '../../Contexts/ChatContext';
import { statusSteps } from "../../utils/cargoStatus";
import { useTimeContext } from "../../Contexts/TimeContext";
import { useQuestManager } from "../../Contexts/QuestManager";
import { useEventLog } from "../../Contexts/EventLogContext";
import { createResetPasswordMail } from "../Mailbox/Mails"; 
import cardsData from "../../constants/cards";
const cards = cardsData.cards;

const TechDepo = ({scrollRef}) => {
  const { TechDepoInfo, setTechDepoInfo, cardBalance, setCardBalance, orders, setOrders, cargoTrackingList, addCargoTracking, secondsRef } = useGameContext();
  const { gameDate } = useTimeContext();
  const { sendMail } = useMailContext();
  const { completeQuest } = useQuestManager();
  const { addEventLog } = useEventLog();
  const [productInfo, setProductInfo] = useState({
    productIDs: []
  });

  // kodlar için gerekli useState'ler
  const [twoFACodeInput, setTwoFACodeInput] = useState("");
  const [is2FAwaiting, setIs2FAwaiting] = useState(false);
  const [codeTimer, setCodeTimer] = useState(120);
  const [lockMessage, setLockMessage] = useState("");

  const [is3DChecked, setIs3DChecked] = useState(false);
  const [is3DWaiting, setIs3DWaiting] = useState(false);
  const [payment2FACode, setPayment2FACode] = useState("");

  // Context hook
  const { generateCodeMessage, lastCodes, clearCode, addMessage } = usePhoneContext();
  const {addChatMessage, setUserOptions} = useChatContext();

  const [page, setPage] = useState("welcome");
  const [subPage, setSubPage] = useState("orders");

  const [cartItems, setCartItems] = useState([]);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  
  const email = TechDepoInfo.email;

  const [password, setPassword] = useState("");
  const isPasswordStrongEnough = (password) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(password);
  };
  const passwordStrong = isPasswordStrongEnough(password);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const errorRef = useRef(null);

  useEffect(() => {
    if(!TechDepoInfo.isLoggedIn) {
        setName("");
        setSurname("");
        setPassword("");
        showTemporaryError("");
    } 
  }, [TechDepoInfo.isLoggedIn]);

  useEffect(() => {
    scrollRef?.current?.scrollTo?.({ top: 0, behavior: "auto" });
  }, [page, subPage]);


  useEffect(() => {
    setSubPage("orders");
}, [page]);


  // 3D kod kısmı page değişkeni değiştiğinde sıfırlanır
  useEffect(() => {
    if (page !== "payment" && is3DWaiting) {
      setIs3DWaiting(false);
      setPayment2FACode(""); 
    }
  }, [page, is3DWaiting]);

  // 2FA kısıtlama bitimi kod girişimlerini sıfırlar
  useEffect(() => {
    if (TechDepoInfo.lockoutUntil && Date.now() >= TechDepoInfo.lockoutUntil) {
      setTechDepoInfo(prev => ({
        ...prev,
        lockoutUntil: null,
        loginAttempts: 0,
      }));
    }
  }, [TechDepoInfo.lockoutUntil]);

  // 🕐 Kod sayacı
  useEffect(() => {
    if (is2FAwaiting && codeTimer > 0) {
      const interval = setInterval(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (codeTimer === 0) {
      setLockMessage("⏱ Kod süresi doldu. Ana sayfaya yönlendiriliyorsunuz.");
      setTimeout(() => {
        setIs2FAwaiting(false);
        setTwoFACodeInput("");
        setPage("welcome");
        setCodeTimer(120);
        clearCode("techdepo");
        setLockMessage("");
      }, 2500);
    }
  }, [is2FAwaiting, codeTimer]);

  useEffect(() => {
    if (is3DWaiting && codeTimer > 0) {
      const interval = setInterval(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (codeTimer === 0 && is3DWaiting) {
      setLockMessage("⏱ Kod süresi doldu. Ana sayfaya yönlendiriliyorsunuz.");
      setTimeout(() => {
        setCardNumber("");
        setCardName("");
        setExpiryDate("");
        setCVV("");
        setSelectedShipping("");
        setAcceptedTerms(false);
        setSaveCard(false);
        setSelectedShippingPrice(0);
        setCartItems([]);
        setPage("welcome");
        setIs3DChecked(false);
        setIs3DWaiting(false);
        setIsPaying(false);
        setPayment2FACode("");
        setCodeTimer(120);
        setLockMessage("");
        setPage("welcome");
        clearCode("techdepo-payment");
      }, 2500);
    }
  }, [is3DWaiting, codeTimer]);

  // Hata mesajını göster ve 2 saniye sonra temizle
  const showTemporaryError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      showTemporaryError("");
    }, 3000);
  };

  // 2FA kodu gönderme süresi
  const getLockoutRemainingMinutes = () => {
    if (!TechDepoInfo.lockoutUntil) return 0;
    const diff = TechDepoInfo.lockoutUntil - Date.now();
    return diff > 0 ? Math.ceil(diff / 60000) : 0;
  };

  const handleAuth = () => {
  
    if (!isLogin) {
      if (TechDepoInfo.isRegistered && TechDepoInfo.email === email) {
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

      setTechDepoInfo({
        ...TechDepoInfo,
        name,
        surname,
        password,
        phone: "05416494438",
        is2FAEnabled: false,
        isRegistered: true,
        isLoggedIn: true,
        isPasswordStrong: passwordStrong,
      });
      addEventLog({
        type: "register_techdepo",
        questId: "buy_printer",
        logEventType: "register",
        value: passwordStrong ? 5 : -5,
        data: 
        {
          for: "TechDepo",
          isStrong: passwordStrong,
        }
      });
    } else {
      if (!TechDepoInfo.isRegistered || TechDepoInfo.email !== email) {
        showTemporaryError("Bu e-posta ile kayıtlı bir hesap bulunmamaktadır.");
        return;
      }
      if (!password || password !== TechDepoInfo.password) {
        showTemporaryError("Hatalı şifre! Lütfen tekrar deneyin.");
        return;
      }

       if (TechDepoInfo.is2FAEnabled) {
        generateCodeMessage("TechDepo", "techdepo");
        setIs2FAwaiting(true);
        return;
      }

      setTechDepoInfo({
        ...TechDepoInfo,
        isLoggedIn: true,
      });
      addEventLog({
        type: "login_techdepo",
        questId: "buy_printer",
        logEventType: "login",
        value: 0,
        data: 
        {
          to: "TechDepo",
          password: password,
        }
      });
    }
  
    setPage("welcome");
    setCodeTimer(120);
  };
  
  useEffect(() => {
    return () => {
      clearCode("techdepo");
    };
  }, []);

  const handleLogout = () => {
    setTechDepoInfo({
      ...TechDepoInfo,
      isLoggedIn: false,
    });
    setName("");
    setSurname("");
    setPassword("");
    setPage("welcome");
    getCartItemCount(0);
    setCartItems([]);
    setSubPage("orders");
  };

  const handleSignInOut = () => {
    setIsLogin(!isLogin);
    setName("");
    setSurname("");
    setPassword("");
    showTemporaryError("");
  };

  // Sepete ekleme bildirimi ve ödeme bildirimi için state
  const [showCartNotice, setShowCartNotice] = useState(false);
  const [noticeType, setNoticeType] = useState(""); // "" | "cart" | "payment"

  const cartNoticeRef = useRef(null);

  useEffect(() => {
    if (showCartNotice && cartNoticeRef.current) {
      cartNoticeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showCartNotice]);


  // Sepete ekleme bildirimi için fonksiyon
  const addToCart = (product) => {
    if (!product.id) {
      console.error("Ürün ID'si eksik! Eklenemedi:", product);
      return;
    }
  
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
  
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  
    setProductInfo({ productID: product.id });
  
    setNoticeType("cart");
    setShowCartNotice(true);
  
    setTimeout(() => {
      setShowCartNotice(false);
    }, 2000);
  };

  useEffect(() => {
    if (productInfo.productID !== 0) { // Başlangıçta 0 olduğu için gereksiz console spam olmasın diye
      console.log("🛒 Güncellenen Ürün ID:", productInfo.productID);
    }
  }, [productInfo.productID]);
  
  
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };
  

  // Sepetten kaldırmak için fonksiyon
  const removeFromCart = (productId, forceDelete = false) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems
        .map(item => {
          if (item.id === productId) {
            if (forceDelete || item.quantity === 1) {
              return null; // tamamen kaldırılacak
            } else {
              return { ...item, quantity: item.quantity - 1 };
            }
          }
          return item;
        })
        .filter(Boolean); // null olanları at
  
      // 🆕 Eğer artık o ürün kalmadıysa, productInfo'yu sıfırla
      const stillExists = updatedItems.find(item => item.id === productId);
      if (!stillExists) {
        setProductInfo({ productID: 0 });
      }
  
      return updatedItems;
    });
    console.log("Sepetten çıkarılan ürün:", productInfo.productID);
  };  

  const formatPrice = (price) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2
    }).format(price);
  };

  const [selectedShippingPrice, setSelectedShippingPrice] = useState(0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.quantity * parseFloat(item.price), 0);
  const grandTotal = cartTotal + selectedShippingPrice;
  
  const [isPaying, setIsPaying] = useState(false);

  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  // Hata geldikçe scroll o hataya kayar
  useEffect(() => {
    if (page === "payment" && Object.keys(errors).length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errors]);

//   // Order Status Güncelleyici
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setOrders(prevOrders =>
//         prevOrders.map(order => {
//           if (!order.orderPlacedSeconds) return order;
//           const elapsed = (secondsRef.current || 0) - order.orderPlacedSeconds;
//           let newStatus = order.status || 0;
//           if (elapsed >= 60 && order.status < 2) newStatus = 2;
//           else if (elapsed >= 15 && order.status < 1) newStatus = 1;
//           if (order.status !== newStatus) {
//             return { ...order, status: newStatus };
//           }
//           return order;
//         })
//       );
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [setOrders, secondsRef]);


//   // Kargo maili gönderimi ve takibi Order Status Güncelleyici ile entegre
//   useEffect(() => {
//   orders.forEach(order => {
//     // Kargo maili henüz gönderilmemişse VE statü 2'ye geçtiyse gönder
//     if (
//       order.status === 2 &&
//       !order.cargoMailSent
//     ) {
//       sendMail("cargo", {
//         name: `${TechDepoInfo.name} ${TechDepoInfo.surname}`,
//         productName: order.items.map(item => item.name).join(", "),
//         trackingNo: order.trackingNo,
//         shippingCompany: order.shipping,
//         orderNo: order.id,
//         from: "info@" + (order.shipping || "cargo") + ".com",
//         title: (order.shipping || "") + " Kargo Takip",
//         precontent: `${order.shipping} ile gönderiniz yola çıktı!`,
//         isFake: false
//       });

//       // Siparişin cargoMailSent flag'ını güncelle
//       setOrders(prevOrders =>
//         prevOrders.map(o =>
//           o.id === order.id ? { ...o, cargoMailSent: true } : o
//         )
//       );

//       // Kargo takibi başlatıcı (daha önce vardı, yeniden entegre ediyorum)
//       if (typeof addCargoTracking === "function" && !order.cargoTrackingStarted) {
//         addCargoTracking({
//           trackingNo: order.trackingNo,
//           shippingCompany: order.shipping,
//           startSeconds: order.orderPlacedSeconds + 60 // siparişten 1 dk sonra başlat
//         });
//         setOrders(prevOrders =>
//           prevOrders.map(o =>
//             o.id === order.id ? { ...o, cargoTrackingStarted: true } : o
//           )
//         );
//       }
//     }
//   });
// }, [orders, sendMail, TechDepoInfo, addCargoTracking, setOrders]);

  const generateFakeOrderNo = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // I, O gibi karışabilecek harfleri çıkar
    const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
    const randomDigit = () => Math.floor(Math.random() * 10);
    
    // Örnek format: TD9Z4-F73K (rastgele ama düzenli ve anlamlı görünümlü)
    return `TD${randomDigit()}${randomLetter()}${randomDigit()}-${randomLetter()}${randomDigit()}${randomLetter()}${randomLetter()}`;
  };

  const finalizePayment = () => {
    setCodeTimer(120);

    // Yetersiz bakiye kontrolü
    if (cardBalance < grandTotal) {
      setErrors({ balance: "Kart bakiyesi yetersiz." });
      addMessage("NovaBank", "💳 Bakiyeniz yetersiz olduğundan ödemeniz gerçekleştirilemedi.");

      setCardNumber("");
      setCardName("");
      setExpiryDate("");
      setCVV("");
      setSelectedShipping("");
      setAcceptedTerms(false);
      setSaveCard(false);
      setSelectedShippingPrice(0);
      setCartItems([]);
      setIs3DChecked(false);
      setIs3DWaiting(false);
      setIsPaying(false);

      setTimeout(() => setErrors({}), 3000);
      return;
    }

    if (saveCard) {
      setTechDepoInfo(prev => ({
        ...prev,
        cardNumber,
        cardName,
        cardExpiryDate: expiryDate,
        cardCVV: cvv,
        savedCard: true
      }));
    }

    const orderNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const trackingNo = "CN" + Math.floor(100000 + Math.random() * 900000) + "TR";
    const shippingCompany = selectedShipping;
    const orderPlacedSeconds = secondsRef.current || 0;

    // Yeni sipariş status ile eklenir
    const newOrder = {
      id: orderNumber,
      items: cartItems,
      shipping: shippingCompany,
      total: grandTotal,
      date: gameDate.toLocaleTimeString("tr-TR"),
      status: 0, // 0: Sipariş Onaylandı, 1: Hazırlanıyor, 2: Kargoya Verildi, 3: Teslim Edildi
      trackingNo,
      invoiceMailSent: false,
      fakeInvoiceMailSent: false,
      cargoMailSent: false,
      fakeCargoMailSent: false,
      orderPlacedSeconds
    };
        
      // Sipariş anında gecikmeli mail gönderimi
      sendMail("invoice", {
        mailId: 103,
        name: `${TechDepoInfo.name} ${TechDepoInfo.surname}`,
        productName: newOrder.items.map(item => `${item.name} (${item.quantity} adet)`).join(", "),
        invoiceNo: "TD-2025-" + Date.now(),
        orderNo: newOrder.id,
        price: newOrder.total,
        company: "TechDepo",
        tax: (newOrder.total * 0.20).toFixed(2),
        total: newOrder.total,
        from: "faturalar@techdepo.com",
        title: "TechDepo - Satın Alma Faturanız",
        precontent: "Faturanız ektedir.",
        isFake: false,
      }, { delaySeconds: 20 });


     sendMail("invoice", {
      mailId: 104,
      name: `${TechDepoInfo.name} ${TechDepoInfo.surname}`,
      productName: newOrder.items.map(item => `${item.name} (${item.quantity} adet)`).join(", "),
      invoiceNo: "TD-2024-" + Date.now(),
      orderNo: generateFakeOrderNo(),
      price: newOrder.total,
      company: "TechDepo",
      tax: (newOrder.total * 0.20).toFixed(2),
      total: newOrder.total,
      from: "e-fatura@teehdeppo-billing.com",
      title: "E-Arşiv Fatura Belgeniz",
      precontent: "Fatura Bildirimi",
      isFake: true,
      fakeOptions: {
        from: "e-fatura@teehdeppo-billing.com",
        title: "E-Arşiv Fatura Belgeniz",
        fakePdfLink: "http://teehdeppo-billing.com/download/fatura-2025.zip",
        precontent: "Fatura Bildirimi"
      }
    }, { delaySeconds: 45 });

    sendMail("cargo", {
      mailId: 102,
      name: `${TechDepoInfo.name} ${TechDepoInfo.surname}`,
      productName: cards[Math.floor(Math.random() * cards.length)].name + " (1 adet)",
      trackingNo: newOrder.trackingNo,
      shippingCompany: newOrder.shipping,
      orderNo: newOrder.id + "-FNT",
      from: "kargo@cargo-n0va.com",
      title: "Kargo Takip Bilgilendirme",
      precontent: "Kargoya Verildi!",
      isFake: true,
      fakeOptions: {
        from: "kargo@cargo-n0va.com",
        title: "Kargo Takip Bilgilendirme",
        link: "http://cargo-n0va-support.xyz/tracking",
        precontent: "Kargoya Verildi!"
      }
    }, { delaySeconds: 80 });

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setCardBalance(prev => prev - grandTotal);

    // Form resetle
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCVV("");
    setSelectedShipping("");
    setAcceptedTerms(false);
    setSaveCard(false);
    setSelectedShippingPrice(0);
    setCartItems([]);
    setPage("welcome");
    setIs3DChecked(false);
    setIs3DWaiting(false);
    setIsPaying(false);

    setNoticeType("payment");
    setShowCartNotice(true);
    setTimeout(() => setShowCartNotice(false), 2000);

    const boughtPrinter = newOrder.items.some(item => item.id === 15);

    newOrder.items.forEach(item => {
      const boughtPrinter = item.id === 15;

      let value = 0;
      if (boughtPrinter) value += 10;
      if (TechDepoInfo.is3DChecked){
        value += 5; // 3D Secure seçilmişse ekstra puan
      } else {
        value -= 5; // 3D Secure seçilmemişse eksi puan
      }
      if (saveCard) {
        value -= 5; // Kart kaydedilmişse eksi puan
      } else {
        value += 5; // Kart kaydedilmemişse artı puan
      }

      addEventLog({
        type: "payment",
        questId: boughtPrinter ? "buy_printer" : null,
        logEventType: "e-commerce",
        value,
        data: {
          store: "TechDepo",
          isFake: false,
          is3DChecked: TechDepoInfo.is3DChecked,
          isSaveCard: saveCard,
          itemPrice: item.price,
          itemName: item.name,
          itemId: item.id,
        }
      });
    });

    if (boughtPrinter) {
        completeQuest("buy_printer");
        // Yazıcı satın alımı sonrası...
        addChatMessage(1, {
          sender: 'them',
          senderName: "IT Destek",
          text: 'Satın aldığın yazıcının kargo durumunu bizimle paylaşır mısın?',
          time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        }, true);

        // Kargo state seçeneklerini ChatApp’e gönder (hepsi disabled, user kargo sitesine girene kadar!)
        setUserOptions(1,
          statusSteps.map((step, idx) => ({
            id: idx,
            label: `Kargo Durumu: ${step.status}`,
            enabled: false
          }))
        );
      }
    };


  const handlePayment = () => {
    let newErrors = {};
    
    // Kart Bilgileri Kontrolü
    if (!cardNumber) newErrors.cardNumber = "Kart numarası zorunludur.";
    if (!cardName) newErrors.cardName = "Kart üzerindeki isim zorunludur.";
    if (!expiryDate) newErrors.expiryDate = "Son kullanma tarihi zorunludur.";
    if (!cvv) newErrors.cvv = "CVV zorunludur.";

    // Kargo Seçimi Kontrolü, Gizlilik Sözleşmesi Kontrolü
    if (!selectedShipping) newErrors.shipping = "Kargo seçimi zorunludur.";
    if (!acceptedTerms) newErrors.terms = "Gizlilik ve satış sözleşmesini onaylamalısınız.";
  
    // Kayıtlı kartla eşleşme kontrolü
    if (TechDepoInfo) {
      const cardMatches =
        cardNumber === TechDepoInfo.cardNumber &&
        cardName.toLocaleLowerCase("tr-TR") === (TechDepoInfo.cardName || "").toLocaleLowerCase("tr-TR") &&
        expiryDate === TechDepoInfo.cardExpiryDate &&
        cvv === TechDepoInfo.cardCVV;
    
      if (!cardMatches) {
        newErrors.registeredCard = "Kart bilgileri kayıtlı bilgilerle eşleşmiyor.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    
      // 3 saniye sonra hataları sıfırla
      setTimeout(() => {
        setErrors({});
      }, 3000);
    
      // 🆕 Hata oluştuysa errorRef'e scroll yap
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); 
      return; 
    }
    
     // 🔐 3D Secure seçiliyse önce kod gönder ve beklemeye al
    if (is3DChecked && !is3DWaiting) {
      // önce işleniyor yazısı çıksın
      setIsPaying(true);

      setTechDepoInfo(prev => ({
        ...prev,
        is3DChecked: true,
      }));

      setTimeout(() => {
        generateCodeMessage("TechDepo 3D Secure", "techdepo-payment");
        setIs3DWaiting(true);
        setIsPaying(false); // istenirse kaldırılabilir (butonu tekrar aktif yapar)
      }, 1000); // 1 saniye sonra 3D aşamasına geç
      return;
    }

    // Hatalar yoksa işlemi başlat
    setErrors({});
    setIsPaying(true);

    setTimeout(() => {
      finalizePayment();
    }, 2000);
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    return "**** **** **** " + cardNumber.slice(-4);
  };


  const handleLogin2FACheck = () => {
    if (twoFACodeInput === lastCodes["techdepo"]) {
      setTechDepoInfo(prev => ({ ...prev, isLoggedIn: true, loginAttempts: 0 }));
      setIs2FAwaiting(false);
      clearCode("techdepo");
      setCodeTimer(120);
      setTwoFACodeInput("");
      setLockMessage("");
      setPage("welcome");
    } else {
      if (TechDepoInfo.loginAttempts >= 2) {
        const unlockAt = Date.now() + 10 * 60 * 1000;
        setTechDepoInfo(prev => ({ ...prev, lockoutUntil: unlockAt, loginAttempts: 0 }));
        setLockMessage("🚫 Çok fazla giriş denemesi yapıldı.");
        setTimeout(() => {
          setIs2FAwaiting(false);
          setTwoFACodeInput("");
          setPage("welcome");
          setCodeTimer(120);
          setLockMessage("");
          clearCode("techdepo");
        }, 2500);
      } else {
        setTechDepoInfo(prev => ({ ...prev, loginAttempts: prev.loginAttempts + 1 }));
        setErrorMessage("⚠ Kod hatalı!");
        setTimeout(() => setErrorMessage(""), 2000);
        setTwoFACodeInput("");
      }
    }
  };

  const handlePayment2FACheck = () => {

    if (payment2FACode === lastCodes["techdepo-payment"]) {
      clearCode("techdepo-payment");
      setIs3DWaiting(false);
      setPayment2FACode("");
      setTechDepoInfo(prev => ({ ...prev, loginAttempts: 0 }));
      handlePayment(); // Doğruysa ödeme tamamlanır
    } else {
      if (TechDepoInfo.loginAttempts >= 2) {
        setTechDepoInfo(prev => ({ ...prev, loginAttempts: 0 }));
        setLockMessage("🚫 Çok fazla giriş denemesi yapıldı.");
        setTimeout(() => {
          setCardNumber("");
          setCardName("");
          setExpiryDate("");
          setCVV("");
          setSelectedShipping("");
          setAcceptedTerms(false);
          setSaveCard(false);
          setSelectedShippingPrice(0);
          setCartItems([]);
          setIs3DChecked(false);
          setIsPaying(false);
          setIs3DWaiting(false);
          setPayment2FACode("");
          setCodeTimer(120);
          setLockMessage("");
          clearCode("techdepo-payment");
          setPage("welcome");
        }, 2500);
      } else {
        setTechDepoInfo(prev => ({ ...prev, loginAttempts: prev.loginAttempts + 1 }));
        setErrorMessage("⚠ Kod hatalı!");
        setTimeout(() => setErrorMessage(""), 2000);
        setPayment2FACode("");
      }
    }
  };

  const handlePasswordReset = () => {
    if (!TechDepoInfo.isRegistered || TechDepoInfo.email !== email) {
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
    from: "techdepo@support.com",
    title: "Şifre Sıfırlama Talebi",
    precontent: "Şifrenizi sıfırlamak için bu e-postayı inceleyin.",
    content: createResetPasswordMail({
      email,
      site: "techdepo",
      siteDisplayName: "TechDepo",
      from: { id: 1011 },
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

  const formatExpiryDate = (value) => {
  // Sadece rakamları al
  let cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
};

  const handleEdit = () => {
    setTechDepoInfo({
      ...TechDepoInfo,
      name: editableName,
      surname: editableSurname,
    });
  
    setInfoUpdated(true);
  
    setTimeout(() => {
      setInfoUpdated(false);
    }, 3000); 
  };


   const [showUserMenu, setShowUserMenu] = useState(false);
   const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

   // Kullanıcı bilgilerini düzenlemek için state'ler
   const [editableName, setEditableName] = useState(TechDepoInfo.name);
   const [editableSurname, setEditableSurname] = useState(TechDepoInfo.surname);

   useEffect(() => {
     setEditableName(TechDepoInfo.name);
     setEditableSurname(TechDepoInfo.surname);
   }, [TechDepoInfo.name, TechDepoInfo.surname]);

   const [infoUpdated, setInfoUpdated] = useState(false); // ✔ güncellendi bildirimi
   const isChanged =
   editableName !== TechDepoInfo.name ||
   editableSurname !== TechDepoInfo.surname;


   // User menu dışına tıklanıldığında menüyü kapat
   // useRef ile referans alıyoruz
   const userMenuRef = useRef(null);
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Kargo teslimat durumunu kontrol et ve güncelle
  useEffect(() => {
    orders.forEach(order => {
      const cargo = cargoTrackingList.find(
        c => c.trackingNo === order.trackingNo
      );
      if (cargo && cargo.delivered && order.status < 3) {
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id ? { ...o, status: 3 } : o
          )
        );
      }
    });
  }, [cargoTrackingList, orders, setOrders]);


  // Doldurulması zorunlu olan alanlar için gerekli state'ler
  const [selectedShipping, setSelectedShipping] = useState("");

  const [cardNumber, setCardNumber] = useState("");

  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCVV] = useState("");


  return (
    <div className={styles.container}>

      {/* Sepete ürün eklendi bildirimi */}
      {showCartNotice && (
        <div className={styles.cartNotice}  ref={cartNoticeRef}>
          {noticeType === "payment" ? "✅ Ödemeniz başarıyla gerçekleştirildi!" : "✅ Sepetiniz başarıyla güncellendi!"}
        </div>
      )}
      
      {/* TechDepo navbar */}
      <div className={styles.header}>
            <div className={styles.logoContainer} 
              onClick={() => {
                setPage("welcome");
                setIs2FAwaiting(false); 
              }}>
              <img src="/techDepo/techHome.png" alt="TechDepo Logo" className={styles.logo} />
              <h1>TechDepo</h1>
              <h4>Teknoloji Deposu</h4>
            </div>

            <div className={styles.navbarRight}>
              <div className={styles.addToCart} 
                onClick={() => {
                  if (!is2FAwaiting) {
                    setPage("cart");
                  }
                }}>
                <img src="/techDepo/add-to-cart (1).png" alt="Sepete Ekle" />
                <h4> Sepetim</h4>
                {getCartItemCount() > 0 && (
                  <span className={styles.cartCounter}>{getCartItemCount()}</span>
                )}
              </div>
              {TechDepoInfo.isLoggedIn ? (
                <div className={styles.userPanel}   onClick={toggleUserMenu}>
                  
                  <p className={styles.userName}><img src={"/techDepo/programmer.png"} alt="user"/> {TechDepoInfo.name} {TechDepoInfo.surname}</p>
                  {showUserMenu &&
                    <div className={styles.userActions} ref={userMenuRef}>
                    <button className={styles.settingsButton}  onClick={() => setPage("userProfile")}> Kullanıcı Bilgilerim</button>
                    <button className={styles.logoutButton} onClick={handleLogout}>Çıkış Yap</button>
                  </div>
                  }
                </div>
              ) : (
                !is2FAwaiting && ( // 🔒 2FA aktifse giriş yap butonunu gizle
                  <button
                    className={styles.loginButton}
                    onClick={() => {
                      setIsLogin(true);
                      setPage("login");
                      setPassword("");

                    }}
                  >
                    Giriş Yap
                  </button>
                )
              )}
            </div>
      </div>

      {page === "cart" && (
        <div className={styles.cartPage}>
          <h2>Sepetim</h2>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Henüz sepetinize bir ekleme yapmadınız.</p>
              <img src={"techDepo/empty-cart.png"} alt="Sepet" />
            </div> 
          ) : (
            <div className={styles.cartList}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p className={styles.itemTotal}>
                      Toplam: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className={styles.quantityControls}>
                    <button onClick={() => removeFromCart(item.id)} disabled={item.quantity === 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                  
                  <button className={styles.removeItem} onClick={() => removeFromCart(item.id, true)}>Kaldır</button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.cartSummary}>
            <p>
              Sepet Toplamı: {
                formatPrice(cartItems.reduce((total, item) => {
                  return total + item.quantity * parseFloat(item.price);
                }, 0))
              } 
            </p>
            <button
              onClick={() => setPage("payment")}
              disabled={cartItems.length === 0}
              className={styles.checkoutButton}
            >
              Sepeti Onayla
            </button>
          </div>
        </div>
      )}


      {/* TechDepo ana sayfa */}
      {page === "welcome" && (
        <div className={styles.welcome}>
          <div className={styles.productGrid}>
            {cards.map((card) => (
              <div key={card.id} className={styles.animatedCard}
                onClick={() => {
                  if (TechDepoInfo.isLoggedIn) {
                    setPage(`product_${card.id}`);
                  } else {
                    setErrorMessage("Öncelikle giriş yapmalısınız!");
                    setPage("login");                      
                  }
                }}  
              >    
                <img src={card.image} alt={card.name} className={styles.productImage} />
                <h3>{card.name}</h3>
                <p>{formatPrice(card.price)}</p>
                <button
                  className={styles.addButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (TechDepoInfo.isLoggedIn) {
                      addToCart(card);
                    } else {
                      setErrorMessage("Öncelikle giriş yapmalısınız!");
                      setPage("login");                      
                    }
                  }}
                >
                  Sepete Ekle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TechDepo spesifik ürün sayfası */}
      {page.startsWith("product_") && (
        <div className={styles.productDetail}>
          {(() => {
            const productId = parseInt(page.split("_")[1]);
            const product = cards.find((card) => card.id === productId);
            return (
              <div className={styles.detailCard}>
                <button className={styles.backButton} onClick={() => setPage("welcome")}>◀️ Geri</button>
                <img src={product.image} alt={product.name} className={styles.detailImage} />
                <h2>{product.name}</h2>
                <p><strong>Fiyat:</strong> {product.price}</p>
                <p><strong>Satıcı:</strong> {product.seller}</p>
                <p className={styles.description}>{product.description}</p>
                <div className={styles.comments}>
                  <h4>Yorumlar</h4>
                  <ul>
                    {product.comments.map((comment, i) => (
                      <li key={i}>🗨️ {comment}</li>
                    ))}
                  </ul>
                </div>
                
                <button className={styles.addButton} 
                onClick={(e) => {
                  e.stopPropagation();                   
                    addToCart(product);                     
                }}> 
                  <img src="/techDepo/add-to-cart.png" alt="add-to-cart"/> 
                  Sepete Ekle
                </button>
                
              </div>
            );
          })()}
        </div>
      )}

      {/* TechDepo giriş/kayıt olma sayfası */}
      {page === "login" && !TechDepoInfo.isLoggedIn && (
        <div className={styles.loginForm}>
          {!is2FAwaiting ? (
            <>
              <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>
              {!isLogin && (
                <>
                  <input type="text" placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} />
                  <input type="text" placeholder="Soyad" value={surname} onChange={(e) => setSurname(e.target.value)} />
                </>
              )}
              <input className="disabled-input" type="email" placeholder="E-posta adresiniz" readOnly value={email} />
              <input type="password" placeholder="Şifreniz" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button
                onClick={handleAuth}
                disabled={isLogin && TechDepoInfo.lockoutUntil && Date.now() < TechDepoInfo.lockoutUntil}
              >
                {isLogin ? "Giriş Yap" : "Kayıt Ol"}
              </button>
              {TechDepoInfo.lockoutUntil && Date.now() < TechDepoInfo.lockoutUntil && isLogin && (
                <label className={styles.twoFAError}>
                  🚫 Çok fazla giriş denemesi yapıldı. <b>{getLockoutRemainingMinutes()}</b> dakika sonra tekrar deneyin.
                </label>
              )}
              {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
              {successMessage && <span className={styles.successMessage}>{successMessage}</span>}
              <p onClick={handleSignInOut}>
                {isLogin ? "Hesabınız yok mu? Kayıt olun!" : "Zaten üye misiniz? Giriş yapın!"}
              </p>
              {isLogin && (
                <button
                className={styles.forgotPasswordButton}
                type="button"
                onClick={() => setPage("forgot")}
                >
                  🔐 Şifremi Unuttum
                </button>
              )}
            </>
          ) : (
            <>
              <h3>📲 Telefonunuza gelen doğrulama kodunu girin:</h3>
              <input
                type="text"
                placeholder="6 haneli kod"
                value={twoFACodeInput}
                onChange={(e) => setTwoFACodeInput(e.target.value)}
              />
              <label className={styles.timerText}>
                ⏳ Kalan süre: {Math.floor(codeTimer / 60).toString().padStart(2, "0")}:
                {(codeTimer % 60).toString().padStart(2, "0")}
              </label>
              <button
                onClick={handleLogin2FACheck}
                disabled={TechDepoInfo.lockoutUntil && Date.now() < TechDepoInfo.lockoutUntil}
              >
                Giriş Yap
              </button>

              {lockMessage && <span className={styles.twoFAError}>{lockMessage}</span>}
              {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
            </>
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

      {/* TechDepo ödeme sayfası */}
      {page === "payment" && !is3DWaiting &&  (
        <div className={styles.paymentForm}>
          {/* Sol taraf */}
          <div className={styles.paymentLeft}>

            {/* 1. İndirim Kodu Bölümü */}
            <div className={styles.discountSection}>
              <h3>✨ İndirim Kodu</h3>
              <div>
                <input type="text" placeholder="Kodunuzu girin" />
                <button className={styles.applyButton}>Uygula</button>
              </div>
            </div>

            {/* 2. Adres ve İletişim Bilgileri */}
            <div className={styles.infoSection}>
              <h3><span>1</span>📞 Adres & İletişim Bilgileri</h3>
              <label>E-mail :</label>
              <input type="text" placeholder="E-posta adresiniz" value={email} readOnly/>
              <label>Ad Soyad :</label>
              <input type="text" placeholder="Adınız Soyadınız" value={`${TechDepoInfo.name} ${TechDepoInfo.surname}`} readOnly />
              <label>Telefon Numarası :</label>
              <input type="text" placeholder="Telefon Numaranız" value={TechDepoInfo.phone} readOnly />
              <label>Adres :</label>
              <input type="text" placeholder="Adres" value={TechDepoInfo.adres} readOnly />
            </div>

            {/* 3. Kargo Seçimi */}
            <div className={styles.shippingSection}>
              <h3><span>2</span>🚚 Kargo Seçimi</h3>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="shipping"
                  value="CargoNova"
                  checked={selectedShipping === "CargoNova"}
                  onChange={() => {
                    setSelectedShipping("CargoNova");
                    setSelectedShippingPrice(49.99); // buraya kargo fiyatı!
                  }}
                />
                <p>CargoNova - ₺49,99</p>
              </label>

              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="shipping"
                  value="FlyTakip"
                  checked={selectedShipping === "FlyTakip"}
                  onChange={() => {
                    setSelectedShipping("FlyTakip");
                    setSelectedShippingPrice(54.99);
                  }}
                />
                <p>FlyTakip Kargo - ₺54,99</p>
              </label>

              <label className={styles.radioLabel}>
                <input 
                  type="radio"
                  name="shipping"
                  value="TrendyTasima"
                  checked={selectedShipping === "TrendyTasima"}
                  onChange={() => {
                    setSelectedShipping("TrendyTasima");
                    setSelectedShippingPrice(80.49);
                  }}
                />
                <p>TrendyTaşıma - ₺80,49</p>
              </label>
            </div>
            {errors.shipping && <p ref={errorRef} className={styles.errorMessage}>{errors.shipping}</p>}

            {/* 4. Ödeme Bilgileri */}
            <div className={styles.paymentSection}>
              <h3><span>3</span>💳 Ödeme Bilgileri</h3>
              <div className={styles.paymentSectionCard}>
                <h4>Kredi Kartı</h4>
                <input
                  className={styles.paymentSectionInput}
                  type="text"
                  placeholder="Kart Numarası"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <input
                  className={styles.paymentSectionInput}
                  type="text"
                  placeholder="Kart Üzerindeki İsim"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />

                <div className={styles.expiryCVV}>
                <input
                  className={styles.paymentSectionInput}
                  type="text"
                  placeholder="AA/YY"
                  maxLength={5}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                />
                <input
                  className={styles.paymentSectionInput}
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCVV(e.target.value)}
                />
                </div>
                {TechDepoInfo.isLoggedIn && TechDepoInfo.savedCard && (
                  <button
                    type="button"
                    className={styles.fillSavedCardButton}
                    onClick={() => {
                      setCardNumber(TechDepoInfo.cardNumber);
                      setCardName(TechDepoInfo.cardName);
                      setExpiryDate(TechDepoInfo.cardExpiryDate);
                      // CVV boş bırakılacak
                      setCVV("");
                    }}
                  >
                    💳 Kayıtlı Kart Bilgilerimi Doldur
                  </button>
                )}
              </div>

              {errors.cardNumber && <p className={styles.errorMessage}>{errors.cardNumber}</p>}
              {errors.cardName && <p className={styles.errorMessage}>{errors.cardName}</p>}
              {errors.expiryDate && <p className={styles.errorMessage}>{errors.expiryDate}</p>}
              {errors.cvv && <p className={styles.errorMessage}>{errors.cvv}</p>}


              {errors.registeredCard && <p className={styles.errorMessage}>{errors.registeredCard}</p>}

              <div className={styles.optionsRow}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                  />
                  <p>Kart bilgilerimi kaydet</p>
                </label>
                <label className={styles.checkboxLabel}>
                   <input
                      type="checkbox"
                      checked={is3DChecked}
                      onChange={(e) => setIs3DChecked(e.target.checked)}
                    />
                  <p>3D Secure ile ödeme</p>
                </label> 
                <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <p><b>Gizlilik Sözleşmesini</b> ve <b>Satış Sözleşmesini</b> okudum, onaylıyorum.</p>
              </label>                                  
              </div>
              {errors.terms && <p className={styles.errorMessage}>{errors.terms}</p>}

              <button className={styles.paymentButton} onClick={handlePayment} disabled={isPaying}>
                {isPaying ? "⏳ Ödeme İşleniyor..." : "💳 Ödemeyi Tamamla"}
              </button>
              {errors.balance && <p ref={errorRef} className={styles.errorMessage}>{errors.balance}</p>}
            </div>
          </div>

          {/* Sağ taraf - Ürün Bilgileri */}
          <div className={styles.paymentRight}>
            <h3>📦 Sepetiniz</h3>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItemSummary}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.quantity} x ₺{formatPrice(item.price)}</p>
                  <p>Toplam: {formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}

            <div className={styles.cartTotal}>
              <p>Ürünler Toplamı: {formatPrice(cartTotal)}</p>
              <p>Kargo Ücreti: {formatPrice(selectedShippingPrice)}</p>
              <hr />
              <h3>Genel Toplam: {formatPrice(grandTotal)}</h3>
            </div>
          </div>
        </div>
      )}

      {/* 3D Secure Doğrulama */}
      {is3DWaiting && (
        <div className={styles.twoFAInputArea}>
          <h3>🔐 3D Secure Doğrulama</h3>
          <p>📲 Ödeme işlemini onaylamak için telefonunuza gelen 6 haneli kodu girin:</p>
          <input
            type="text"
            placeholder="6 haneli kod"
            value={payment2FACode}
            onChange={(e) => setPayment2FACode(e.target.value)}
          />
          <label className={styles.timerText}>
            ⏳ Kalan süre: {Math.floor(codeTimer / 60).toString().padStart(2, "0")}:
            {(codeTimer % 60).toString().padStart(2, "0")}
          </label>
         <button
            onClick={handlePayment2FACheck}
            disabled={TechDepoInfo.lockoutUntil && Date.now() < TechDepoInfo.lockoutUntil}
          >
            Ödemeyi Onayla
          </button>
          {lockMessage && <span className={styles.twoFAError}>{lockMessage}</span>}
          {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
        </div>
      )}


      {/* TechDepo kullanıcı bilgileri sayfası */}
      {page === "userProfile" && (
        <div className={styles.userProfile}>
          <div className={styles.sidebar}>
            <h3>Hesabım</h3>
            <ul>
               <li onClick={() => setSubPage("orders")}>Siparişlerim</li>
               <li onClick={() => setSubPage("profileInfo")}>Kullanıcı Bilgilerim</li>
               <li onClick={() => setSubPage("cards")}>Kayıtlı Kartlarım</li>
            </ul>
          </div>

          <div className={styles.profileContent}>

            {subPage === "orders" && (
              <div className={styles.ordersSection}>
                <h2>Siparişlerim</h2>
                {orders.length === 0 ? (
                  <p>Henüz sipariş verilmedi.</p>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className={styles.orderCard}>
                      <h4>🆔 Sipariş No: {order.id}</h4>
                      <p>📦 Kargo Firması: {order.shipping}</p>
                      <p>💵 Toplam Tutar: {formatPrice(order.total)}</p>
                      <p>📅 Sipariş Tarihi: {order.date}</p>
                      <div className={styles.orderStatusRow}>
                        <label>Sipariş Durumu:</label>
                        <span className={`${styles.orderStatus} ${styles['status' + order.status]}`}>
                          {["Onaylandı", "Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi"][order.status]}
                        </span>
                      </div>
                      <div className={styles.orderItems}>
                        {order.items.map((item, index) => (
                          <div key={index} className={styles.orderItemRow}>
                            <p>🔹 {item.name} ({item.quantity} adet) - ₺{formatPrice(item.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {subPage === "profileInfo" && (
              <>
                <div className={styles.profileForm}>
                  <h2>Kullanıcı Bilgilerim</h2>
                  <div className={styles.userBasicInfo}>
                    <strong>Ad:</strong>
                    <input value={editableName} onChange={(e) => setEditableName(e.target.value)} />
                    <strong>Soyad:</strong>
                    <input value={editableSurname} onChange={(e) => setEditableSurname(e.target.value)} />
                  </div>

                  <strong>Email:</strong>
                  <input value={email} disabled />

                  <strong>Telefon:</strong>
                  <input value={TechDepoInfo.phone} disabled />

                  <button
                    onClick={handleEdit}
                    disabled={!isChanged}
                    className={isChanged ? styles.saveButton : styles.saveButtonDisabled}
                  >
                    Bilgilerimi Güncelle
                  </button>

                  {infoUpdated && (
                    <p className={styles.updateMessage}>Bilgiler başarıyla güncellendi ✅</p>
                  )}
                </div>


                <div className={styles.twoFactor}>
                  <div className={styles.twoFactorHeader}>
                    <h4>🔐 Çift Faktörlü Doğrulama</h4>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={TechDepoInfo.is2FAEnabled}
                        onChange={(e) =>
                          setTechDepoInfo({ ...TechDepoInfo, is2FAEnabled: e.target.checked })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  <p className={styles.twoFactorDescription}>
                    Hesabınıza girişlerde ek güvenlik katmanı sağlar.
                  </p>
                </div>
                </>
            )}

            {subPage === "cards" && (
              <div>
                <h2>Kayıtlı Kartlarım</h2>
                {TechDepoInfo.savedCard ? (
                  <div className={styles.savedCard}>
                    <p>💳 Kart Numarası: {maskCardNumber(TechDepoInfo.cardNumber)}</p>
                    <p>👤 Kart Sahibi: {TechDepoInfo.cardName}</p>
                    <p>📅 Son Kullanma Tarihi: {TechDepoInfo.cardExpiryDate}</p>
                  </div>
                ) : (
                  <p style={{color: "black"}}>💳 Henüz kart eklenmemiş.</p>
                )}
              </div>
            )}
          </div>

        </div>
      )}


      <footer className={styles.footer}>
        <p>&copy; 2025 TechDepo</p>
      </footer>
    </div>
  );
};

export default TechDepo;