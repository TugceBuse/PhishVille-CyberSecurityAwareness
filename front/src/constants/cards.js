const cards = [
  {
    id: 1,
    name: "UltraBook X200",
    price: "22999",
    image: "/techDepo/computer1.jpg",
    description: "Yüksek performanslı, taşınabilir iş bilgisayarı.",
    seller: "TechDepo Bilgisayar",
    comments: [
      "Gerçekten çok hızlı, özellikle yazılım geliştirme için mükemmel.",
      "Klavye biraz küçük ama taşınabilirlik harika."
    ]
  },
  {
    id: 2,
    name: "LiteBook 14 Laptop",
    price: "18499",
    image: "/techDepo/computer2.jpg",
    description: "Hafif ve taşınabilir yapısıyla günlük işler için ideal laptop.",
    seller: "Dijitek",
    comments: [
      "Ofis işleri için yeterli, taşımak çok kolay.",
      "Ekran parlaklığı biraz düşük ama f/p ürünü."
    ]
  },
  {
    id: 3,
    name: "SilentClick Mouse",
    price: "319",
    image: "/techDepo/mouse1.jpg",
    description: "Sessiz tıklama özelliğiyle ofis kullanımı için ideal ergonomik fare.",
    seller: "MouseLine Teknoloji",
    comments: [
      "Sessiz çalışıyor, iş yerinde çok işe yarıyor.",
      "Tıklama hissi yumuşak ama alışmak zaman aldı."
    ]
  },
  {
    id: 4,
    name: "NeonMouse RGB",
    price: "479",
    image: "/techDepo/mouse2.jpg",
    description: "RGB aydınlatmalı, yüksek hassasiyetli oyuncu faresi.",
    seller: "GamerX Donanım",
    comments: [
      "FPS oyunları için çok iyi, ışıkları da çok şık.",
      "Tuş konumu biraz alışılmışın dışında ama güzel."
    ]
  },
  {
    id: 5,
    name: "DeepSound Kulaklık",
    price: "689",
    image: "/techDepo/head1.jpg",
    description: "Gelişmiş mikrofonlu, kulak çevreleyen tasarım.",
    seller: "SesUzmanı Elektronik",
    comments: [
      "Mikrofon kalitesi çok iyi, toplantılar için birebir.",
      "Kulak yastıkları rahat ama biraz sıcak tutuyor."
    ]
  },
  {
    id: 6,
    name: "Compact Bass Kulaklık",
    price: "729",
    image: "/techDepo/head2.jpg",
    description: "Kablosuz bağlantılı, yüksek bas destekli kulaklık.",
    seller: "TechDepo Kulaklık",
    comments: [
      "Bluetooth bağlantısı stabil.",
      "Baslar oldukça güçlü, müzik keyfi yüksek."
    ]
  },
  {
    id: 7,
    name: "SlimBook i7 Laptop",
    price: "26499",
    image: "/techDepo/computer3.jpg",
    description: "Gün boyu pil ömrü sunan ultra ince dizüstü bilgisayar.",
    seller: "NotebookCenter",
    comments: [
      "Şarjı uzun gidiyor, performansı da çok iyi.",
      "Fan sesi neredeyse yok, çok sessiz çalışıyor."
    ]
  },
  {
    id: 8,
    name: "OfficeMate Laptop",
    price: "17999",
    image: "/techDepo/computer4.jpg",
    description: "Günlük kullanım ve ofis işleri için ideal laptop.",
    seller: "TechDepo Resmi Satıcısı",
    comments: [
      "Fiyatına göre başarılı.",
      "Klavyesi ergonomik ama ekran yansımalı."
    ]
  },
  {
    id: 9,
    name: "Surround Kulaklık",
    price: "899",
    image: "/techDepo/head3.jpg",
    description: "7.1 surround destekli oyun kulaklığı.",
    seller: "SesMaster",
    comments: [
      "Oyunlarda ses yönü harika.",
      "Kablo biraz uzun ama sağlam."
    ]
  },
  {
    id: 10,
    name: "FlexFit Kulaklık",
    price: "599",
    image: "/techDepo/head4.jpg",
    description: "Katlanabilir, hafif yapıda taşınabilir kulaklık.",
    seller: "Mobil Aksesuarlar",
    comments: [
      "Katlanabilir oluşu çantada taşıma açısından çok avantajlı.",
      "Ses kalitesi fiyatına göre iyi."
    ]
  },
  {
    id: 11,
    name: "ProRGB Klavye",
    price: "749",
    image: "/techDepo/key3.jpg",
    description: "RGB aydınlatmalı sessiz tuşlu klavye.",
    seller: "GameType",
    comments: [
      "Tuşlar sessiz, RGB çok canlı.",
      "Malzeme kalitesi harika."
    ]
  },
  {
    id: 12,
    name: "SilentBoard Klavye",
    price: "599",
    image: "/techDepo/key4.jpg",
    description: "Geceleri sessiz çalışma için optimize edilmiş klavye.",
    seller: "OfisPlus",
    comments: [
      "Tuş sesi neredeyse yok, gece rahatça kullanılıyor.",
      "Tuşlar yumuşak ve ergonomik."
    ]
  },
  {
    id: 13,
    name: "QuickMouse Lite",
    price: "289",
    image: "/techDepo/mouse3.jpg",
    description: "Kompakt ve ergonomik kablosuz fare.",
    seller: "MouseLine Teknoloji",
    comments: [
      "Küçük boyutu sayesinde rahat taşınıyor.",
      "Pil ömrü çok uzun."
    ]
  },
  {
    id: 14,
    name: "ErgoMouse X",
    price: "449",
    image: "/techDepo/mouse4.jpg",
    description: "Elde kaymayı önleyen özel yüzeye sahip fare.",
    seller: "TechDepo Donanım",
    comments: [
      "Kaymaz yüzeyi gerçekten etkili.",
      "Uzun süreli kullanımda bile el yormuyor."
    ]
  },
  {
    id: 15,
    name: "JetPrint 220 Yazıcı",
    price: "4899",
    image: "/techDepo/printer1.jpg",
    description: "Renkli baskı destekli çok işlevli yazıcı.",
    seller: "BaskıMarket",
    comments: [
      "Kurulumu kolay, yazıcı hızı yeterli.",
      "WiFi özelliği çok pratik."
    ]
  },
  {
    id: 16,
    name: "TabOne 10.1\" Tablet",
    price: "5499",
    image: "/techDepo/tablet1.jpg",
    description: "Geniş ekranlı, uzun pil ömürlü Android tablet.",
    seller: "MobilTek",
    comments: [
      "Ekranı çok net, dersler için aldım gayet yeterli.",
      "Bataryası uzun süre gidiyor."
    ]
  },
  {
    id: 17,
    name: "EduTab 8\" Tablet",
    price: "3199",
    image: "/techDepo/tablet2.jpg",
    description: "Öğrenciler için optimize edilmiş taşınabilir tablet.",
    seller: "EduTeknoloji",
    comments: [
      "Çocuğum için aldım, çok memnunuz.",
      "Ders videoları ve temel uygulamalar için ideal."
    ]
  }
];

export default {cards};