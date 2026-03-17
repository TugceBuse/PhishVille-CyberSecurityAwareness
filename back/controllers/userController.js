const User = require('../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const { sendEmail } = require('../services/emailService');

const dotenv = require('dotenv');

dotenv.config();

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]+$/.test(username) && username.length >= 4 && username.length <= 15;
}

// User register
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password, email } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const normalizedUsername = String(username || '').trim();

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Gecerli bir e-posta adresi girin.' });
    }

    if (!isValidUsername(normalizedUsername)) {
      return res.status(400).json({
        error: 'Kullanici adi yalnizca Ingilizce harf, rakam ve alt cizgi (_) icermeli ve 4-15 karakter arasinda olmali.',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { usernameLowerCase: normalizedUsername.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu email veya kullanici adi zaten kullaniliyor.' });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(403).json({
        error: 'Sifre en az 8 karakter uzunlugunda, bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermelidir.',
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      isEmailVerified: false,
    });

    const activationToken = jwt.sign(
      { userId: newUser._id },
      process.env.EMAIL_VERIFICATION_SECRET,
      { expiresIn: '1d' }
    );

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${activationToken}`;

    await sendEmail(normalizedEmail, 'verify', { firstName, verifyUrl });
    await newUser.save();

    return res.status(201).json({
      message: 'Kullanici basariyla olusturuldu! Aktivasyon e-postasi gonderildi.',
      user: newUser,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: 'Bu email veya kullanici adi zaten kullaniliyor.' });
    }

    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: 'Gonderilen veriler gecersiz.' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Sunucu hatasi.' });
  }
};

// User delete
exports.deleteUser = async (req, res) => {
  try {
    const id = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Gecersiz kullanici ID.' });
    }

    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    }

    return res.status(200).json({ message: 'Kullanici basariyla silindi!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Kullanici silinirken bir hata olustu.' });
  }
};

// User update
exports.updateUser = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, username, firstName, lastName, email } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    }

    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Mevcut sifre yanlis.' });
    }

    const incomingFields = Object.keys(req.body).filter((key) => key !== 'currentPassword');
    const allowedFields = new Set(['firstName', 'lastName', 'email', 'username']);
    const disallowedFields = incomingFields.filter((key) => !allowedFields.has(key));
    if (disallowedFields.length > 0) {
      return res.status(400).json({ error: 'Guncellenmesine izin verilmeyen alanlar var.' });
    }

    const normalizedEmail = email ? String(email).toLowerCase().trim() : undefined;
    const normalizedUsername = username ? String(username).trim() : undefined;

    if (normalizedEmail && !validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Gecerli bir e-posta adresi girin.' });
    }

    if (normalizedUsername && !isValidUsername(normalizedUsername)) {
      return res.status(400).json({
        error: 'Kullanici adi 4-15 karakter olmali ve yalnizca harf/rakam/_ icermelidir.',
      });
    }

    const uniquenessQuery = [];
    if (normalizedEmail) uniquenessQuery.push({ email: normalizedEmail });
    if (normalizedUsername) uniquenessQuery.push({ usernameLowerCase: normalizedUsername.toLowerCase() });

    if (uniquenessQuery.length > 0) {
      const existingUser = await User.findOne({
        $or: uniquenessQuery,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Bu kullanici adi veya e-posta zaten kullaniliyor.' });
      }
    }

    if (normalizedUsername) user.username = normalizedUsername;
    if (normalizedEmail) user.email = normalizedEmail;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    await user.save();

    return res.status(200).json({
      message: 'Kullanici basariyla guncellendi!',
      user,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Bu kullanici adi veya e-posta zaten kullaniliyor.' });
    }

    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: 'Gonderilen veriler gecersiz.' });
    }

    console.error('Hata olustu:', err);
    return res.status(500).json({ error: 'Bir hata olustu.' });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mevcut sifre yanlis.' });
    }

    if (await user.comparePassword(newPassword)) {
      return res.status(401).json({ error: 'Yeni sifre mevcut sifreyle ayni olamaz.' });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(403).json({
        error: 'Sifre en az 8 karakter uzunlugunda, bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermelidir.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Sifre basariyla guncellendi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Sifre guncellenirken bir hata olustu.' });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Email veya sifre hatali.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Hesabiniz henuz aktif edilmedi. Lutfen e-posta adresinizi dogrulayin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email veya sifre hatali.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    return res.status(200).json({
      message: 'Basariyla giris yaptiniz!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Sunucu hatasi.' });
  }
};

// User profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Profil alinirken bir hata olustu.' });
  }
};

// Email verify
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'E-posta zaten dogrulandi.' });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({ message: 'E-posta basariyla dogrulandi!' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Gecersiz veya suresi dolmus token.' });
  }
};

// Forgot password + email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!validator.isEmail(normalizedEmail)) {
    return res.status(200).json({ message: 'Eger hesap varsa sifre sifirlama baglantisi gonderilecektir.' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({ message: 'Eger hesap varsa sifre sifirlama baglantisi gonderilecektir.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(user.email, 'reset', { resetUrl: resetURL });

    return res.status(200).json({ message: 'Eger hesap varsa sifre sifirlama baglantisi gonderilecektir.' });
  } catch (err) {
    console.error('Sifre sifirlama istegi sirasinda hata:', err.message);
    return res.status(500).json({ error: 'Bir hata olustu.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token gecersiz veya suresi dolmus.' });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Sifre en az 8 karakter uzunlugunda, bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermelidir.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'Sifre basariyla guncellendi.' });
  } catch (err) {
    return res.status(500).json({ error: 'Bir hata olustu.' });
  }
};
