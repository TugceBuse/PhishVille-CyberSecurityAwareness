import './Mailbox.css';
import React, { useRef, useEffect, useState } from 'react';
import { MakeDraggable } from '../../utils/Draggable';
import { useUIContext } from '../../Contexts/UIContext';
import { useMailContext } from '../../Contexts/MailContext';
import { useGameContext } from '../../Contexts/GameContext';
import { resetScroll } from '../../utils/resetScroll';
import { useNotificationContext } from '../../Contexts/NotificationContext';
import ConnectionOverlay from '../../utils/ConnectionOverlay';
import { useQuestManager } from '../../Contexts/QuestManager';
import { useEventLog } from '../../Contexts/EventLogContext';

export const useMailbox = () => {
  const { openWindow, closeWindow } = useUIContext();

  const openHandler = () => openWindow('mailbox');
  const closeHandler = () => closeWindow('mailbox');

  return { openHandler, closeHandler };
};

const Mailbox = ({ closeHandler, style }) => {
  const mailboxRef = useRef(null);
  MakeDraggable(mailboxRef, '.mailbox-header');

  const [activeTab, setActiveTab] = useState('inbox');
  const [showSpamMenu, setShowSpamMenu] = useState(false);

  const { removeNotification } = useNotificationContext();
  const { addEventLogOnce, addEventLog } = useEventLog();
  const { completeQuest } = useQuestManager();

  const {
    inboxMails, setInboxMails,
    initsentMails,
    spamboxMails, setSpamboxMails,
    selectedMail, setSelectedMail,
  } = useMailContext();

  const { isWificonnected, constUser, isMailboxLoggedIn, setIsMailboxLoggedIn } = useGameContext();
  const contentRef = useRef(null);

  const unreadCountMail = inboxMails.filter(mail => !mail.readMail).length;
  const unreadCountSpam = spamboxMails.filter(mail => !mail.readMail).length;

  useEffect(() => {
    if (selectedMail) resetScroll(contentRef);
  }, [selectedMail]);

  const handleMailClick = (mail) => {
    if (!isWificonnected) return;

    const foundMail = inboxMails.find(m => m.id === mail.id) || mail;
    setSelectedMail(foundMail);

    if (activeTab === "inbox") {
      setInboxMails(prev =>
        prev.map(m =>
          m.id === mail.id ? { ...m, readMail: true } : m
        )
      );
      removeNotification(mail.id);
      addEventLog({
        type: "mail_open",
        questId: null,
        logEventType: "mail_read",
        value: 0, // puan yok
        data: {
          mailId: mail.id,
          title: mail.title,
          from: mail.from,
        }
      });
    } else if (activeTab === "spam") {
      setSpamboxMails(prev =>
        prev.map(m =>
          m.id === mail.id ? { ...m, readMail: true } : m
        )
      );

      // SPAM MAİL TIKLANDI: Logla ve puan düşür!
      addEventLogOnce(
        "spam_mail_open",      // type
        "mailId",              // uniqueField
        mail.id,               // uniqueValue (her mail için tek)
        {
          type: "spam_mail_open",
          questId: null, // varsa questId ekle
          logEventType: "spam_mail",
          value: -4,
          data: {
            mailId: mail.id,
            title: mail.title,
            from: mail.from,
          }
        }
      );
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedMail(null);
  };

  const resetReadMails = () => {
    setInboxMails(prev => prev.map(m => ({ ...m, readMail: false })));
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ----------------- GİRİŞ EKRANI STATE'İ VE FONKSİYONU -----------------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      loginEmail.trim().toLowerCase() === constUser.email.toLowerCase() &&
      loginPassword === constUser.tempPassword
    ) {
      completeQuest("login_mailbox");
      // DOĞRU GİRİŞ LOGU (wifi logu kaldırıldı)
      addEventLogOnce(
        "mailbox_login",         // type
        "email",                 // uniqueField (her kullanıcı bir kez loglansın)
        loginEmail.toLowerCase(),
        {
          type: "mailbox_login",
          questId: "mailbox_login",
          logEventType: "login",
          value: 0, // Girişten puan
          data: {
            email: loginEmail.toLowerCase()
          }
        }
      );
      setIsMailboxLoggedIn(true);
      setLoginError('');
      setLoginPassword('');
      setLoginEmail('');
    } else {
      setLoginError("E-posta adresi veya geçici şifre yanlış!");
      setTimeout(() => setLoginError(''), 2000);
    }
  };

  // ----------------- /GİRİŞ EKRANI -----------------

  // ----------------- GİRİŞ EKRANI UI -----------------
  if (!isMailboxLoggedIn) {
    return (
      <div className="mailbox-window" style={style} ref={mailboxRef} data-window="mailbox">
        <div className="mailbox-header">
          <div className='mailbox-header-left'>
            <img className="menu-icon" src="./icons/menu.png" alt="Menu Icon"/>
          </div>
          <button className="mailbox-close" onClick={closeHandler}>×</button>
        </div>
        <div className="mailbox-login-screen">
          <div className="mailbox-login-form" style={{
            margin: "50px auto", maxWidth: 350, padding: 28, borderRadius: 15, background: "#222c", display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <img src="./icons/mail.png" alt="MailBox Icon" style={{ width: 48, marginBottom: 10 }} />
            <h2>MailBox Girişi</h2>
            <form onSubmit={handleLogin} style={{width: "100%", display: "flex", flexDirection: "column", gap: 16, marginTop: 18}}>
              <input
                type="email"
                placeholder="E-posta adresi"
                value={loginEmail}
                autoFocus
                onChange={e => setLoginEmail(e.target.value)}
                style={{fontSize: 15, padding: 9, borderRadius: 7, border: "1px solid #ccc", background: "#2a2537", color: "#fff"}}
              />
              <input
                type="password"
                placeholder="Geçici Şifre"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{fontSize: 15, padding: 9, borderRadius: 7, border: "1px solid #ccc", background: "#2a2537", color: "#fff"}}
              />
              <button
                type="submit"
                style={{
                  marginTop: 10, background: "#51b0f2", color: "#fff", fontWeight: 600,
                  border: "none", borderRadius: 7, padding: "9px 0", cursor: "pointer", fontSize: 16
                }}
              >Giriş Yap</button>
            </form>
            {loginError && <div style={{ color: "#f85", marginTop: 12 }}>{loginError}</div>}
            <div style={{marginTop:24, fontSize:14, color:"#ccc"}}>
              <b>İpucu:</b> Kayıt olduğun e-posta ve verilen geçici şifreyi kullanmalısın.
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ----------------- /GİRİŞ EKRANI UI -----------------

  // ------------- BURADAN SONRASI ORİJİNAL MAILBOX RENDER'I -------------
  return (
    <div className="mailbox-window" style={style} ref={mailboxRef} data-window="mailbox" >
      <div className="mailbox-header">
        <div className='mailbox-header-left'>
          <img className="menu-icon" src="./icons/menu.png" alt="Menu Icon"/>
          <img className="search-icon" src="./icons/search.png" alt="Search Icon"/>
          <input type="text" placeholder=" Ara" />
          <img src="./icons/undo.png" alt="Undo Icon"/>
          <img src="./icons/undo-all.png" alt="Undo-All Icon"/>
          <img src="./icons/next.png" alt="Right-Arrow Icon"/>
        </div>
        <button className="mailbox-close" onClick={closeHandler}>×</button>
      </div>
      <ConnectionOverlay isConnected={isWificonnected} top={0}>
        <div className="mailbox-inwindow">
          <div className="mailbox-sidebar">
            <ul>
              <li
                className={activeTab === 'inbox' ? 'active' : ''}
                onClick={() => handleTabClick('inbox')}
              >
                <img className="is-icon" src="./icons/inbox.png" alt="Inbox Icon"/>  Inbox
                <div className="number-of-mails">{unreadCountMail}</div>
              </li>
              <li
                className={activeTab === 'spam' ? 'active' : ''}
                onClick={() => handleTabClick('spam')}
              >
                <img className="is-icon" src="./icons/spam.png" alt="Spam Icon"/>Spam
                <div className="number-of-mails">{unreadCountSpam}</div>
              </li>
              <li
                className={activeTab === 'sent' ? 'active' : ''}
                onClick={() => handleTabClick('sent')}
              >
                <img className="is-icon" src="./icons/sent.png" alt="Sent Icon"/>Sent
              </li>
              <div style={{display:"flex", flexDirection:"column", padding: 10, gap:10, marginTop: 50, opacity:0.7}}>
                <span>
                  <img className="is-icon" src="./icons/junk-mail.png" alt="Junk Mail Icon"/>Junk Mail
                </span>
                <span>
                  <img className="is-icon" src="./icons/draft.png" alt="Draft Icon"/>Drafts
                </span>
                <span>
                  <img className="is-icon" src="./icons/remove.png" alt="Remove Icon"/>Deleted Items
                </span>
                <span>
                  <img className="is-icon" src="./icons/inbox (2).png" alt="Archive Icon"/>Archives
                </span>
                <span>
                  <img className="is-icon" src="./icons/writing.png" alt="Writing Icon"/>Notes
                </span>
              </div>
            </ul>
          </div>

          {/* mail listesi */}
          <div className="mailbox-mails">
            <div style={{display:"flex", flexDirection:"column"}}>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <button
                style={{width:200, height:20, alignSelf:"center", backgroundColor:"rgb(255, 242, 225)", color:"black", border:"none", borderRadius:10, cursor:"pointer",}}
                onClick={resetReadMails}
              >
                Okunma Durumunu Sıfırla
              </button>
            </div>

            <ul className="mailbox-maillist">
              {activeTab === 'inbox' &&
                inboxMails.slice().reverse().map((mail) => (
                  <li
                    key={mail.id}
                    onClick={() => handleMailClick(mail)}
                    className={selectedMail?.id === mail.id ? 'active' : ''}
                  >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      {!mail.readMail && <div className="dot"></div>}
                      <h3>{mail.title}</h3>
                    </div>
                    <p>
                      {mail.precontent.length > 50
                        ? `${mail.precontent.slice(0, 50)}...`
                        : mail.precontent}
                    </p>
                  </li>
                ))
              }
              {activeTab === 'sent' &&
                initsentMails.map((mail) => (
                  <li
                    key={mail.id}
                    onClick={() => handleMailClick(mail)}
                    className={selectedMail?.id === mail.id ? 'active' : ''}
                  >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <h3>{mail.title}</h3>
                    </div>
                    <p>
                      {mail.precontent.length > 50
                        ? `${mail.precontent.slice(0, 50)}...`
                        : mail.precontent}
                    </p>
                  </li>
                ))
              }
              {activeTab === 'spam' &&
                spamboxMails.slice().reverse().map((mail) => (
                  <li
                    key={mail.id}
                    onClick={() => handleMailClick(mail)}
                    className={selectedMail?.id === mail.id ? 'active' : ''}
                  >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      {!mail.readMail && <div className="dot"></div>}
                      <h3>{mail.title}</h3>
                    </div>
                    <p>
                      {mail.precontent.length > 50
                        ? `${mail.precontent.slice(0, 50)}...`
                        : mail.precontent}
                    </p>
                  </li>
                ))
              }
            </ul>
          </div>

          {/* mail içeriği */}
          <div className="mailbox-mailcontent" ref={contentRef}>
            {selectedMail ? (
              <>
                <div className="mailbox-mailcontentheader">
                  <img src="./icons/user (2).png" alt="Mail Pic" className="mail-image"/>
                  <div style={{display:"flex", flexDirection:"column", gap:10}}>
                    <h3>{selectedMail?.title}</h3>
                    <h3>&lt;{selectedMail?.from}&gt;</h3>
                    {selectedMail?.sendTime && (
                      <div className="mail-date">
                        <span className="date-icon">🕒</span>
                        {formatDate(selectedMail.sendTime)}
                      </div>
                    )}
                  </div>
                  <div className="mailbox-mailcontentheader-rightBox">
                    <img src="./icons/undo.png" alt="Undo Icon"/>
                    <img src="./icons/undo-all.png" alt="Undo-All Icon"/>
                    <img src="./icons/next.png" alt="Right-Arrow Icon"/>
                    {activeTab === 'inbox' && (
                      <>
                        <span onClick={() => setShowSpamMenu(prev => !prev)} style={{ cursor: 'pointer' }}>...</span>
                        {showSpamMenu && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: 'white',
                            color: 'black',
                            border: '1px solid gray',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            zIndex: 999
                          }}>
                            <button
                              onClick={() => {
                                if (selectedMail) {
                                  setInboxMails(prev => prev.filter(mail => mail.id !== selectedMail.id));
                                  setSpamboxMails(prev => [...prev, { ...selectedMail, readMail: true }]);
                                  setSelectedMail(null);

                                  // SPAM'A BİLDİR LOGU (ayarlanmadı)
                                  // addEventLog({
                                  //   type: "mark_as_spam",
                                  //   questId: "mailbox_spam_report", // quest varsa
                                  //   logEventType: "mark_spam",
                                  //   value: 2, // spam bildirme puanı
                                  //   data: {
                                  //     mailId: selectedMail.id,
                                  //     title: selectedMail.title,
                                  //   }
                                  // });
                                }
                                setShowSpamMenu(false);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'black' }}
                            >
                              📩 Bildir (Spam olarak işaretle)
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="mailbox-mailcontenttext">
                  {selectedMail?.content}
                </div>
              </>
            ) : (
              <div style={{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                textAlign:"center",
              }}>
                <img
                  className='postbox-icon'
                  src="./icons/postbox.png"
                  alt="MailBox Icon"/>
                <h2 style={{color:"rgb(255, 242, 225)"}} >Okumak için bir öge seçin</h2><br/>
                <h3 style={{color:"rgb(255, 242, 225)"}} >Hiçbir şey seçilmedi</h3>
              </div>
            )}
          </div>
        </div>
      </ConnectionOverlay>
    </div>
  );
};

export default Mailbox;
