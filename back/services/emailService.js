const nodemailer = require('nodemailer');

const port = Number(process.env.EMAIL_PORT) || 587;
const isSecure = port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure: isSecure, // 465 → true, 587 → false (+STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});

const sendEmail = async (to, type, data = {}) => {
  try {
    let subject = '';
    let html = '';

    switch (type) {
      case 'verify':
        subject = 'E-posta Doğrulama';
        html = `
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">
            <h1 style="color:#007bff;">E-posta Doğrulama</h1>
            <p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
            <a href="${data.verifyUrl}" style="color:#fff;background:#007bff;padding:10px 14px;text-decoration:none;border-radius:5px;">Hesabı Doğrula</a>
          </div>
        `;
        break;

      case 'reset':
        subject = 'Şifre Sıfırlama';
        html = `
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">
            <h1 style="color:#007bff;">Şifre Sıfırlama</h1>
            <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
            <a href="${data.resetUrl}" style="color:#fff;background:#007bff;padding:10px 14px;text-decoration:none;border-radius:5px;">Şifreyi Sıfırla</a>
          </div>
        `;
        break;

      default:
        throw new Error('Geçersiz e-posta türü.');
    }

    const mailOptions = { from: process.env.EMAIL_USER, to, subject, html };
    await transporter.sendMail(mailOptions);
    console.log(`E-posta gönderildi: ${to}`);
  } catch (err) {
    console.error('E-posta gönderimi başarısız:', err.message);
    throw new Error(`E-posta gönderilemedi: ${err.message}`);
  }
};

module.exports = { sendEmail };
