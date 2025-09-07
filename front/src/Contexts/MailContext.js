import React, { createContext, useContext, useEffect, useState } from 'react';
import { mails as initialMails, sentMails as initialSentMails, spamMails as initialSpamMails, createCargoMail, createInvoiceMail} from '../components/Mailbox/Mails';
import { useNotificationContext } from './NotificationContext';
import { useUIContext } from './UIContext';
import { useTimeContext } from './TimeContext';
import { useSecurityContext } from './SecurityContext';

const MailContext = createContext();

export const MailContextProvider = ({ children }) => {
  const [initMail, setInitMail] = useState(initialMails);
  const [inboxMails, setInboxMails] = useState(initialMails.filter(mail => mail.used));
  const [initsentMails, setInitSentMails] = useState(initialSentMails);
  const [initspamMails, setInitSpamMails] = useState(initialSpamMails);
  const [spamboxMails, setSpamboxMails] = useState(initialSpamMails.filter(mail => mail.used));
  const [selectedMail, setSelectedMail] = useState(null);
  const [pendingMails, setPendingMails] = useState([]); // Statik mailler için, Wifi yokken bekletmek amacıyla
  const [pendingMailQueue, setPendingMailQueue] = useState([]); // Dinamik delayli gönderimler
  const [isMailboxLoggedIn, setIsMailboxLoggedIn] = useState(false);

  const { isWificonnected } = useSecurityContext();
  const { gameDate, secondsRef } = useTimeContext();
  const { addNotification, removeNotification } = useNotificationContext();
  const { openWindow } = useUIContext();

  // --- Statik (senaryo/ilk atama) mailleri için ---
  const addMailToMailbox = (type, id, sendTime = gameDate) => {
    setPendingMails(prev => [...prev, { type, id, sendTime }]);
  };

  // Mail okundu işaretle + bildirimden kaldır
  const markMailAsReadAndRemoveNotification = (mailId) => {
    setInboxMails(prev =>
      prev.map(m =>
        m.id === mailId ? { ...m, readMail: true } : m
      )
    );
    removeNotification(mailId);
  };

  // Merkezi mail bildirimi oluşturucu
  const createMailNotification = (mailObj) => {
    addNotification({
      id: mailObj.id,
      type: "info",
      appType: "mail",
      title: mailObj.title,
      message: mailObj.precontent,
      icon: "/icons/mail.png",
      isPopup: true,
      isTaskbar: true,
      duration: 7000,
      actions: [
        {
          label: "Oku",
          onClick: () => {
            openWindow('mailbox');
            setSelectedMail(mailObj);
            markMailAsReadAndRemoveNotification(mailObj.id);
          }
        },
        {
          label: "Bildirimden Kaldır",
          onClick: () => removeNotification(mailObj.id)
        }
      ],
      appData: { mailId: mailObj.id },
    });
  };

  // Statik senaryo maillerini uygun anda inbox/spam'a at
  useEffect(() => {
    if (isMailboxLoggedIn && isWificonnected && pendingMails.length > 0) {
      pendingMails.forEach(mail => {
        // Her mail stack'ten mailbox'a işlenir
        if (mail.type === 'inbox') {
          const mailToAdd = initMail.find(m => m.id === mail.id);
          if (mailToAdd && !mailToAdd.used) {
            const updatedMail = { 
              ...mailToAdd, 
              used: true, 
              sendTime: mail.sendTime || mailToAdd.sendTime || gameDate
            };
            setInitMail(prevMails =>
              prevMails.map(m =>
                m.id === mail.id ? updatedMail : m
              )
            );
            setInboxMails(prevMails => [...prevMails, updatedMail]);
            createMailNotification(updatedMail);
          }
        } else if (mail.type === 'spam') {
          const spamToAdd = initspamMails.find(m => m.id === mail.id);
          if (spamToAdd && !spamToAdd.used) {
            const updatedSpam = { 
              ...spamToAdd, 
              used: true, 
              sendTime: mail.sendTime || spamToAdd.sendTime || gameDate
            };
            setInitSpamMails(prevMails =>
              prevMails.map(m =>
                m.id === mail.id ? updatedSpam : m
              )
            );
            setSpamboxMails(prevMails => [...prevMails, updatedSpam]);
            // Spam için notification çıkarılmıyor.
          }
        }
      });
      setPendingMails([]); // Stack boşaltılır
    }
  }, [isWificonnected, pendingMails, initMail, initspamMails, gameDate, isMailboxLoggedIn]);

  // --- Dinamik, delay ile gönderilen (sipariş sonrası) mailler için ---
  const actuallySendMail = (type, params) => {
    const mailId = params.mailId || Date.now();
    let mailObj = null;
    if (type === "cargo") {
      mailObj = {
        id: mailId,
        from: params.from,
        title: params.title,
        precontent: params.precontent,
        readMail: false,
        notified: false,
        used: false,
        sendTime: params.sendTime || gameDate,
        content: params.content || createCargoMail({ ...params, mailId }),
      };
    } else if (type === "invoice") {
      mailObj = {
        id: mailId,
        from: params.from,
        title: params.title,
        precontent: params.precontent,
        readMail: false,
        notified: false,
        used: false,
        sendTime: params.sendTime || gameDate,
        content: createInvoiceMail({ ...params, mailId }),
      };
    } else if (type === "resetPassword") {
      mailObj = {
        id: mailId,
        from: params.from,
        title: params.title,
        precontent: params.precontent,
        readMail: false,
        notified: false,
        used: false,
        sendTime: params.sendTime || gameDate,
        content: params.content, // ✅ Bu sadece <div>...</div> içeriği olmalı
      };
    }
    // ...diğer türler burada genişletilebilir

    if (mailObj) {
      setInitMail(prev => [...prev, mailObj]);
      setInboxMails(prev => [...prev, mailObj]);
      createMailNotification(mailObj);
    }
  };

  // sendMail fonksiyonu (opsiyonel gecikmeli!)
  // sendMail(type, params, {delaySeconds: 20})
  const sendMail = (type, params, options = {}) => {
    const delaySeconds = options.delaySeconds || 0;
    if (delaySeconds > 0 && secondsRef && typeof secondsRef.current === 'number') {
      setPendingMailQueue(prev => [
        ...prev,
        {
          type,
          params,
          triggerSeconds: secondsRef.current + delaySeconds,
        }
      ]);
    } else {
      actuallySendMail(type, params);
    }
  };

  // Delay queue watcher (sipariş sonrası delayli mailleri zamanında gönder)
  useEffect(() => {
    if (!isWificonnected) return;
    if (!secondsRef || typeof secondsRef.current !== "number") return;
    setPendingMailQueue(prev => {
      const now = secondsRef.current;
      const ready = prev.filter(mail => mail.triggerSeconds <= now);
      const waiting = prev.filter(mail => mail.triggerSeconds > now);
      ready.forEach(mail => actuallySendMail(mail.type, mail.params));
      return waiting;
    });
  }, [secondsRef.current, isWificonnected]);

  return (
    <MailContext.Provider value={{
      initMail, setInitMail,
      inboxMails, setInboxMails,
      initsentMails, setInitSentMails,
      initspamMails, setInitSpamMails,
      spamboxMails, setSpamboxMails,
      selectedMail, setSelectedMail,
      addMailToMailbox, // statik mailler için aynen bırakıldı!
      sendMail, // dinamik ve gecikmeli gönderim
      markMailAsReadAndRemoveNotification, 
      isMailboxLoggedIn, setIsMailboxLoggedIn,
    }}>
      {children}
    </MailContext.Provider>
  );
};

export const useMailContext = () => useContext(MailContext);
