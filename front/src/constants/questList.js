// Quest şeması (dokümantasyon)
// {
//   id: string,                         // unique quest id
//   title: string,                      // başlık
//   description: string,                // açıklama
//   status: "locked" | "active" | "completed" | "failed" | "completed_hidden" | "skipped",
//   // --- BAĞIMLILIKLAR ---
//   // Geriye uyumluluk için korunur (başarı şartı gibi davranır):
//   // requires: string[],              
//   // Yeni alanlar:
//   requiresAll?: string[],             // BAŞARI şartı: Hepsi completed olmalı
//   requiresAny?: string[],             // BAŞARI/BAŞARISIZLIK: En az biri tamamlanmış (any outcome) olmalı
//
//   // --- AÇILMA DAVRANIŞI ---
//   // Geriye uyumluluk için korunur (başarı açılımı gibi davranır):
//   // unlocks: string[],               
//   // Yeni alanlar:
//   unlocksOnSuccess?: string[],        // Bu görev başarıyla biterse açılacaklar
//   unlocksOnFail?: string[],           // Bu görev başarısız olursa açılacaklar
//
//   // --- GÖRÜNÜRLÜK & ERKEN TAMAMLAMA ---
//   visibility?: "auto" | "visible" | "hidden", // hidden = UI’da görünmez ama tetiklenebilir
//   acceptsEarlyCompletion?: boolean,   // Görünmeden tamamlanmasına izin ver (default: true gibi kullanacağız)
//   optional?: boolean,                 // Yan görev (fail/skipped ana akışı tıkamasın)
//
//   // --- PUANLAMA & LOG ---
//   point: number,                      // başarıyla tamamlanınca verilen puan
//   penalty: number,                    // yanlış/başarısız olursa verilecek ceza puanı
//   logEventType: string,               // event log tipi
// }

const QUEST_LIST = [
  {
    id: "wifi_connect",
    title: "WiFi Bağlantısı",
    description: "Maillerini görebilmek ve gerekli uygulamaları indirebilmek için bir WiFi ağına bağlan.",
    status: "active",
    // ESKİ: unlocks → BAŞARI DALINDA AÇAR
    unlocks: ["login_mailbox"],
    unlocksOnSuccess: ["login_mailbox"],
    // requires boştu; başarı şartı yok
    requires: [],
    requiresAll: [],
    requiresAny: [],
    visibility: "visible",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 10,
    penalty: -10,
    logEventType: "wifi"
  },

  {
    id: "login_mailbox",
    title: "Mailbox'a Giriş Yap",
    description: "Maillerinizi görebilmek için Mailbox'a phishville hesap bilgilerinizle giriş yapın.",
    status: "locked",
    // ESKİ: unlocks → BAŞARI DALINDA AÇAR
    unlocks: ["download_taskapp"],
    unlocksOnSuccess: ["download_taskapp"],
    // ESKİ: requires → BAŞARI ŞARTI
    requires: ["wifi_connect"],
    requiresAll: ["wifi_connect"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true, // Oyuncu UI görmeden giriş yaparsa completed_hidden olabilsin
    optional: false,
    point: 0,
    penalty: -10,
    logEventType: "mailbox"
  },

  {
    // OPSİYONEL / GİZLİ GÖREV
    id: "antivirus_install",
    title: "Antivirüs Yazılımı Kur",
    description: "Sistemini korumak için bir antivirüs yazılımı indir ve kur.",
    status: "locked",
    unlocks: null,
    unlocksOnSuccess: [],
    unlocksOnFail: [],
    requires: null,       // eski alan
    requiresAll: [],      // başarı şartı yok
    requiresAny: [],      // herhangi bir şart yok
    visibility: "hidden", // UI’da başta görünmesin; kullanıcı kurarsa completed_hidden → completed
    acceptsEarlyCompletion: true,
    optional: true,       // yan görev; ana akışı tıkamasın
    point: 50,
    penalty: 0,
    logEventType: "antivirus"
  },

  {
    id: "download_taskapp",
    title: "TaskApp İndir & Kur",
    description: "Maillerini kontrol et ve sana gönderdiğimiz setup dosyasını indirip TaskApp'i kur.",
    status: "locked",
    unlocks: ["download_cloud", "download_novabank", "download_chatapp"],
    unlocksOnSuccess: ["download_cloud", "download_novabank", "download_chatapp"],
    // ESKİ: requires
    requires: ["login_mailbox"],
    requiresAll: ["login_mailbox"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true, // oyuncu doğrudan dosyayı indirip kurarsa tanıyalım
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "taskapp"
  },

  {
    id: "download_cloud",
    title: "Yedeklemiş Olduğun Dosyaları İndir(Detaylar Açıklamada)",
    description: `Daha önce https://filevault.com sitesini kullanarak yedeklediğin dosyaları 'a92cf10a-27d4-476b-98f3-8d2fa98c7d84' token ile indirip incele.
     Bu dosyalar kişisel bilgiler içermektedir. Güvenli bir şekilde saklamayı unutma!`,
    status: "locked",
    unlocks: ["pdf_viewer_install"],
    unlocksOnSuccess: ["pdf_viewer_install"],
    requires: ["download_taskapp"],
    requiresAll: ["download_taskapp"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "cloud"
  },

  {
    id: "pdf_viewer_install",
    title: "PDF Görüntüleyici İndir",
    description: `Simülasyon boyunca lazım olacak sanal çalışan bilgilerini görüntüleyebilmek için bir PDF görüntüleyici indir.`,
    status: "locked",
    unlocks: ["file_backup"],
    unlocksOnSuccess: ["file_backup"],
    requires: ["download_cloud"],
    requiresAll: ["download_cloud"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "pdf"
  },

  {
    id: "file_backup",
    title: "Dosyalarını Yedekle",
    description: `Olası bir veri kaybına karşı, önemli dosyalarını Browser üzerinden erişebileceğin bir bulut sitesine yedekle.`,
    status: "locked",
    unlocks: null,
    unlocksOnSuccess: [],
    requires: ["pdf_viewer_install", "download_cloud", "save_invoice"],
    // Burada başarı akışı için hepsi gerekli:
    requiresAll: ["pdf_viewer_install", "download_cloud", "save_invoice"],
    // Fakat esneklik istersen ileride bazılarını requiresAny’ye taşıyabilirsin:
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "backup"
  },

  {
    id: "download_novabank",
    title: "Banka Uygulaması Kur",
    description: "Bakiyeni kontrol etmek ve internet alışverişlerini bakiyene göre yapabilmek için bir banka uygulaması kur. (Tarayıcı üzerinden ilgili kelimeleri aratarak bulabilirsin).",
    status: "locked",
    unlocks: ["buy_printer"],
    unlocksOnSuccess: ["buy_printer"],
    requires: ["download_taskapp"],
    requiresAll: ["download_taskapp"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "novabank"
  },

  {
    id: "download_chatapp",
    title: "Mesajlaşma Uygulaması Kur",
    description: "Bir çevrimiçi mesajlaşma uygulaması indirip kur. (Tarayıcı üzerinden ilgili kelimeleri aratarak bulabilirsin).",
    status: "locked",
    unlocks: ["register_career_site", "share_invoice"],
    unlocksOnSuccess: ["register_career_site", "share_invoice"],
    requires: ["download_taskapp"],
    requiresAll: ["download_taskapp"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "chatapp"
  },

  {
    id: "buy_printer",
    title: "Şirket adına bir yazıcı(printer) satın al",
    description:  `Departmandaki raporların çıktısını alabilmek için renkli baskı destekli bir yazıcı satın al.
     (Banka uygulamandan bakiyene bakmayı unutma, maillerinden ya da sosyal medya üzerinden
      fırsatları yakalamayı da ihmal etme! Ne kadar ucuz o kadar iyi...`,
    status: "locked",
    unlocks: ["save_invoice"],
    unlocksOnSuccess: ["save_invoice"],
    requires: ["download_novabank", "download_cloud"],
    requiresAll: ["download_novabank", "download_cloud"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true, // direkt tarayıcıdan alışveriş yaparsa da yakalayalım
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "e-commerce"
  },

  {
    id: "save_invoice",
    title: "Satın alınan yazıcının faturasını kaydet",
    description:  `Satın alınan renkli baskı destekli yazıcının faturasını kaydet.`,
    status: "locked",
    unlocks: ["share_invoice", "file_backup"],
    unlocksOnSuccess: ["share_invoice", "file_backup"],
    requires: ["buy_printer", "download_novabank", "download_cloud"],
    requiresAll: ["buy_printer", "download_novabank", "download_cloud"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "save-invoice"
  },

  {
    id: "share_invoice",
    title: "Satın alınan yazıcının faturasını satış departmanıyla paylaş",
    description:  `Satın alınan renkli baskı destekli yazıcının faturasını Chat uygulaması üzerinden Satış departmanıyla paylaş.`,
    status: "locked",
    unlocks: ["share_cargo_status"],
    unlocksOnSuccess: ["share_cargo_status"],
    requires: ["save_invoice", "buy_printer", "download_novabank", "download_chatapp", "download_cloud"],
    requiresAll: ["save_invoice", "buy_printer", "download_novabank", "download_chatapp", "download_cloud"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "share-invoice"
  },

  {
    id: "share_cargo_status",
    title: "Satın alınan yazıcının kargo durumunu paylaş",
    description:  `Satın alınan renkli baskı destekli yazıcı kargoya verildiğinde, kargo durumunu sana iletilen mail veya sms yoluyla öğren ve Chat uygulaması üzerinden IT departmanıyla paylaş.`,
    status: "locked",
    unlocks: null,
    unlocksOnSuccess: [],
    // Ana akışa sıkı bağlı; ama istersen esneklik için requiresAny ile mail/sms’ten biri yeterli gibi varyantlar eklenebilir.
    requires: ["share_invoice", "save_invoice", "buy_printer", "download_novabank", "download_cloud"],
    requiresAll: ["share_invoice", "save_invoice", "buy_printer", "download_novabank", "download_cloud"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: false,
    point: 20,
    penalty: -20,
    logEventType: "cargo"
  },

  {
    id: "register_career_site",
    title: "Kariyer Sitesine Kayıt Ol",
    description:  `Browser üzerinden bir kariyer sitesine kayıt ol. Bu, şirket içi fırsatları takip edebilmen için önemlidir.`,
    status: "locked",
    unlocks: ["sharing_post"], // (yorumda kapalıydı; aktif etmek istersen burada dursun)
    unlocksOnSuccess: ["sharing_post"],
    requires: ["download_chatapp"],
    requiresAll: ["download_chatapp"],
    requiresAny: [],
    visibility: "auto",
    acceptsEarlyCompletion: true,
    optional: true, // yan görev gibi davranabilir; ana akışı tıkamasın
    point: 20,
    penalty: -20,
    logEventType: "career"
  },

  // Örnek (ileride açmak istersen):
  // {
  //   id: "sharing_post",
  //   title: "Sosyal Medya Üzerinden Paylaşım Yap",
  //   description:  `Şirketin sosyal ağı olan Postify üzerinde yarın yapılacak olan şirket etkinliği için bir paylaşım yap.`,
  //   status: "locked",
  //   unlocks: null,
  //   unlocksOnSuccess: [],
  //   requires: ["register_career_site", "download_chatapp"],
  //   requiresAll: ["register_career_site", "download_chatapp"],
  //   requiresAny: [],
  //   visibility: "auto",
  //   acceptsEarlyCompletion: true,
  //   optional: true,
  //   point: 20,
  //   penalty: -20,
  //   logEventType: "postify"
  // },
];

export { QUEST_LIST };
