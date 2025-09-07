import { createContext, useContext, useState, useEffect } from 'react';
import { useNotificationContext } from './NotificationContext';
import { useUIContext } from './UIContext';
import { useTimeContext } from './TimeContext';
import { useSecurityContext } from './SecurityContext';

const PhoneContext = createContext();

export const PhoneProvider = ({ children }) => {
  const { addNotification, markAsRead } = useNotificationContext();
  const { openWindow } = useUIContext();
  const { isWificonnected } = useSecurityContext();
  const { gameDate, getRelativeDate } = useTimeContext();
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);

  // Statik mesajlar
  const initialMessages = [
    {
      id: 1,
      sender: 'Migros',
      content: '🛒 Club Kart’a özel haftasonu fırsatları sizi bekliyor! Detaylar için uygulamamıza göz atın.',
      sendTime: getRelativeDate({ days: -1, hours: 3, minutes: 15 })
    },
    {
      id: 2,
      sender: 'OrionTech',
      content: '🔧 Planlı bakım çalışması nedeniyle sistemlerimiz 22:00 - 01:00 arasında geçici olarak devre dışı olacaktır.',
      sendTime: getRelativeDate({ days: -1, hours: 9, minutes: 0 })
    },
    {
      id: 3,
      sender: 'e-Devlet',
      content: '📌 Yeni bir e-Belge sisteminize yüklenmiştir. Detaylar için sisteme giriş yapınız.',
      sendTime: getRelativeDate({ days: -5, hours: 2, minutes: 10 })
    },
    {
      id: 4,
      sender: 'HepsiMarket',
      content: '🎉 Bugün geçerli! Tüm alışverişlerde %30 indirim. Kodu kullan: INDIRIM30',
      sendTime: getRelativeDate({ days: -5, hours: 6, minutes: 43 })
    },
    {
      id: 5,
      sender: 'PTT Kargo',
      content: 'Kargonuz dağıtıma çıkmıştır. Teslimat bugün 19:00’a kadar yapılacaktır.',
      sendTime: getRelativeDate({ days: -6, hours: 1, minutes: 18 })
    },
  ];

  // Mesaj state’i
  const [messages, setMessages] = useState(initialMessages);
  // Okunanlar
  const [readMessages, setReadMessages] = useState(initialMessages.map(m => m.id));
  // Kod sms için
  const [lastCodes, setLastCodes] = useState({});
  const [codeTimers, setCodeTimers] = useState({});
  // Sıra: internet gelene kadar eklenmeyen mesajlar
  const [pendingMessages, setPendingMessages] = useState([]);

  // Sadece queue'ya ekler!
  const addMessage = (sender, content, showNotification = true) => {
    setPendingMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 10000),
        sender,
        content,
        sendTime: gameDate,
        showNotification
      }
    ]);
  };

  // Wifi geldiğinde pending’i boşaltır
  useEffect(() => {
    if (isPhoneConnected && isWificonnected && pendingMessages.length > 0) {
      pendingMessages.forEach(({ id, sender, content, sendTime, showNotification }) => {
        const newMessage = {
          id,
          sender,
          content,
          sendTime,
          read: false
        };
        setMessages(prev => [newMessage, ...prev]);

        if (showNotification) {
          addNotification({
            id: newMessage.id,
            appType: 'phone',
            type: 'info',
            title: sender,
            message: content,
            icon: '/PhoneApp/comment.png',
            isPopup: true,
            isTaskbar: true,
            duration: 7000,
            actions: [
              {
                label: 'Oku',
                onClick: () => {
                  openWindow('phoneapp');
                  markMessageAsRead(newMessage.id);
                  markAsRead(newMessage.id);
                }
              }
            ],
            appData: { smsId: newMessage.id, sender }
          });
        }
      });
      setPendingMessages([]); // queue'yu temizle
    }
  }, [isWificonnected, pendingMessages, addNotification, openWindow, markAsRead, isPhoneConnected]);

  const markMessageAsRead = (id) => {
    if (!readMessages.includes(id)) {
      setReadMessages(prev => [...prev, id]);
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => !readMessages.includes(msg.id)).length;
  };

  // KOD SMSİ üretme fonksiyonları
  const generate6DigitCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const generateCodeMessage = (senderName, key) => {
    const code = generate6DigitCode();
    const content = `Kodunuz: ${code}. Kimseyle paylaşmayın.`;
    addMessage(senderName, content, true);

    setLastCodes(prev => ({ ...prev, [key]: code }));

    if (codeTimers[key]) clearTimeout(codeTimers[key]);
    const timerId = setTimeout(() => {
      setLastCodes(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }, 2 * 60 * 1000);
    setCodeTimers(prev => ({ ...prev, [key]: timerId }));
  };

  const clearCode = (key) => {
    setLastCodes(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <PhoneContext.Provider
      value={{
        messages,
        addMessage,
        generateCodeMessage,
        lastCodes,
        clearCode,
        readMessages,
        markMessageAsRead,
        getUnreadCount,
        pendingMessages, 
        isPhoneConnected,
        setIsPhoneConnected,
      }}
    >
      {children}
    </PhoneContext.Provider>
  );
};

export const usePhoneContext = () => useContext(PhoneContext);
