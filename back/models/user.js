const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
  {
    // Ad
    firstName: {
      type: String,
      required: [true, 'Ad gereklidir'],
      uppercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-ZğüşöçİĞÜŞÖÇ]+(\s[a-zA-ZğüşöçİĞÜŞÖÇ]+)*$/.test(value);
        },
        message: 'Ad yalnızca harflerden oluşmalı ve aralarında birer boşluk bulunmalıdır',
      },
    },
    // Soyad
    lastName: {
      type: String,
      required: [true, 'Soyad gereklidir'],
      uppercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-ZğüşöçİĞÜŞÖÇ]+$/.test(value);
        },
        message: 'Soyad yalnızca tek bir kelimeden oluşmalı ve boşluk içermemelidir',
      },
    },
    // Kullanıcı adı
    username: {
      type: String,
      required: [true, 'Kullanıcı adı gereklidir'],
      unique: true,
      minlength: [4, 'Kullanıcı adı minimum 4 karakter içermelidir'],
      trim: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9_]+$/.test(value);
        },
        message: 'Kullanıcı adı yalnızca harf, rakam veya alt çizgi (_) içerebilir',
      },
    },
    usernameLowerCase: {
      type: String,
      unique: true,
      select: false, // API yanıtlarında görünmesin
    },
    // Email
    email: {
      type: String,
      required: [true, 'Email gereklidir'],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: 'Geçerli bir email adresi girin',
      },
    },
    // Şifre
    password: {
      type: String,
      required: [true, 'Şifre gereklidir'],
      minlength: [8, 'Şifre minimum 8 karakter içermelidir'],
      validate: {
        validator: validator.isStrongPassword,
        message: 'Şifre 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermeli ve en az 8 karakter uzunluğunda olmalıdır',
      },
    },
    // Email aktivasyonu için
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Puan
    score: {
      type: Number,
      default: 0,
    },
    // Kullanıcı rolü
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Hesap durumu
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
    // Şifre kurtarma tokeni
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Kullanıcı adı doğrulaması, büyük/küçük harf fark etmeksizin unique
UserSchema.path('username').validate(async function (value) {
  const existingUser = await mongoose.models.User.findOne({ usernameLowerCase: value.toLowerCase() });
  if (existingUser && existingUser._id.toString() !== this._id.toString()) {
    return false;
  }
  return true;
}, 'Bu kullanıcı adı zaten alınmış.');

// Kaydetmeden önce usernameLowerCase alanını güncelle
UserSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    this.usernameLowerCase = this.username.toLowerCase(); // Benzersizlik kontrolü için normalize et
  }
  next();
});

// Şifre hashleme
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Şifre doğrulama fonksiyonu
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

// GAME SESSION VIRTUAL ALANI EKLENDİ
UserSchema.virtual('gameSessions', {
  ref: 'GameSession',           // Model adı
  localField: '_id',            // User tablosundaki alan
  foreignField: 'userId',       // GameSession'daki referans
  justOne: false
});

// Virtualların JSON çıktılarda görünmesi için:
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
