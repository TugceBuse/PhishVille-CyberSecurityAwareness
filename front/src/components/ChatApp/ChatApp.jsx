import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatApp.module.css';
import { MakeDraggable } from '../../utils/Draggable';
import { useUIContext } from '../../Contexts/UIContext';
import { useGameContext } from '../../Contexts/GameContext';
import { statusSteps } from '../../utils/cargoStatus';
import { useChatContext } from '../../Contexts/ChatContext';
import { useTimeContext } from '../../Contexts/TimeContext';
import FileUploadButton from './FileUploadButton';
import { useQuestManager } from '../../Contexts/QuestManager';
import { useEventLog } from '../../Contexts/EventLogContext';

export const useChatApp = () => {
  const { openWindow, closeWindow } = useUIContext();
  return {
    openHandler: () => openWindow('chatapp'),
    closeHandler: () => closeWindow('chatapp'),
  };
};

const ChatApp = ({ closeHandler, style }) => {
  const chatAppRef = useRef(null);
  MakeDraggable(chatAppRef, `.${styles.chatHeader}`);

  const { cargoTrackingList, orders, cargoTrackingSiteVisited } = useGameContext();
  const { addEventLog } = useEventLog();
  const { completeQuest } = useQuestManager();
  const { windowProps } = useUIContext();
  const chatProps = windowProps?.chatapp || {};
  const { gameDate } = useTimeContext();

  const printerOrder = orders.find(order =>
    order.items.some(item => item.id === 15)
  );
  const trackingNo = printerOrder?.trackingNo;
  const cargo = cargoTrackingList.find(item => item.trackingNo === trackingNo);

  // Kullanıcılar dinamik olarak context'ten geliyor!
  const { users, messages, addChatMessage, options, setUserOptions, setCargoStepShared, cargoStepShared } = useChatContext();

  // Başlangıçta IT Destek seçili olsun (id: 1)
  const [selectedUser, setSelectedUser] = useState(() =>
    users.length > 0 ? users[0] : null
  );

  const { uploadTasks, markUploadTaskCompleted } = useChatContext();

  const activeUploadTask = uploadTasks.find(
    t => t.userId === selectedUser?.id && !t.completed
  );
  // Yeni user eklenirse, varsayılan seçimi güncelle
  useEffect(() => {
    if (selectedUser) return;
    if (users.length > 0) setSelectedUser(users[0]);
  }, [users, selectedUser]);

  // Gelen bildirim pop-up ından chatapp açılırsa ilgili sohbeti aç
  useEffect(() => {
    if (chatProps.userId && users.length > 0) {
      const targetUser = users.find(u => u.id === chatProps.userId);
      if (targetUser) {
        setSelectedUser(targetUser);
      }
    }
  }, [chatProps.userId, users]);

  // Kargo adım butonlarını sadece flag'e bakarak ekle
  useEffect(() => {
    if (!cargo || cargoStepShared[trackingNo]) return;
    setUserOptions(1,
      statusSteps.map((step, idx) => ({
        id: idx,
        label: `Kargo Durumu: ${step.status}`,
        enabled: cargoTrackingSiteVisited[cargo.trackingNo] === true && cargo.currentStep === idx
      }))
    );
  }, [cargo?.currentStep, cargoTrackingSiteVisited, cargoStepShared[trackingNo]]);

  // İlk açılışta dummy mesaj ekle
  useEffect(() => {
    if (!selectedUser) return;
    if (!(messages[selectedUser.id] && messages[selectedUser.id].length > 0)) {
      if (selectedUser.id === 1) {
        addChatMessage(1, {
          sender: 'them',
          text: 'Merhaba, bilgisayarında bir sorun yaşadın mı?',
          time: '09:45'
        });
      }
      if (selectedUser.id === 2) {
        addChatMessage(2, {
          sender: 'them',
          text: 'CV’ni sistemimize yüklemeyi unutma.',
          time: '14:20'
        });
      }
    }
  }, [selectedUser, addChatMessage, messages]);

  const handleUserClick = (user) => setSelectedUser(user);

  // Seçenekli butona tıklayınca mesaj gönder
  const handleOptionSend = (option) => {

    addEventLog({
      type: "chat_option_selected",
      questId: option.questId || null,
      logEventType: "chat_option",
      value: 0,
      data: { userId: selectedUser.id, option }
    });
    
    addChatMessage(selectedUser.id, {
      sender: "me",
      text: option.label,
      time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      optionId: option.id
    });

    setUserOptions(selectedUser.id, []);

    // Kargo durumu paylaşıldıysa
    if (option.label.startsWith("Kargo Durumu:")) {
      setCargoStepShared(prev => ({
        ...prev,
        [trackingNo]: true 
      }));
      completeQuest("share_cargo_status");
      addEventLog({
        type: "share",
        questId: "share_cargo_status",
        logEventType: "share_information",
        value: 10, 
        data: 
        {
          app: "ChatApp",
          userId: selectedUser.id,
        }
      });
      setTimeout(() => {
        addChatMessage(selectedUser.id, {
          sender: "them",
          text: "Bilgi için teşekkürler, süreci takipteyiz.",
          time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        }, true);

        setTimeout(() => {
          setUserOptions(selectedUser.id, [
            { id: 99, label: "Rica ederim, iyi çalışmalar.", enabled: true },
            { id: 100, label: "Başka bir isteğiniz var mı?", enabled: true }
          ]);
        }, 1200);
      }, 1000);
      return;
    }

    if (option.id === 100) {
      setTimeout(() => {
        addChatMessage(selectedUser.id, {
          sender: "them",
          senderName: "IT Destek",
          text: "Teşekkür ederim, şu anda başka bir isteğim yok. İyi günler!",
          time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        }, true);
        setUserOptions(selectedUser.id, []);
      }, 1000);
      return;
    }

    if (option.id === 99) {
      setTimeout(() => {
        addChatMessage(selectedUser.id, {
          sender: "them",
          senderName: "IT Destek",
          text: "Size de iyi çalışmalar!",
          time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        }, true);
      }, 1000);
      setUserOptions(selectedUser.id, []);
      return;
    }
  };

  // Seçenekler context'ten
  const userOptions = selectedUser ? (options[selectedUser.id] || []) : [];

  return (
    <div className={styles.chatWindow} style={style} ref={chatAppRef} data-window="chatapp">
      <div className={styles.chatHeader}>
        <h2>Mesajlaşma</h2>
        <button className={styles.chatClose} onClick={closeHandler}>×</button>
      </div>

      <div className={styles.body}>
        <div className={styles.userList}>
          {users.map(user => (
            <div key={user.id} className={styles.userItem} onClick={() => handleUserClick(user)}>
              <img src={user.avatar} alt={user.name} />
              <span>{user.name}</span>
            </div>
          ))}
        </div>

        <div className={styles.chatContent}>
          <div className={styles.chatTitle}>{selectedUser?.name}</div>
          <div className={styles.messageList}>
            {(messages[selectedUser?.id] || []).map((msg, idx) => (
              <div key={idx} className={msg.sender === 'me' ? styles.myMessage : styles.theirMessage}>
                <span>{msg.text}</span>
                <small>{msg.time}</small>
              </div>
            ))}
          </div>
          <div className={styles.inputArea}>
            {userOptions.length === 0 ? (
              <span style={{ color: "#aaa" }}>Şu anda gönderilebilecek bir mesaj yok.</span>
            ) : (
              userOptions.map(option => {
                const isCargoStep = option.label?.startsWith("Kargo Durumu:");
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSend(option)}
                    disabled={!option.enabled}
                    className={
                      isCargoStep
                        ? (option.enabled ? styles.cargoStepButton : `${styles.cargoStepButton} ${styles.disabledButton}`)
                        : (option.enabled ? styles.normalOptionButton : `${styles.normalOptionButton} ${styles.disabledButton}`)
                    }
                  >
                    {option.label}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
      <FileUploadButton
      visible={!!activeUploadTask}
      allowedTypes={activeUploadTask?.allowedTypes}
      filterLabelContains={activeUploadTask?.filterLabelContains}
      buttonText={activeUploadTask?.buttonText || "Dosya Yükle"}
      onFileSend={file => {
        addChatMessage(selectedUser.id, {
          sender: "me",
          text: `${file.label} (PDF) gönderildi.`,
          time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          uploadedInvoice: true,
          fileName: file.label
        });
        completeQuest("share_invoice");
        addEventLog({
          type: "share",
          questId: "share_invoice",
          logEventType: "share_information",
          value: 10, 
          data: 
          {
            app: "ChatApp",
            userId: selectedUser.id,
          }
        });
        setTimeout(() => {
          addChatMessage(selectedUser.id, {
            sender: "them",
            senderName: selectedUser.name || "Satış Departmanı",
            text: "Teşekkürler, fatura belgesi başarıyla alındı! ✅",
            time: gameDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          });
          setUserOptions(selectedUser.id, []);
          markUploadTaskCompleted(selectedUser.id, activeUploadTask?.filterLabelContains);
        }, 1000);
      }}
    />
    </div>
  );
};

export default ChatApp;
