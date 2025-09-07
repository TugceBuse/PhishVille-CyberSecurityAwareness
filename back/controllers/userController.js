const User = require('../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const { sendEmail } = require('../services/emailService');

const dotenv = require('dotenv');

dotenv.config();

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]+$/.test(username) && username.length >= 3 && username.length <= 15;
}

// Kullanıcı kaydı
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password, email } = req.body;

    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: 'Kullanıcı adı yalnızca İngilizce harf, rakam ve alt çizgi (_) içermeli ve 3-15 karakter arasında olmalı.',
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email veya kullanıcı adı zaten kullanılıyor.' });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(403).json({
        error: 'Şifre en az 8 karakter uzunluğunda, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
      });
    }

    const newUser = new User({ 
      firstName, 
      lastName, 
      username, 
      email, 
      password, 
      isEmailVerified: false 
    });
    await newUser.save();

    const activationToken = jwt.sign(
      { userId: newUser._id },
      process.env.EMAIL_VERIFICATION_SECRET,
      { expiresIn: '1d' }
    );

    const activationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${activationToken}`;

    await sendEmail(email, 'Aktivasyon', { firstName, activationUrl });

    res.status(201).json({ 
      message: 'Kullanıcı başarıyla oluşturuldu! Aktivasyon e-postası gönderildi.', 
      user: newUser 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

  
  

// Kullanıcı silme
exports.deleteUser = async (req, res) => {
  try {
    const id = req.user.id; // Token'den alınan kullanıcı kimliği

    // ID doğrulama
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID.' });
    }

    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json({ message: 'Kullanıcı başarıyla silindi!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcı silinirken bir hata oluştu.' });
  }
};

// Kullanıcı güncelleme
exports.updateUser = async (req, res) => {
  const userId = req.user.id; // Middleware'den gelen kullanıcı kimliği
  const { currentPassword, username, ...updatedData } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Mevcut şifre kontrolü
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: "Mevcut şifre yanlış." });
    }

    // E-posta kontrolü
    if (updatedData.email && !validator.isEmail(updatedData.email)) {
      return res.status(403).json({ error: "Geçerli bir e-posta adresi girin." });
    }

    const email = updatedData.email?.toLowerCase();
    const usernameLowerCase = username?.toLowerCase();

    // Var olan kullanıcıyı kontrol et
    const existingUser = await User.findOne({
      $or: [{ email }, { usernameLowerCase }],
      _id: { $ne: userId }, // Güncellenen kullanıcı hariç
    });

    if (existingUser) {
      return res.status(401).json({
        error: "Bu kullanıcı adı veya e-posta zaten kullanılıyor.",
      });
    }

    // Kullanıcı adı güncelleme
    if (username) {
      user.username = username;
      user.usernameLowerCase = username.toLowerCase();
    }

    // E-posta güncelleme
    if (email) {
      user.email = email;
    }

    // Diğer alanları güncelle
    Object.keys(updatedData).forEach((key) => {
      user[key] = updatedData[key];
    });

    // Kullanıcıyı kaydet
    await user.save();

    res.status(200).json({
      message: "Kullanıcı başarıyla güncellendi!",
      user,
    });
  } catch (err) {
    console.error("Hata oluştu:", err);
    res.status(500).json({ error: "Bir hata oluştu." });
  }
};
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Token'den gelen kullanıcı ID
  console.log("updatePassword çalıştı:", currentPassword, newPassword, userId);

  try {
    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Mevcut şifre kontrolü
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mevcut şifre yanlış.' });
    }

    // Yeni şifre eski şifreyle aynı mı kontrol et
    if (await user.comparePassword(newPassword)) {
      return res.status(401).json({ error: 'Yeni şifre mevcut şifreyle aynı olamaz.' });
    }

    // Yeni şifre güçlü mü kontrol et
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(403).json({
        error: 'Şifre en az 8 karakter uzunluğunda, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
      });
    }

    // Yeni şifreyi doğrudan kaydet (hashleme işlemini pre('save') yapacak)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Şifre güncellenirken bir hata oluştu.' });
  }
};
// Kullanıcı girişi
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı doğrulama
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı!' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Hesabınız henüz aktif edilmedi. Lütfen e-posta adresinizi doğrulayın.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Yanlış şifre!' });
    }

    // JWT oluşturma
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    res.status(200).json({
      message: 'Başarıyla giriş yaptınız!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
// User bilgileri getirme (protected)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Şifre hariç tüm alanlar
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profil alınırken bir hata oluştu.' });
  }
};

// Email doğrulama
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query; // URL'den token alınır

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Zaten doğrulanmış mı?
    if (user.isEmailVerified) {
      console.log('E-posta zaten doğrulandı.');
      return res.status(400).json({ message: 'E-posta zaten doğrulandı.' });
    }

    // Hesabı aktif hale getir
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: 'E-posta başarıyla doğrulandı!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};


//şifre sıfırlama ve mail gönderme işlemi ayarlanacak
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Kullanıcıyı email ile bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    // Token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Token'ı hash'le ve kullanıcıya kaydet
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token 10 dakika geçerli
    await user.save();


    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(user.email, 'Şifre Sıfırlama', { resetUrl: resetURL });

    res.status(200).json({ message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.' });
  } catch (err) {
    console.error('Şifre sıfırlama isteği sırasında hata:', err.message);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.query; // URL'den token alınır
  const { password } = req.body; // Yeni şifre alınır

  try {
    // Token'ı hash'le ve veritabanında kontrol et
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token'ın süresi kontrol edilir
    });

    if (!user) {
      return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş.' });
    }

    // Güçlü şifre kontrolü
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ 
        error: 'Şifre en az 8 karakter uzunluğunda, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.' 
      });
    }

    // Şifreyi güncelle ve token'ı sıfırla
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
};
  

