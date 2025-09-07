import './Mailbox.css';
import DownloadButton from '../../utils/DownloadButton';
import LinkButton from '../../utils/LinkButton';
import { useTimeContext } from '../../Contexts/TimeContext';

export function createResetPasswordMail({
  email,
  site = "procareerhub",
  siteDisplayName = "ProCareerHub",
  from,
  expireAt,
}) {
  const url = `http://reset/${site}?email=${encodeURIComponent(email)}&expire=${encodeURIComponent(expireAt)}`;

  return (
    <div className="mail-content">
      <pre>
        <b>Merhaba,</b><br/><br/>
        {siteDisplayName} hesabınız için şifre sıfırlama talebinde bulundunuz.<br/><br/>
        Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:<br/><br/>
        <LinkButton
          label="🔁 Şifreyi Sıfırla"
          url={url}
          type="reset"
          logEventType="reset_password"
          questId="reset_password"
          value={0}
          mailId={from?.id}
        />
        <br/><br/>
        Bu bağlantı 10 dakika boyunca geçerlidir.
      </pre>
    </div>
  );
}
 // Kargo maili
    export function createCargoMail({ 
      name, 
      productName, 
      trackingNo, 
      orderNo,       
      shippingCompany, 
      from, 
      title, 
      precontent, 
      isFake = false, 
      fakeOptions = {} 
    }) {
      orderNo = typeof orderNo === "string" ? orderNo : (orderNo !== undefined && orderNo !== null ? String(orderNo) : "");
      const fakeTrackingNo = isFake ? "A3W1" + trackingNo.slice(2) : trackingNo;
      const fakeOrderNo = isFake
        ? (fakeOptions.fakeOrderNo || "A3W1" + (orderNo ? orderNo.slice(2) : Math.floor(100000 + Math.random() * 900000)))
        : orderNo;

      let displayTrackingNo = isFake ? fakeTrackingNo : trackingNo;
      let displayOrderNo = isFake ? fakeOrderNo : orderNo;
      let displayLink;

      const companyString =
        typeof shippingCompany === "string"
          ? shippingCompany
          : (shippingCompany?.name || "Bilinmiyor");

      if (isFake) {
        if (fakeOptions.link) {
          if (fakeOptions.link.includes("?")) {
            if (/trackingNo=/.test(fakeOptions.link)) {
              displayLink = fakeOptions.link.replace(/trackingNo=[^&]+/, `trackingNo=${fakeTrackingNo}`);
            } else {
              displayLink = fakeOptions.link + `&trackingNo=${fakeTrackingNo}`;
            }
          } else {
            displayLink = fakeOptions.link + `?trackingNo=${fakeTrackingNo}`;
          }
        } else {
          displayLink = `http://cargonova-support.xyz/tracking?trackingNo=${fakeTrackingNo}`;
        }
      } else {
        displayLink = `http://${companyString.toLowerCase()}.com/takip?trackingNo=${trackingNo}`;
      }

      const openLinkInBrowser = () => {
        window.dispatchEvent(new CustomEvent("open-browser-url", {
          detail: {
            url: displayLink,
            shippingCompany,
            trackingNo: displayTrackingNo,
            orderNo: displayOrderNo,
          }
        }))
      };

      return (
        <div className="mail-content">
          <pre>
            <b>Sayın {name},</b><br/><br/>
            Sipariş ettiğiniz <b>{productName}</b> {shippingCompany} kargo firmasıyla gönderildi.<br/><br/>
            🚚 <b>Takip No:</b> {displayTrackingNo}<br/>
            🧾 <b>Sipariş No:</b> {displayOrderNo}<br/>
            📦 <b>Kargo Durumu:</b> Yola çıktı - Teslimat 1-2 iş günü içinde gerçekleşecek<br/><br/>
            Paketinizi takip etmek için:<br/>
               <LinkButton
                label="Kargo Takip Sayfasına Git"
                url={displayLink}
                questId= "share_cargo_status"
                type= "share"
                logEventType="share_information"
                value={isFake ? -10 : 10}
                mailId={from?.id}
                shippingCompany={shippingCompany}
                trackingNo={displayTrackingNo}
                orderNo={displayOrderNo}
              />
              <br/><br/>
            <b>{shippingCompany} Ekibi</b>
          </pre>
        </div>
      );
    }



  // Fatura maili
  export function createInvoiceMail({
    name,
    productName,
    invoiceNo,
    orderNo,
    price,
    company,
    tax,
    total,
    from,
    title,
    precontent,
    isFake = false,
    fakeOptions = {},
    mailId // ← Mail id'yi de props ile geçersen daha güvenli olur
}) {
    const fakeInvoiceNo = isFake ? "ZPRT-" + invoiceNo : invoiceNo;

    // Dinamik fatura txt içeriği
    const txtContent = `
      FATURA BİLGİLERİ - ${company}
      ───────────────────────────────
      Fatura Numarası: ${fakeInvoiceNo}
      Sipariş No: ${orderNo}
      Tarih: ${new Date().toLocaleDateString()}
      Müşteri: ${name}
      Ürünler: ${productName}
      Toplam: ${price} TL
      KDV: ${tax} TL
      GENEL TOPLAM: ${total} TL
      ───────────────────────────────
      Bu belge elektronik ortamda düzenlenmiştir.
      ${company} A.Ş.
      `;

    // Dosya adı benzersiz olmalı
    const fileName = `fatura_${orderNo}`;

    // Sahte ve gerçek buton ayrımı
    const faturaButton = isFake
      ? <DownloadButton
          label="🧾 Faturayı PDF olarak indir"
          fileName="sahtefatura"
          fileLabel="TechDepo Fatura - 764213938402"
          fileContent={"Sahte fatura verisi..."}
          mailId={mailId}
        />
      : <DownloadButton
          label="🧾 Faturayı PDF olarak indir"
          fileName={fileName}
          fileContent={txtContent}
          fileLabel={`TechDepo Faturası - ${invoiceNo}`}
          mailId={mailId}
        />;

    return (
      <div className="mail-content">
        <pre>
          <b>Sayın {name},</b><br/><br/>
          {company} üzerinden yaptığınız alışverişe ait fatura bilgileri aşağıdadır.<br/><br/>
          🧾 <b>Fatura Numarası:</b> {fakeInvoiceNo}<br/>
          📦 <b>Sipariş No:</b> {orderNo}<br/>
          📅 <b>Tarih:</b> {new Date().toLocaleDateString()}<br/><br/>
          
          {/* Fatura indirme veya açma butonu */}
          {faturaButton}
          <br/>Bu belge elektronik ortamda düzenlenmiştir.<br/><br/>
          <b>{company} A.Ş.</b><br/>
        </pre>
      </div>
    );
}


  // İndirim kodu maili
  export function createDiscountMail({
    name,
    productName,
    code,
    amount,
    company,
    from,
    title,
    precontent,
    isFake = false,
    fakeOptions = {}
  }) {
    const fakeCode = isFake ? fakeOptions.code || ("ZPRT-" + code) : code;
    const fakeButton = isFake
      ? <button className="claim-button" title={fakeOptions.link || "http://novateccno.net/apply-code"}>💸 İndirimi Uygula</button>
      : null;

    return (
      <div className="mail-content">
        <pre>
          <b>Merhaba {name},</b><br/><br/>
          {productName} için <b>{amount} indirim</b> fırsatını kaçırma!<br/><br/>
          <b>İndirim Kodunuz:</b> <span style={{color:"orange", fontWeight:"bold"}}>{fakeCode}</span><br/><br/>
          Bu kodu ödeme ekranında girerek indirimi hemen kullanabilirsin.<br/><br/>
          {fakeButton}
          <b>{company} Satış Ekibi</b>
        </pre>
      </div>
    );
  }

export const mails = [
    /* 1.Mail Content*/
    {id: 1, from:'support@phishville.com',
      title: 'PhishVille', precontent: `PhishVille'ye Hoşgeldiniz!`, readMail: false, notified: false, used: false,
        content: 
        (
          <div className="mail-content-first">
            <DownloadButton label="TaskAppInstaller.exe" fileName="taskappsetup" mailId={1}/>
            <pre>
                <b>Merhaba,</b><br/><br/>
                🎯 Tebrikler! Dijital güvenlik reflekslerini test etmek ve geliştirmek için <b>PhishVille</b> simülasyonuna giriş yaptın.<br/><br/>
        
                Burada karşına gerçek hayatta karşılaşabileceğin siber tehditler, dolandırıcılık girişimleri ve güvenlik açıkları çıkacak. 
                Amacın: Görevleri başarıyla tamamlayarak tuzaklardan kaçmak ve sistemi güvence altına almak!<br/><br/>
        
                Unutma: Dış görünüş her zaman gerçeği yansıtmayabilir. 😉
                Her tıkladığın bağlantı, her verdiğin bilgi ve her atladığın detay sonuçlarını doğrudan etkileyecek.<br/><br/>
        
                Şimdi kemerlerini bağla, şüpheciliğini kuşan ve oyuna başla! 🚀<br/><br/>
        
                <b>İyi şanslar dileriz,<br/>
                PhishVille Simülasyon Ekibi</b><br/>
            </pre>
          </div>
        )        
       },

   /* 2.Mail Content*/
   {id: 2, from:'support@phisville.com',
    title: 'PhishVille', precontent: `PhishVille'ye Hoşgeldiniz!`, readMail: false, notified: false, used: false,
      content: 
      (
        <div className="mail-content-first">
          <DownloadButton label="TaskAppInstaller.exe" fileName="taskappsetupf" mailId={2}/>
          <pre>
              <b>Merhaba,</b><br/><br/>
              🎯 Tebrikler! Dijital güvenlik reflekslerini test etmek ve geliştirmek için <b>PhisVille</b> simülasyonuna giriş yaptın.<br/><br/>
      
              Burada karşına gerçek hayatta karşılaşabileceğin siber tehditler, dolandırıcılık girişimleri ve güvenlik açıkları çıkacak. 
              Amacın: Görevleri başarıyla tamamlayarak tuzaklardan kaçmak ve sistemi güvence altına almak!<br/><br/>
      
              Unutma: Dış görünüş her zaman gerçeği yansıtmayabilir. 😉
              Her tıkladığın bağlantı, her verdiğin bilgi ve her atladığın detay sonuçlarını doğrudan etkileyecek.<br/><br/>
      
              Şimdi kemerlerini bağla, şüpheciliğini kuşan ve oyuna başla! 🚀<br/><br/>
      
              <b>İyi şanslar dileriz,<br/>
              PhishVille Simülasyon Ekibi</b><br/>
          </pre>
        </div>
      )        
     },
   
   /* 3.Mail Content*/
   {id: 3, from:'rewards@shoppingplus.com',
    title: 'ShoppingPlus', precontent: `-Sadakat Puanlarınızı Hemen Kullanın!`, readMail: false, notified: false, used: false,
     content: 
     (
       <div className="mail-content">
          <pre>
              <b>Merhaba,</b><br/><br/>
              Sadakat programımız sayesinde kazandığınız puanlar kullanılmaya hazır. İndirim kodlarınızı ve özel fırsatları görmek için aşağıdaki karekodu tarayın.<br/><br/>
              <img style={{width:300, height:300, paddingTop:20, paddingBottom:20}} src="./MailPictures/QrCode.png" alt="QrCode Pic"></img><br/>
              <b>Puanların Son Kullanım Tarihi:</b> 31 Aralık 2025<br/>
  
              Bize her alışverişinizde eşlik ettiğiniz için teşekkür ederiz!

              <b>Saygılarımızla,<br/>
              Shopping Plus Ekibi</b><br/>
              
          </pre>
        </div>
     )
    },

   /* 4.Mail Content*/
   {id: 4, from:'no-reply@trustedplatform.com',
   title: 'Trusted Platformu', precontent: `-Üyeliğiniz Başarıyla Oluşturuldu!`, readMail: false, notified: false, used: false,
    content: 
    (
      <div className="mail-content">
          <pre>
              <b>Merhaba,</b><br/><br/>
              Platformumuza hoş geldiniz! Üyeliğiniz başarıyla oluşturuldu. 
              Hesabınızı hemen kullanmaya başlayabilirsiniz.<br/><br/>

              Güvenliğinizi sağlamak için bir sonraki adımda hesabınızı doğrulamanız gerekiyor. Aşağıdaki bağlantıya tıklayarak işlemi kolayca gerçekleştirebilirsiniz:<br/><br/>

              <button className="verify-button"
              title='https://trustedplatform.com/track/123456'
              >Hesabımı Doğrula</button><br/><br/>
              
              Eğer bu işlemi siz başlatmadıysanız veya herhangi bir sorunla karşılaşırsanız, bizimle hemen iletişime geçebilirsiniz.<br/><br/><br/>

              <b>Teşekkürler,<br/><br/>
              Trusted Platform Ekibi</b><br/>
          </pre>
      </div>
    )
   },

   /* 5.Mail Content*/
   {id: 5, from:'brs-yldz@gmail.com',
    title: 'Barış Yıldız', precontent: `-İş Tamamlandı!`, readMail: false, notified: false, used: false,
     content: 
     (
       <div className="mail-content">
          <DownloadButton label="Rapor_2025.docx" fileName="rapor_2025" mailId={5}/>
          <pre>
                Selam, anlaştığımız gibi istediğin işlemi tamamladım. Rapor dosyan ekte!<br/><br/>
                <b>İyi çalışmalar.</b><br/><br/>
          </pre>
       </div>
     )
    },
    /* 6.Mail Content*/
    {id: 6, from:'meeting@corporatehub.com',
      title: 'Corporate Hub', precontent: `-Toplantı Hatırlatması: Proje Güncellemesi`, readMail: false, notified: false, used: false,
       content: 
       (
         <div className="mail-content">
            <pre>
                <b>Değerli Çalışanımız,</b><br/><br/>
                Bu bir toplantı hatırlatma e-postasıdır. Proje güncellemesiyle ilgili detaylar aşağıdaki gibidir:<br/><br/>

                <div className='dots' ></div><b> Tarih:</b> 20 Kasım 2024<br/>
                <div className='dots' ></div> <b>Saat:</b> 10:00<br/>
                <div className='dots' ></div> <b>Yer:</b> Zoom (Link eklidir)<br/>
                <div className='dots' ></div> <b>Konular:</b><br/>
                <p>   1. Proje ilerleme durumu</p>
                <p>   2. Yeni teslim tarihleri</p>
                <p>   3. Risk yönetimi</p><br/>
                
                Katılımınızı onaylamak için lütfen cevap verin veya<span> </span>

                <button className="verify-button" style={{color:"#dfc368"}}
                >Katıl</button> butonuna tıklayın.<br/><br/>
          
                <b>Saygılarımızla,<br/>
                Corporate Hub Ekibi</b><br/>
            </pre>
          </div>
       )
      },
      /* 7.Mail Content*/
    {id: 7, from:'notification@fiberspeed.com',
      title: 'FiberSpeed', precontent: `-Hizmet Bakım Çalışması Bilgilendirmesi.`, readMail: false, notified: false, used: false,
       content: 
       (
         <div className="mail-content">
            <pre>
                <b>Değerli Kullanıcımız,</b><br/><br/>
                Size daha iyi hizmet sunabilmek adına bölgenizde bakım çalışması gerçekleştirilecektir. Çalışmanın detayları aşağıda yer almaktadır:<br/><br/>

                <div className='dots' ></div><b> Tarih:</b> 21 Kasım 2024<br/>
                <div className='dots' ></div> <b>Saat:</b> 01:00 - 05:00<br/>
                <div className='dots' ></div> <b>Etki:</b> İnternet bağlantınızda kısa süreli kesintiler yaşanabilir.<br/>
                
                Hizmetinizden en iyi şekilde faydalanmanız için çalışmaları en kısa sürede tamamlayacağız. Anlayışınız için teşekkür ederiz.

                <b>Saygılarımızla,<br/>
                FiberSpeed Teknik Destek Ekibi</b><br/>
            </pre>
          </div>
       )
      },
      /* 8.Mail Content*/
      {id: 8, from:'noreply@onlinetraining.com',
        title: 'OnlineTraning', precontent: `-Eğitim Sertifikanız Hazır!`, readMail: false, notified: false, used: false,
         content: 
         (
           <div className="mail-content">
              <pre>
                  <b>Değerli Kullanıcımız,</b><br/><br/>
                  Tebrikler! Geçtiğimiz günlerde başarıyla tamamladığınız "Temel Veri Analitiği" eğitiminizin sertifikası hazır. Bu başarıyı elde ettiğiniz için gurur duyuyoruz. Şimdi bu önemli adımınızı onaylayan sertifikayı alabilirsiniz.<br/><br/>
                  Sertifikanızı aşağıdaki bağlantıdan hemen indirebilirsiniz:<br/><br/>
                  
                  Hizmetinizden en iyi şekilde faydalanmanız için çalışmaları en kısa sürede tamamlayacağız. Anlayışınız için teşekkür ederiz.
  
                  <button className="verify-button" style={{color:"#dfc368"}}
                  >Sertifikamı İndir</button><br/><br/>

                  Eğitim sürecinizle ilgili herhangi bir soru veya geri bildirimde bulunmak isterseniz, lütfen bizimle iletişime geçmekten çekinmeyin. Yardımcı olmaktan memnuniyet duyarız.<br/><br/>

                  <b>Saygılarımızla,<br/>
                  Online Eğitim Ekibi</b><br/>
                  <span style={{color:"brown", textDecoration: "underline"}}>OnlineTraining.com</span>
              </pre>
            </div>
         )
        },
        /* 9.Mail Content*/
        {id: 9, from:'security@bankonline.com',
          title: 'BankOnline', precontent: `-Hesap Şifrenizi Güncelleyin`, readMail: false, notified: false, used: false,
           content: 
           (
             <div className="mail-content">
                <pre>  
                    <b>Merhaba,</b><br/><br/>
                    Hesap güvenliğinizi artırmak için BankOnline olarak şifre politikasında önemli bir güncelleme yaptık. 
                    Bu kapsamda, hesabınızın güvende kalmasını sağlamak için yeni bir şifre oluşturmanız gerekmektedir.<br/><br/>
                    
                    <b>Yeni Şifre Oluşturmak İçin:</b><br/>
                    <p>  1. Hesabınıza giriş yapın.</p>
                    <p>  2. “Ayarlar” menüsünden Güvenlik sekmesine gidin.</p>
                    <p>  3. Yeni bir şifre belirleyin ve onaylayın.</p><br/><br/>

                    <b>Dikkat Edilmesi Gerekenler:</b><br/>
                    <div className='dots' ></div> Şifreniz en az 8 karakterden oluşmalı ve büyük harf, rakam, sembol içermelidir.<br/>
                    <div className='dots' ></div> Şifrenizi kimseyle paylaşmayın.<br/><br/>
  
                    Eğer bu talep size ait değilse veya bir şüpheli aktivite fark ettiyseniz, acilen bizimle iletişime geçin:
                    <span style={{color:"orange", cursor:"pointer"}} title='securty@bankonline.com'> Destek Hattımız</span>.<br/><br/> 
  
                    <b>Teşekkürler,<br/>
                    BankOnline Güvenlik Ekibi</b><br/>
                </pre>
              </div>
           )
          },

        /* 10.Mail Content*/
        {id: 10, from:'hr@global-jobs.com',
          title: 'Global Jobs', precontent: `-Özel Bir İş Teklifimiz Var! Size Uygun Pozisyon Açıldı`, readMail: false, notified: false, used: false,
          content: 
          (
            <div className="mail-content">
                <pre>
                    <b>Merhaba,</b><br/><br/>
                    Profesyonel yetenekleriniz ve iş deneyimlerinizle ilgili profilinizi inceledik. Sizden etkilendiğimizi ve ekibimize katılmanızın bizim için büyük bir fırsat olacağını düşündük.<br/><br/>
                    Şu anda sizin uzmanlık alanınıza uygun bir pozisyon için başvurunuzu kabul etmeye hazırız. Pozisyon, büyüme odaklı bir kariyer fırsatı sunarken, yeteneklerinizi en iyi şekilde kullanabileceğiniz bir ortam sağlamayı hedeflemektedir.<br/><br/>
                    
                    <b>Pozisyon Detayları:<br/><br/>
                    <div className='dots' ></div> Pozisyon Adı:</b> Kıdemli Yazılım Uzmanı<br/>
                    <div className='dots' ></div> <b>Lokasyon:</b> Uzaktan Çalışma / Hibrit Model<br/>
                    <div className='dots' ></div> <b>Başlangıç Tarihi:</b> 01/12/2024<br/>
                    <div className='dots' ></div> <b>Maaş Aralığı:</b> Pozisyonla ilgili detayları görmek için tıklayın.<br/><br/>
                    Pozisyonla ilgili ayrıntıları incelemek ve başvuru işleminizi tamamlamak için lütfen aşağıdaki bağlantıya tıklayın:<br/><br/>
      
                    <span style={{color:"orange", textDecoration: "underline", cursor:"pointer"}}
                    title='https://global-jbos.com/track/#45%33'>
                    Pozisyon Detaylarını Gör
                    </span><br/><br/>
                    
                    Başvurunuzu tamamlamak için, lütfen ilgili formu doldurup özgeçmişinizi yükleyiniz. 
                    Bu işlemi 48 saat içerisinde tamamlamanızı rica ediyoruz. 
                    Sürecin sonunda, mülakat davetiyeniz tarafınıza gönderilecektir.<br/><br/>
                    Sorularınız için bizimle 
                    <span style={{color:"orange", textDecoration: "underline"}}>
                      hr@global-jobs.com
                    </span> adresinden iletişime geçebilirsiniz.
      
                    <b>Teşekkürler,<br/><br/>
                    İnsan Kaynakları Departmanı<br/>
                    Global Jobs</b><br/>
                    global-jobs.com<br/>
                  </pre>
            </div>
          )
          },
          /* 11.Mail Content*/
          {id: 11, from:'health@wellcheck.com',
            title: 'WellCheck', precontent: `-Sağlık Testi Sonuçlarınız Hazır: Hemen Kontrol Edin`, readMail: false, notified: false, used: false,
            content: 
            (
              <div className="mail-content">
                  <pre>
                      <b>Merhaba,</b><br/><br/>
                      Geçtiğimiz günlerde yaptırmış olduğunuz sağlık testinin sonuçları sistemimize yüklenmiştir. Sonuçlarınız, daha iyi bir sağlık yönetimi için dikkatle hazırlanmış ve detaylandırılmıştır. Bu önemli bilgileri görmek için lütfen aşağıdaki karekodu tarayın:<br/><br/>
                      
                      <img style={{width:300, height:300, paddingTop:20, paddingBottom:20}} src="./MailPictures/QrCode2.png" alt="QrCode Pic"></img><br/>

                      <b>Sonuçlara Neden Erişmelisiniz?<br/><br/>
                      <div className='dots' ></div> Kişiselleştirilmiş Analiz:</b> Test sonuçlarınız doğrultusunda size özel sağlık önerileri.<br/>
                      <div className='dots' ></div> <b>Acil Durumlar İçin Bilgilendirme:</b> Erken teşhis şansı sağlamak için kapsamlı değerlendirme.<br/>
                      <div className='dots' ></div> <b>Güvenli Erişim:</b> Sonuçlarınıza yalnızca sizin erişiminiz sağlanır.<br/><br/>
                      
                      <b>Önemli Not:</b><br/>
                      Test sonuçlarınıza yalnızca 48 saat içinde erişebilirsiniz. Bu süre zarfında görüntüleme yapılmazsa, veri güvenliği politikamız gereği kayıtlar otomatik olarak sistemden silinecektir.<br/><br/>
        
                      Herhangi bir sorun yaşarsanız veya destek almak isterseniz, müşteri hizmetleri ekibimizle iletişime geçebilirsiniz.<br/><br/>
                      Sağlığınız bizim için önemli!<br/><br/>
        
                      Teşekkürler,<br/>
                     <b>WellCheck Sağlık Ekibi<br/><br/>
                      İletişim:</b><br/>
                      E-posta: 
                      <span 
                      title='support@wellchcek.com ' style={{color:"orange", cursor:"pointer"}}> support@wellcheck.com</span><br/>
                      Telefon: +90 555 123 4567

                    </pre>
              </div>
            )
            },
            /* 12.Mail Content*/
          {id: 12, from:'license@shieldsecure.com',
            title: 'ShieldSecure', precontent: `-Lisans Aktivasyonu Tamamlandı`, readMail: false, notified: false, used: false,
            content: 
            (
              <div className="mail-content">
                  <pre>
                      <b>Merhaba,</b><br/><br/>
                      ShieldSecure antivirüs yazılımını tercih ettiğiniz için teşekkür ederiz! Lisansınız başarıyla etkinleştirilmiştir ve artık tam koruma altındasınız.<br/><br/>
                      
                      <img style={{width:300, height:300, paddingTop:20, paddingBottom:20}} src="./icons/shieldSecure.png" alt="ShieldSecure Pic"></img><br/>

                      <b>Lisans Detaylarınız:<br/><br/>
                      <div className='dots' ></div> Ürün Adı:</b> ShieldSecure Antivirüs<br/>
                      <div className='dots' ></div> <b>Lisans Süresi:</b> 1 Yıl<br/>
                      <div className='dots' ></div> <b>Kullanıcı Sayısı:</b> 1 Cihaz<br/><br/>
                      <div className='dots' ></div> <b>Lisans Anahtarı:</b> ABC1-DEF2-GHI3-JKL4-MNOP<br/><br/>

                      Koruma hizmetinizi başlatmak için uygulamamızı açarak güncellemeleri kontrol edebilir ve ilk taramanızı başlatabilirsiniz.<br/><br/>
        
                      Eğer lisansınızla ilgili herhangi bir sorunuz olursa veya teknik destek almanız gerekirse, bizimle iletişime geçmekten çekinmeyin:<br/><br/>  
        
                      
                    <b> Destek E-posta:</b> support@shieldsecure.com<br/>
                      Telefon: +90 555 123 4567 <br/><br/>
                      Güvende Kalmanız Dileğiyle!<br/>
                      <b>ShieldSecure Ekibi</b>
                    </pre>
              </div>
            )
            },
            /* 13.Mail Content*/
          {id: 13, from:'library@digitalbookshelf.com',
            title: 'DigitalBookShelf', precontent: `-E-kitap Koleksiyonunuz Sizi Bekliyor!`, readMail: false, notified: false, used: false,
            content: 
            (
              <div className="mail-content">
                  <pre>
                      <b>Merhaba,</b><br/><br/>
                      Son favorilerinizden ilham alarak sizin için yeni bir e-kitap koleksiyonu hazırladık. İşte önerilerimiz:<br/><br/>
                      
                      <p>  1. <b>Modern İş Hayatı ve Liderlik</b></p>
                      <p>  2. <b>Veri Bilimi Temelleri</b></p>
                      <p>  3. <b>Klasik Romanlar: Yeniden Keşif</b></p><br/><br/>

                      Bu özel koleksiyonu yalnızca sınırlı bir süre için ücretsiz indirip okuyabilirsiniz. Koleksiyonunuzu keşfetmek için hemen tıklayın:
                      
                      <span 
                      title='library@digitalbookshlef.com ' style={{color:"orange", cursor:"pointer"}}> Koleksiyonumu Görüntüle
                      </span><br/><br/>
                    
                      Kitaplarla dolu bir gün dileriz!<br/>
                      <b>DigitalBookshelf Ekibi</b>
                    </pre>
              </div>
            )
            },
            /* 14.Mail Content*/
          {id: 14, from:'updates@shieldsecure.com',
            title: 'ShieldSecure', precontent: `-Yeni Sürüm: ShieldSecure 2.0!`, readMail: false, notified: false, used: false,
            content: 
            (
              <div className="mail-content">
                  <pre>
                      <b>Merhaba,</b><br/><br/>
                      Antivirüs programımız ShieldSecure’un yeni sürümü artık hazır! İşte 2.0 sürümümüzle gelen yeniliklerden bazıları:<br/><br/>
                      
                      Daha hızlı tarama ve tehdit algılama<br/>
                      <div className='lines' ></div>Gerçek zamanlı koruma özellikleri<br/>
                      <div className='lines' ></div>Tamamen yenilenmiş kullanıcı arayüzü<br/>
                      <div className='lines' ></div>
                      ShieldSecure 2.0’a yükseltmek için: 
                      
                      <span 
                      title='support@wellchcek.com ' style={{color:"orange", cursor:"pointer"}}> Yükseltme İşlemi
                      </span><br/><br/>
                    
                      Sorunsuz bir dijital deneyim dileriz!<br/>
                      <b>ShieldSecure Destek Ekibi</b>
                    </pre>
              </div>
            )
            },

            /* 15.Mail Content*/
          {id: 15, from:'updates@shieldsecure.com',
            title: 'test', precontent: `-Yeni Sürüm: ShieldSecure 2.0!`, readMail: false, notified: false, used: false,
            content: 
            (
              <div className="mail-content">
                  <pre>
                      <b>Merhaba,</b><br/><br/>
                      Antivirüs programımız ShieldSecure’un yeni sürümü artık hazır! İşte 2.0 sürümümüzle gelen yeniliklerden bazıları:<br/><br/>
                      
                      Daha hızlı tarama ve tehdit algılama<br/>
                      <div className='lines' ></div>Gerçek zamanlı koruma özellikleri<br/>
                      <div className='lines' ></div>Tamamen yenilenmiş kullanıcı arayüzü<br/>
                      <div className='lines' ></div>
                      ShieldSecure 2.0’a yükseltmek için: 
                      
                      <span 
                      title='support@wellchcek.com ' style={{color:"orange", cursor:"pointer"}}> Yükseltme İşlemi
                      </span><br/><br/>
                    
                      Sorunsuz bir dijital deneyim dileriz!<br/>
                      <b>ShieldSecure Destek Ekibi</b>
                    </pre>
              </div>
            )
            },

            /* 16.Mail Content*/
            {id: 16, from:'updates@shieldsecure.com',
            title: 'test3', precontent: `-Yeni Sürüm: ShieldSecure 2.0!`, readMail: false, notified: false, used: false,
            content: 
            (
              <div className="mail-content">
                  <pre>
                      <b>Merhaba,</b><br/><br/>
                      Antivirüs programımız ShieldSecure’un yeni sürümü artık hazır! İşte 2.0 sürümümüzle gelen yeniliklerden bazıları:<br/><br/>
                      
                      Daha hızlı tarama ve tehdit algılama<br/>
                      <div className='lines' ></div>Gerçek zamanlı koruma özellikleri<br/>
                      <div className='lines' ></div>Tamamen yenilenmiş kullanıcı arayüzü<br/>
                      <div className='lines' ></div>
                      ShieldSecure 2.0’a yükseltmek için: 
                      
                      <span 
                      title='support@wellchcek.com ' style={{color:"orange", cursor:"pointer"}}> Yükseltme İşlemi
                      </span><br/><br/>
                    
                      Sorunsuz bir dijital deneyim dileriz!<br/>
                      <b>ShieldSecure Destek Ekibi</b>
                    </pre>
              </div>
            )
            },

            /* 17.Mail Content*/
            {id: 17, from:'updates@shieldsecure.com',
              title: 'test4', precontent: `-Yeni Sürüm: ShieldSecure 2.0!`, readMail: false, notified: false, used: false,
              content: 
              (
                <div className="mail-content">
                    <pre>
                        <b>Merhaba,</b><br/><br/>
                        Antivirüs programımız ShieldSecure’un yeni sürümü artık hazır! İşte 2.0 sürümümüzle gelen yeniliklerden bazıları:<br/><br/>
                        
                        Daha hızlı tarama ve tehdit algılama<br/>
                        <div className='lines' ></div>Gerçek zamanlı koruma özellikleri<br/>
                        <div className='lines' ></div>Tamamen yenilenmiş kullanıcı arayüzü<br/>
                        <div className='lines' ></div>
                        ShieldSecure 2.0’a yükseltmek için: 
                        
                        <span 
                        title='support@wellchcek.com ' style={{color:"orange", cursor:"pointer"}}> Yükseltme İşlemi
                        </span><br/><br/>
                      
                        Sorunsuz bir dijital deneyim dileriz!<br/>
                        <b>ShieldSecure Destek Ekibi</b>
                      </pre>
                </div>
              )
              },
                
              /* 18.Mail Content*/
              {id: 18, from:'updates@shieldsecure.com',
                title: 'test2', precontent: `-Yeni Sürüm: ShieldSecure 2.0!`, readMail: false, notified: false, used: false,
                content: 
                (
                  <div className="mail-content">
                      <pre>
                          <b>Merhaba,</b><br/><br/>
                          Antivirüs programımız ShieldSecure’un yeni sürümü artık hazır! İşte 2.0 sürümümüzle gelen yeniliklerden bazıları:<br/><br/>
                          
                          Daha hızlı tarama ve tehdit algılama<br/>
                          <div className='lines' ></div>Gerçek zamanlı koruma özellikleri<br/>
                          <div className='lines' ></div>Tamamen yenilenmiş kullanıcı arayüzü<br/>
                          <div className='lines' ></div>
                          ShieldSecure 2.0’a yükseltmek için: 
                          
                          <span 
                          title='support@wellchcek.com ' style={{color:"orange", cursor:"pointer"}}> Yükseltme İşlemi
                          </span><br/><br/>
                        
                          Sorunsuz bir dijital deneyim dileriz!<br/>
                          <b>ShieldSecure Destek Ekibi</b>
                        </pre>
                  </div>
                )
                },

            /* 19.Mail Content*/
            {id: 19, from:'updates@shieldsecure.com',
              title: 'test4', precontent: `-Yeni Sürüm: ShieldSecure 2.0!`, readMail: false, notified: false, used: false,
              content: 
              (
                <div className="mail-content">
                  <pre>
                      <b>Merhaba Onur,</b><br/><br/>
                      🎯 Tebrikler! Dijital güvenlik reflekslerini test etmek ve geliştirmek için <b>PhishVille</b> simülasyonuna giriş yaptın.<br/><br/>

                      Burada karşına gerçek hayatta karşılaşabileceğin siber tehditler, dolandırıcılık girişimleri ve güvenlik açıkları çıkacak. 
                      Amacın: Görevleri başarıyla tamamlayarak tuzaklardan kaçmak ve sistemi güvence altına almak!<br/><br/>

                      Unutma: Dış görünüş her zaman gerçeği yansıtmayabilir. 😉
                      Her tıkladığın bağlantı, her verdiğin bilgi ve her atladığın detay sonuçlarını doğrudan etkileyecek.<br/><br/>

                      Şimdi kemerlerini bağla, şüpheciliğini kuşan ve oyuna başla! 🚀<br/><br/>

                      <b>İyi şanslar dileriz,<br/>
                      PhishVille Güvenlik Simülasyonu Ekibi</b><br/>
                      <b>İletişim:</b> <span style={{color:"orange", cursor:"pointer"}}>destek@phishville.com</span><br/>
                      <b>Telefon:</b> +90 212 123 4567
                  </pre>
                </div>
              )
              },

            /* 20.Mail Content*/
            {id: 20, from:'IT.Destek@globalbank-support.com',
              title: 'IT Departmanı', precontent: `-Hesabınız Geçici Olarak Askıya Alındı!`, readMail: false, notified: false, used: false,
                content: 
                (
                  <div className="mail-content">
                      <pre>
                          <b>Merhaba Onur,</b><br/><br/>
                          Son yapılan sistem güncellemelerimiz sırasında hesabınızda güvenlik açığı tespit edilmiştir. 
                          Bu nedenle hesabınız geçici olarak askıya alınmıştır. 
                          Hesabınıza yeniden erişebilmeniz için aşağıdaki bağlantıdan giriş yaparak bilgilerinizi güncellemeniz gerekmektedir.<br/><br/>
            
                          Bağlantı: <span style={{color:"orange", textDecoration: "underline", cursor:"pointer"}}>Hesabı Yeniden Etkinleştir!</span><br/><br/>
                          
                          Bu işlemi 24 saat içinde gerçekleştirmezseniz, hesabınız kalıcı olarak kapatılacaktır ve tüm verileriniz silinecektir.
                          E-posta güvenliği politikamız gereğince, bu bağlantının gizliliğini koruyun ve kimseyle paylaşmayın.<br/><br/><br/>
            
                          <b>Teşekkürler,<br/><br/>
                          GlobalBank IT Destek Ekibi</b><br/>
                          <b>E-posta:</b> <span style={{color:"orange", cursor:"pointer"}}>destek@globalbank.com</span><br/>
                          <b>Telefon:</b> +90 212 555 0101
                        </pre>
                  </div>
                )
               },

            /* 21.Mail Content*/
            {id: 21, from:'info@shipmenttracker.com',
              title: 'UPS Kargo Şirketi', precontent: `-Paketiniz Teslim Edilemedi!`, readMail: false, notified: false, used: false,
               content: 
               (
                 <div className="mail-content">
                     <pre>
                         <b>Değerli Müşterimiz,</b><br/><br/>
                         Sizin için hazırlanan gönderimizle ilgili bir teslimat sorunu oluştu. [Order #123456] numaralı siparişiniz teslim edilememiştir. 
                         Bunun temel nedeni, adres bilgilerinizde eksiklik veya yanlışlık olabileceğidir.<br/><br/>
           
                         Teslimat sürecinde yaşanan bu aksaklığı en kısa sürede çözmek ve paketinizi yeniden yönlendirebilmek için lütfen aşağıdaki bağlantıya tıklayarak adres bilgilerinizi doğrulayınız:<br/><br/>
           
                         <span style={{color:"orange", textDecoration: "underline", cursor:"pointer"}}
                         title='https://shipmenttracker.com/track/123456'
                         >Paketimi Güncelle</span><br/><br/>
                         
                         Güncellenen bilgilerle paketinizin yeniden sevkiyatını gerçekleştirebiliriz. Eğer adres doğrulama işlemi gerçekleştirilmezse, gönderinizi teslim edemeyeceğimiz için siparişiniz otomatik olarak 3 iş günü içerisinde iade edilecektir.
           
                         Siparişinizin durumu hakkında anlık bildirim almak ve kargo sürecinizi kesintisiz takip etmek için bilgilerinizi eksiksiz doldurduğunuzdan emin olun.<br/><br/>
           
                         Eğer bu mesajı yanlışlıkla aldıysanız ya da başka bir konuda yardıma ihtiyaç duyuyorsanız, lütfen bizimle iletişime geçmekten çekinmeyin.<br/><br/>
                         Gönderinizin güvenliği ve memnuniyetiniz bizim önceliğimizdir.<br/><br/><br/>
           
                         <b>Teşekkürler,<br/><br/>
                         Kargo Takip Ekibi</b><br/>
                         <b>Info:</b> info@shipmenttracker.com<br/>
                         <b>Info:</b> shipmenttracker.com
                       </pre>
                 </div>
               )
              },
  ];

  // Gönderilen Mailler (SendBox)
  export const sentMails = [
    {
      id: 91,
      from: 'me@myemail.com',
      title: 'Meeting Reminder',
      precontent: 'Reminder: Meeting at 3 PM',
      content: (
        <div className="mail-content">
          <pre>
            <b>Hi John,</b><br/><br/>
            This is a reminder for our meeting scheduled at 3 PM today. Please make sure to join on time.<br/><br/>
            Best regards,<br/>
            Your Name
          </pre>
        </div>
      )
    }
  ];


  export const spamMails = [

    /* 1.Spam Mail Content*/
    {
      id: 31,
      from: 'rewards@winbig.com',
      title: 'Winbig',
      precontent: 'iPhone 15 Pro Max Sizi Bekliyor!',
      readSpam: false,
      used: false,
      content: (
        <div className="mail-content">
          <pre>
            <b>Merhaba,</b><br/><br/>
            Bugün şanslı gününüz! Katkı sağladığınız çekilişimizi kazanmış bulunmaktasınız. Bir iPhone 15 Pro Max kazandınız!.<br/><br/>
            Sadece bununla da kalmadık, sizi görüp kıskanmasın diye yakınlarınızdan birine de bir çift airpods hediye!. Hediyenizi talep etmek için ilerleyin...<br/>
            <img style={{width:400, height:400, paddingTop:20, paddingBottom:20, cursor:"pointer"}} 
            title='rewarsd@winbig.com' 
            src="./SpamMailPictures/gift.jpg" 
            alt="Gift Pic"
            ></img><br/>
            <button 
              className="claim-button"
              title='rewarsd@winbig.com'
              onClick={() => window.location.href='https://global-jbos.com/track/#45%33'}
            >
              Hediyeni Almak İçin Tıkla
            </button><br/><br/>
            Bu fırsatı kaçırmayın! Sadece 24 saat içinde talep etmelisiniz.<br/><br/>
          </pre>
        </div>
      )
    },

    /* 2.Spam Mail Content*/
    {
      id: 32,
      from: 'healthtips@fitlife.com',
      title: 'HealthTips',
      precontent: 'Sadece 7 Günde 10 Kilo Verin!',
      readSpam: false,
      used: false,
      content: (
        <div className="mail-content">
          <pre>
            <b>Hey sen!</b><br/><br/>
            Yepyeni formülümüzle tanışmaya hazır olun! Vücut metabolizmasını hızlandıran ve yağ yakımını maksimum seviyeye çıkaran ürünümüzle yalnızca 7 gün içinde 10 kilo verebilirsiniz. 
            Bilimsel olarak kanıtlanmış içeriklerle geliştirilen bu ürün tamamen doğaldır ve herhangi bir yan etkisi yoktur.<br/>

            <img style={{width:600, height:600, paddingTop:20, paddingBottom:20}} src="./SpamMailPictures/fake-product.png" alt="Product Pic"></img><br/>

            Sınırlı sayıda üretildiği için acele edin! %50 indirim fırsatından yararlanmak ve bu mucizevi değişimi yaşamak için hemen tıklayın:<br/>
            <span style={{color:"orange", textDecoration: "underline", cursor:"pointer"}}
              title='http://healthtips.com/track/#888%465677&&3'>
              Daha Fazla Bilgi
              </span><br/><br/>
              Sağlıklı bir yaşam için, şimdi harekete geçme zamanı!<br/><br/>
          </pre>
        </div>
      )
    },

    /* 3.Spam Mail Content*/

    {
      id: 33,
      from: 'support@careeroptionsnow.com',
      title: 'Career Options Now',
      precontent: 'Evden Çalışarak Ayda 50.000 TL Kazanın!',
      readSpam: false,
      used: false,
      content: (
        <div className="mail-content">
          <pre>
          <img style={{width:730, height:500, paddingTop:20, paddingBottom:20}} src="./SpamMailPictures/workingHome.png" alt="Working Home Pic"></img><br/>
            <b>Merhabalar,</b><br/><br/>
            Evde oturduğunuz yerden yüksek gelir elde etmek ister misiniz? Yeni geliştirdiğimiz sistemle, yalnızca günde 1-2 saat çalışarak ayda 50.000 TL kazanabilirsiniz.<br/>
            Platformumuz, kullanıcı dostu tasarımı ve güvenilir altyapısıyla herkes için uygundur. Hiçbir özel deneyim gerekmiyor!<br/><br/>
            Hemen kaydolun ve size özel çalışma planınızı oluşturun:<br/><br/>

            <span style={{color:"orange", textDecoration: "dotted", cursor:"pointer", backgroundColor:"black", padding:5}}
              title='http://careeroptionsnow.com/c/&1118#46567^#^3&3'>
              Başvur ve Kazanmaya Başla
              </span><br/><br/>
              Kontenjanlarımız sınırlıdır! Hayatınızı değiştirecek bu fırsatı değerlendirmek için acele edin.<br/><br/>
              Saygılarımızla,<br/>
              Career Options Now Ekibi<br/>
          </pre>
        </div>
      )
    }
  ];
         
         
