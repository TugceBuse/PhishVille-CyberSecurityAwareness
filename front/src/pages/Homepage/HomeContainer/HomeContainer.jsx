import React from "react";
import { useRef } from "react";
import WorkSpaceModel from "./WorkSpaceModel";
import "./homeContainer.css";

const HomeContainer = ({ scrollTo }) => {
  // Başlık referansları
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const feedbackRef = useRef(null);

  // Dışarıdan scroll talebi gelirse
  React.useEffect(() => {
    if (scrollTo === "about" && aboutRef.current)
      aboutRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (scrollTo === "contact" && contactRef.current)
      contactRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (scrollTo === "feedback" && feedbackRef.current)
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTo]);

  return (
      <div className="moving-background">
           
        {/* Bilgilendirme Kısmı */}
        <div className="FirstPart">
          <div className="canvas-section">
            <WorkSpaceModel />
          </div>

          <div className="line"></div>

          <div className="text-section">
            <h1>Hoş Geldiniz!</h1>
            <h3>Bu simülasyon, bilgi güvenliği farkındalığınızı artırmak, </h3> 
            <h3>olası siber saldırılara karşı sizi hazırlamak amacıyla tasarlanmıştır. </h3>
            <h3>Dijital ortamda karşılaşabileceğiniz tehditler ve </h3>
            <h3>hatalarla ilgili çeşitli senaryolarla kendinizi test edebilir, doğru güvenlik alışkanlıkları kazanabilirsiniz.</h3>
            <h4>Başlamak için “Simülasyonu Başlat” butonuna tıklayınız.</h4>
          </div>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <h3>🎣 Phishing Nedir?</h3>
            <p>Kötü niyetli kişiler sahte e-postalarla sizi kandırarak şifrelerinizi ele geçirmeye çalışır.</p>
          </div>

          <div className="info-card">
            <h3>🛡 Güçlü Parola Oluştur</h3>
            <p>Uzun, karmaşık ve tahmin edilmesi zor parolalar kullanmak hesabınızı korur.</p>
          </div>

          <div className="info-card">
            <h3>⚠ Güncellemeleri Aksatma</h3>
            <p>Sistem güncellemeleri güvenlik açıklarını kapatır. İhmal etme.</p>
          </div>

          <div className="info-card">
            <h3>📁 Bilinmeyen Dosyalara Dikkat</h3>
            <p>Tanımadığın kişilerden gelen eklere asla tıklama. Virüs olabilir!</p>
          </div>

          <div className="info-card">
            <h3>🔐 İki Faktörlü Kimlik Doğrulama</h3>
            <p>Parolanıza ek olarak SMS veya uygulama ile gelen doğrulama kodunu kullanarak hesap güvenliğinizi ikiye katlayın.</p>
          </div>

          <div className="info-card">
            <h3>🌐 Sahte Siteleri Tanı</h3>
            <p>Gerçek gibi görünen sahte siteler, giriş bilgilerinizi çalmak için tasarlanmıştır. URL’yi dikkatle kontrol edin.</p>
          </div>
          <div className="info-card">
            <h3>🛠 Sahte Güncellemelere Dikkat</h3>
            <p>Saldırganlar, sahte sistem güncellemeleriyle cihazınıza zararlı yazılım yüklemeye çalışabilir. Yalnızca resmi kaynakları kullanın.</p>
          </div>
        </div>

        {/* === Ekstra Bilgi Başlıkları === */}
        <div className="extra-section">
          <h2 ref={aboutRef} className="section-title">Hakkımda</h2>
          <p>
            Merhaba, biz "Bilgisayar Mühendisliği" son sınıf öğrencisiyiz ve yazılım geliştirme ile siber güvenlik alanlarına özel bir ilgi duyuyoruz.
            <br /><br />
            “PhishVille” projesi, kullanıcıların gerçekçi bir simülasyon ortamında bilgi güvenliği farkındalığını artırmayı amaçlayan bir mezuniyet ve araştırma projesidir.
            Modern web teknolojileriyle, klasik testlerden farklı olarak tamamen etkileşimli bir bilgisayar deneyimi sunuyoruz. Amacım; teknik bilginin ötesine geçip, herkesin günlük hayatta karşılaşabileceği siber tehditleri eğlenceli ve öğretici senaryolarla göstermek.
            <br /><br />
            Kendi öğrenim yolculuğumuzda güvenlik alanında sürekli kendimizi geliştiriyor, yenilikçi ve topluma fayda sağlayan projeler üretmeye çalışıyoruz.
          </p>

          <h2 ref={contactRef} className="section-title">İletişim</h2>
          <p>
            Görüş, öneri veya iş birliği için bize aşağıdaki kanallardan ulaşabilirsin:
            <ul style={{ marginLeft: 24, marginTop: 4 }}>
              <li>
                <b>Tugçe Buse ERGÜN E-posta:</b> <a href="mailto:1030521057@erciyes.edu.tr" style={{ color: '#60a5fa' }}>1030521057@erciyes.edu.tr</a>
              </li>
              <li>
                 <b> Ahmet KARAKÖSE E-posta:</b> <a href="mailto:1030521012@erciyes.edu.tr" style={{ color: '#60a5fa' }}>1030521012@erciyes.edu.tr</a>
              </li>           
            </ul>
            <ul style={{ marginLeft: 24, marginTop: 4 }}>
              <li>
                <b>Tugçe Buse ERGÜN GitHub:</b> <a href="https://github.com/TugceBuse" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>https://github.com/TugceBuse</a>
              </li>
              <li>
                <b>Ahmet KARAKÖSE GitHub:</b> <a href="https://github.com/Ahmetkrks" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>https://github.com/Ahmetkrks</a>
              </li>        
            </ul>
          </p>
         

          {/* <h2 ref={feedbackRef} className="section-title">Görüşler</h2>
          <p>
            Simülasyonun gelişmesi için <b>görüş, öneri veya karşılaştığın herhangi bir hata</b> varsa aşağıya yazabilirsin.
            <br /><br />
            <i>Senin deneyimin ve geri bildirimin, PhishVille’in daha faydalı ve etkili bir hale gelmesinde çok değerli.</i>
          </p> */}
          {/* Dilersen basit bir input ve butonla görüş bırakma kutusu ekleyebilirsin: */}
          {/* <form style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
            <textarea placeholder="Görüşünüzü buraya yazın..." rows={3} style={{ borderRadius: 8, padding: 10, resize: "vertical" }} />
            <button type="submit" className="a" style={{ width: "fit-content", alignSelf: "flex-end" }}>Gönder</button>
          </form> */}
        </div>
   </div>
  );
};

export default HomeContainer;