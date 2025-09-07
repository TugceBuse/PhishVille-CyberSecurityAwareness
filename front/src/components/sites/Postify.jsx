// Postify.jsx
import React, { useState, useEffect } from 'react';
import styles from './Postify.module.css';
import { useGameContext } from "../../Contexts/GameContext";
import PostifyAuth from './PostifyAuth';
import { useEventLog } from '../../Contexts/EventLogContext';

const initialPosts = [
  {
    id: 1,
    name: 'TechDepo Resmi Hesabı',
    time: '30 dakika önce',
    avatar: '/techDepo/techHome.png',
    image: '/techDepo/afiş.png', // ✅ Kullanacağımız görsel
    content: (
      <span>
        <b>🚀 TechDepo İle Alışverişte Devrim Başladı!</b><br/><br/>
        En yeni teknolojiler, en güvenli alışveriş deneyimiyle TechDepo’da seni bekliyor!<br/><br/>
        💻 Laptoplar, 🎮 Oyuncu ekipmanları, 🎧 Kulaklıklar ve daha fazlası %30’e varan indirimlerle!<br/><br/>
        🎯 Güvenli ödeme seçenekleri, hızlı kargo ve 7/24 destek garantisi!<br/><br/>
        ✨ Şimdi alışverişe başla!<br/><br/>
        👉 <a
              href="#"
              title="http://tech-depo.com"
              className={styles.officialLink}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-browser-url", { detail: "http://tech-depo.com" })
                );
              }}
            >
              tech-depo.com
            </a>
      </span>
    ),
    likes: 310,
    commands: 95,
    privacySettings: "Herkese Açık",
  },
  
  {
    id: 2,
    name: 'IT Departmanı',
    time: '5 saat önce',
    avatar: '/avatars/avatar2.png',
    image: '/SpamMailPictures/fake-product.png',
    content: (
      <span>
        <b>Yepyeni formülümüzle tanışmaya hazır olun! </b><br/><br/>
            Vücut metabolizmasını hızlandıran ve yağ yakımını maksimum seviyeye çıkaran ürünümüzle yalnızca 7 gün içinde 10 kilo verebilirsiniz. 
            Bilimsel olarak kanıtlanmış içeriklerle geliştirilen bu ürün tamamen doğaldır ve herhangi bir yan etkisi yoktur.<br/>
            Etkisini görmek için hemen sipariş verin! <br/> 
        <a href="#" title='http://healthtips.com/track/#888%465677&&3' className={styles.maliciousLink}>HealthTips.com</a>
      </span>
    ),
    likes: 70,
    commands: 30,
    privacySettings: "Sadece Bağlantılarım",
  },
  {
    id: 3,
    name: 'Personel İşleri',
    time: '1 gün önce',
    avatar: '/avatars/avatar3.png',
    content: (
      <span>
        Yeni çalışanlara özel yemek kartı için kayıt olun: 
        <a href="#" className={styles.phishingLink} onClick={() => alert('Kimlik bilgilerin çalındı!')}>kaydolunburaya.com</a>
      </span>
    ),
    likes: 500,
    commands: 120,
    privacySettings: "Herkese açık",
  },
  {
    id: 4,
    name: 'Zeynep Güler',
    time: '3 saat önce',
    avatar: '/avatars/avatar5.png',
    content: 'Bugün öğle yemeği efsaneydi! Şefin yaptığı köri soslu tavuk efsane olmuş 👨‍🍳🍛',
    likes: 94,
    commands: 16,
    privacySettings: "Herkese açık",
  },
  {
    id: 5,
    name: 'Murat Yılmaz',
    time: '10 dakika önce',
    avatar: '/avatars/avatar7.png',
    image: '/SpamMailPictures/gift.jpg',
    content: (
      <span>
        Katkı sağladığınız çekilişimizi kazanmış bulunmaktasınız. Bir iPhone 15 Pro Max kazandınız! 🎉📱 <br/> Hediyenizi talep etmek için tıklayın!
        <a href="#"  title='rewarsd@winbig.com' className={styles.phishingLink}> Hediyeniz Sizi Bekliyor!</a>
      </span>
    ),
    likes: 212,
    commands: 34,
    privacySettings: "Herkese açık",
  },
  {
    id: 6,
    name: 'HR Departmanı',
    time: '6 gün önce',
    avatar: '/avatars/avatar4.png',
    content: 'Pazartesi günü için planlanan eğitim semineri saat 14:00’te başlayacaktır. Katılım zorunludur.',
    likes: 45,
    commands: 10,
    privacySettings: "Sadece Bağlantılarım",
  },
  {
    id: 7,
    name: 'Mehmet Demir',
    time: '15 dakika önce',
    avatar: '/avatars/avatar6.png',
    image: '/SpamMailPictures/workingHome.png',
    content: (
      <span>
        <b>Evden Çalışarak Ayda 50.000 TL Kazanın! </b><br/> 
        Yeni geliştirdiğimiz sistemle, yalnızca günde 1-2 saat çalışarak ayda 50.000 TL kazanabilirsiniz.<br/>
        Bu fırsatı kaçırmayın! <br/>
        <a href="#" title='http://careeroptionsnow.com/c/&1118#46567^#^3&3' className={styles.maliciousLink}>Hızlıca kaydolun!</a><br/>
      </span>
    ),
    likes: 188,
    commands: 27,
    privacySettings: "Herkese açık",
  },
  {
    id: 8,
    name: 'Gülce Aksoy',
    time: '1 saat önce',
    avatar: '/avatars/avatar8.png',
    content: 'Sabah kahvesi = odaklanma süper gücü ☕🚀',
    likes: 64,
    commands: 11,
    privacySettings: "Herkese açık",
  },
  {
    id: 9,
    name: 'Network Takımı',
    time: '4 gün önce',
    avatar: '/avatars/avatar11.png',
    content: 'Sunucu bakım çalışması cuma gecesi 00:00 - 03:00 arası gerçekleştirilecektir.',
    likes: 39,
    commands: 7,
    privacySettings: "Sadece Bağlantılarım",
  },
  {
    id: 10,
    name: 'Tuğba Yıldız',
    time: '2 saat önce',
    avatar: '/avatars/avatar13.png',
    content: 'Bu aralar AI projeleriyle ilgileniyorum. Midjourney ile bazı görseller denedim, çok ilham verici!',
    likes: 123,
    commands: 20,
    privacySettings: "Herkese açık",
  },
];

const getRelativeTime = (timestamp) => {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Şimdi';
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
};

const Postify = () => {
  const { PostifyInfo, setPostifyInfo } = useGameContext();
  const { addEventLog, addEventLogOnChange } = useEventLog();

  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);

  // Mesajlar için gerekli state'ler
  const [showMessages, setShowMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  
  const [posts, setPosts] = useState(initialPosts);
  const [likes, setLikes] = useState(() => {
    const initial = {};
    initialPosts.forEach((post) => {
      initial[post.id] = {
        count: post.likes,
        liked: false,
      };
    });
    return initial;
  });

  
  const showTemporaryError = (msg) => {
    setError(msg);
    setTimeout(() => {
      showTemporaryError("");
    }, 2000);
  };

  const [newPostContent, setNewPostContent] = useState('');
  const [timestamps, setTimestamps] = useState({});

  const toggleLike = (postId) => {
    setLikes((prev) => {
      const currentCount = prev[postId]?.count || 0;
      const isLiked = PostifyInfo.likedPosts?.includes(postId) || false;
      return {
        ...prev,
        [postId]: {
          count: isLiked ? currentCount - 1 : currentCount + 1,
          liked: !isLiked,
        },
      };
    });

    setPostifyInfo((prev) => {
      const alreadyLiked = prev.likedPosts?.includes(postId);
      return {
        ...prev,
        likedPosts: alreadyLiked
          ? prev.likedPosts.filter((id) => id !== postId) 
          : [...(prev.likedPosts || []), postId]           
      };
    });
  };

  const handlePostShare = () => {
    if (newPostContent.trim() === '') return;
    const timestamp = Date.now();
    const newPost = {
      id: timestamp,
      name: PostifyInfo.name || 'Sen',
      time: timestamp,
      avatar: '/avatars/avatar9.png',
      content: newPostContent,
      likes: 0,
      commands: 0,
      privacySettings: PostifyInfo.privacySettings // Burada ayarını alıyoruz
    };
    setPosts([newPost, ...posts]);
    setLikes((prev) => ({ ...prev, [newPost.id]: { count: 0, liked: false } }));
    setTimestamps((prev) => ({ ...prev, [newPost.id]: timestamp }));
    setNewPostContent('');

    // PostifyInfo.userPosts yoksa boş dizi olarak başlat!
    setPostifyInfo({
      ...PostifyInfo,
      userPosts: [newPost, ...(PostifyInfo.userPosts || [])]
    });

    addEventLog({
      type: "create_post",
      questId: "post_share",
      logEventType: "post_share",
      value: 0,
      data: {
        postId: newPost.id,
        content: newPostContent.slice(0, 120), // Çok uzun içeriklerin sadece ilk kısmı
        privacy: PostifyInfo.privacySettings
      }
    });
  };

  const dummyChats = [
    { id: 1, name: "Ahmet Kaya", avatar: "/avatars/avatar1.png", messages: ["Selam!", "Toplantı ne zaman?"] },
    { id: 2, name: "Zeynep Güler", avatar: "/avatars/avatar5.png", messages: ["Merhaba!", "Yarın görüşelim mi?"] },
    { id: 3, name: "IT Departmanı", avatar: "/avatars/avatar2.png", messages: ["Sistemde bakım yapılacak."] },
  ];

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      selectedChat.messages.push(messageText);
      addEventLog({
        type: "send_message",
        questId: null,
        logEventType: "message",
        value: 0,
        data: {
          to: selectedChat.id,
          text: messageText.slice(0, 100)
        }
      });
      setMessageText("");
    }
  };

  // Gizlilik ayarları için fonksiyon
  const selectPrivacy = (option) => {
    setPostifyInfo({
      ...PostifyInfo,
      privacySettings: option
    });
    setShowPrivacyOptions(false);

    addEventLog({
      type: "change_privacy",
      questId: null,
      logEventType: "privacy",
      value: 0,
      data: {
        newPrivacy: option
      }
    });
  };

  const [newPassword, setNewPassword] = useState("");
  const [successPassword, setSuccessPassword] = useState("");

  const isPasswordStrongEnough = (password) => {
      return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(password);
  };

  const handleLogout = () => {
    setPostifyInfo({
      ...PostifyInfo,
      isLoggedIn: false,
    });
    setShowSettings(false);
    addEventLog({
      type: "logout_postify",
      questId: null,
      logEventType: "logout",
      value: 0,
      data: {}
    });
    if(!PostifyInfo.isLoggedIn){
        return <PostifyAuth />;
    }
  };

const handlePasswordUpdate = () => {
      if (!newPassword) return;
  
      if (newPassword.length < 4) {
          showTemporaryError("Şifre en az 4 karakter olmalıdır!");
          return;
      }

      const strong = isPasswordStrongEnough(newPassword);
      setPostifyInfo({
        ...PostifyInfo,
        password: newPassword,
        isPasswordStrong: strong,
      });

      addEventLog({
        type: "update_password",
        questId: null,
        logEventType: "password_update",
        value: strong ? 2 : -2,
        data: {
          isStrong: strong
        }
      });
  
      setSuccessPassword("Şifreniz başarıyla güncellendi!");
      setNewPassword("");
      setTimeout(() => setSuccessPassword(""), 2000);
};
 
  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
          <div className={styles.logo}>Postify</div>
            <input type="text" disabled className={styles.search} placeholder="Ara..." />
            <div className={styles.menu}>
              <span>🔔</span>

                {/* 👇 Avatarın etrafını saran div (position: relative için) */}
                <div className={styles.avatarWrapper}>
                  {/* 👇 Profil fotoğrafı */}
                  <img
                    className={styles.avatar}
                    src="/avatars/avatar6.png"
                    alt="Profil"
                    onClick={toggleUserMenu}
                  />

                  {/* Kullanıcı Paneli */}
                  {PostifyInfo.isLoggedIn && showUserMenu && (
                    <div className={styles.userPanel}>
                      <p className={styles.userName}>👤 {PostifyInfo.name}</p>
                      <button className={styles.settingsButton} 
                      onClick={() => {
                        setShowSettings(true);
                        setShowUserMenu(false);
                      }}>
                        ⚙ Ayarlar
                      </button>
                      <button className={styles.logoutButton} onClick={handleLogout}>Çıkış Yap</button>
                    </div>
                  )}
                </div>
            </div>
          </div>


        {/* Ayarlar Menüsü */}
        {showSettings && (
          <div className={`${styles.settingsMenu} ${showSettings ? styles.active : ""}`}>
            <div className={styles.settingsHeader}>
              <h3>⚙ Kullanıcı Ayarları</h3>
              <span className={styles.closeIcon} onClick={() => setShowSettings(false)}>✖</span>
            </div>
            <p>📧 E-posta: {PostifyInfo.email}</p>
            <p>📷 Profil Fotoğrafı: <button className={styles.profilePictureButton}>Değiştir</button></p>
            <p>📱 Telefon Numarası:</p>
            <input type="text" value={PostifyInfo.phone} disabled />

            <p>🔒 Hesap Gizliliği (Hesabın kimlere açık?):</p>
            <select
              value={PostifyInfo.accountPrivacy}
              onChange={e => setPostifyInfo({ ...PostifyInfo, accountPrivacy: e.target.value })}
              className={styles.privacyDropdown}
            >
              <option value="Herkese Açık">🌐 Herkese Açık</option>
              <option value="Sadece Bağlantılarım">👥 Sadece Bağlantılarım</option>
              <option value="Gizli">🔒 Gizli</option>
            </select>

            <div>
              <p>🔐 Parola Güncelle:</p>
              <input
                type="password"
                placeholder="Yeni şifrenizi giriniz:"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {successPassword && <p className={styles.successMessage}>{successPassword}</p>}
              {error && <p className={styles.errorMessage}>{error}</p>}

              <button onClick={handlePasswordUpdate}>Güncelle</button>
              <p>📢 Bildirimler: <button>Değiştir</button></p>
            </div>

            <button
              className={styles.twoFAButton}
              onClick={() => {
                const newValue = !PostifyInfo.is2FAEnabled; // Yeni değeri belirle
                setPostifyInfo({
                  ...PostifyInfo,
                  is2FAEnabled: newValue,
                });
                addEventLogOnChange(
                  "toggle_2fa",
                  "state",
                  newValue,
                  {
                    type: "toggle_2fa",
                    questId: "register_career_site", // Gerekirse değiştir
                    logEventType: "2fa",
                    value: newValue ? 5 : -5,
                    data: {
                      for: "Postify",
                      state: newValue,
                    }
                  }
                );
              }}
            >
              {PostifyInfo.is2FAEnabled ? "2FA Kapat" : "2FA Aç"}
            </button>

          </div>
        )}

        <div className={styles.body}>
          {showMessages ? (
            <div className={styles.messages}>
              <button className={styles.button} onClick={() => setShowMessages(false)}>🔙 Geri</button>

                <div className={styles.messagesWrapper}>
                  {/* Sol sohbet listesi */}
                  <div className={styles.chatList}>
                    <h4>Mesajlar</h4>
                    {dummyChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`${styles.chatUser} ${selectedChat?.id === chat.id ? styles.activeChat : ""}`}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <img src={chat.avatar} alt={chat.name} />
                        <span>{chat.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sağ sohbet alanı */}
                  <div className={styles.chatBox}>
                    {selectedChat ? (
                      <>
                        <div className={styles.chatHeader}>
                          <img src={selectedChat.avatar} alt={selectedChat.name} />
                          <strong>{selectedChat.name}</strong>
                        </div>
                        <div className={styles.chatMessages}>
                          {selectedChat.messages.map((msg, index) => (
                            <div key={index} className={styles.chatBubble}>{msg}</div>
                          ))}
                        </div>
                        <div className={styles.chatInput}>
                          <input
                            type="text"
                            placeholder="Mesaj yaz..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          />
                          <button onClick={handleSendMessage}>Gönder</button>
                        </div>
                      </>
                      ) : (
                        <p>Bir sohbet seçin.</p>
                      )}
                    </div>
                  </div>
                </div>
          ) : (
            <>
              <div className={styles.sidebar}>
                <ul>
                  <li>📄 Profilim</li>
                  <li>💬 Mesajlar</li>
                  <li>👥 Takip</li>
                  <li>🧑‍💼 Gruplar</li>
                  <li>📅 Etkinlikler</li>
                </ul>
                <h4>Sponsorlu</h4>
                <p>Yeni güvenlik rehberimize göz atın!</p>
                <hr />
                <h4>Popüler Gruplar</h4>
                <div className={styles.groups}>
                  <label>👩‍💻 Kadınlar İçin Teknoloji</label>
                  <label>💻 Yazılım Ekibi</label>
                  <label>🔒 Güvenlik Farkındalığı</label>
                  <label>🎨 Tasarım Dünyası</label>
                </div>
              </div>

              <div className={styles.feed}>
                <div className={styles.shareBox}>
                  <textarea
                    placeholder="Ne düşünüyorsun?"
                    className={styles.input}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  ></textarea>

                  <div className={styles.privacySelector}>
                    <button onClick={() => setShowPrivacyOptions(!showPrivacyOptions)}>
                      {PostifyInfo.privacySettings} 🔽
                    </button>

                    {showPrivacyOptions && (
                      <ul className={styles.privacyMenu}>
                        <li onClick={() => selectPrivacy("Herkese Açık")}>🌐 Herkese Açık</li>
                        <li onClick={() => selectPrivacy("Sadece Bağlantılarım")}>👥 Sadece Bağlantılarım</li>
                        <li onClick={() => selectPrivacy("Gizli")}>🔒 Gizli</li>
                      </ul>
                    )}
                  </div>
                  <button className={styles.button} onClick={handlePostShare}>Paylaş</button>
                </div>

                {posts.map((post) => {
                // Her post için burda hesapla:
                const isLiked = PostifyInfo.likedPosts?.includes(post.id);

                let displayLikeCount = post.likes;
                if (isLiked) {
                  displayLikeCount = (post.likes + 1);
                } else {
                  displayLikeCount = post.likes;
                }

                return (
                  <div key={post.id} className={styles.card}>
                    <div className={styles.header}>
                      <img src={post.avatar} className={styles.avatar} alt="user" />
                      <div>
                        <div className={styles.name}>{post.name}</div>
                        <div className={styles.time}>
                          {typeof post.time === 'number' ? getRelativeTime(post.time) : post.time}
                          <p className={styles.privacy}>{post.privacySettings}</p>
                        </div>
                      </div>
                    </div>
                     {post.image && (
                        <img src={post.image} className={styles.image} alt="paylaşım görseli" />
                      )}
                    <div className={styles.content}>{post.content}</div>
                    <div className={styles.metaInfo}>
                      <span>👍 {displayLikeCount}</span>
                      <span>💬 {post.commands}</span>
                      <span>📤 Paylaş</span>
                    </div>

                    <div className={styles.actions}>
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={isLiked ? styles.likedButton : ''}
                      >
                        {isLiked ? '💙 Beğenildi' : '👍 Beğen'}
                      </button>
                      <button>💬 Yorum Yap</button>
                    </div>
                  </div>
                );
              })}
              </div>

              <div className={styles.rightExtras}>
                <div className={styles.securityTips}>
                  <h4>🔐 Güvenlik İpuçları</h4>
                  <ul>
                    <li>🔸 Gelen bağlantıları tıklamadan önce kontrol et.</li>
                    <li>🔸 Kişisel bilgilerini paylaşmadan önce emin ol.</li>
                    <li>🔸 “.exe” uzantılı dosyalar kötü amaçlı olabilir.</li>
                  </ul>
                </div>

                <div className={styles.onlineUsers}>
                  <h4>🟢 Aktif Kullanıcılar</h4>
                  <div className={styles.userList}>
                    <img src="/avatars/avatar4.png" alt="user" />
                    <img src="/avatars/avatar5.png" alt="user" />
                    <img src="/avatars/avatar7.png" alt="user" />
                  </div>
                </div>

                <div className={styles.trending}>
                  <h4>🔥 Gündemdekiler</h4>
                  <ul>
                    <li>#SiberGüvenlik2025</li>
                    <li>#YeniÇalışanlar</li>
                    <li>#OfisNetworkSorunu</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

    </div>
  );
};

export default Postify;