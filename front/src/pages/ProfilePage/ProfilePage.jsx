import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./ProfilePage.css";
import { useAuthContext } from "../../Contexts/AuthContext";
import {Icon} from 'react-icons-kit';
import {eyeOff} from "react-icons-kit/feather/eyeOff";
import {eye} from "react-icons-kit/feather/eye";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [localError, setLocalError] = useState(null); // Yerel hata durumunu yönetin

  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(eyeOff);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const { user, fetchUserProfile, isAuthenticated, updateUser, changePassword, error } =
    useAuthContext();
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleCancel = () => {
    setShowPasswordInput(false); 
    setLocalError(null); 
    setSuccessMessage(null); 
  };

  const handleToggle = () => {
    if (type==='password'){
        setIcon(eye);
        setType('text')
    } else {
        setIcon(eyeOff)
        setType('password')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false); 
    setLocalError(null); 
    setSuccessMessage(null); 
  };

  const handleEditToggle = () => {
    setSuccessMessage(null); 
    setIsEditing(!isEditing);
    setShowPasswordInput(false);
    if (!isEditing) {
      setEditedUser({ ...user });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Kullanıcı bilgilerini kaydet
  const handleSave = async () => {
    setLocalError(null);
    setSuccessMessage(null);

    if (!passwords.currentPassword) {
      setLocalError("Mevcut şifreyi girin.");
      return;
    }
    try {
      await updateUser({ ...editedUser, currentPassword: passwords.currentPassword });
      setSuccessMessage("Bilgiler başarıyla güncellendi!");
      setTimeout(() => {
      setSuccessMessage(null); // Mesajı 3 saniye sonra temizle
      setIsEditing(false); // Başarı mesajı gösterildikten sonra bilgi kısmına dön
    }, 2500);
      
    } catch (error) {
      setLocalError( error.message );
    }
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Şifreyi sıfırla
  };

  // Şifre değişikliklerini kaydet
  const handleChangePassword = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setLocalError( "Yeni şifreler eşleşmiyor!" );
      return;
    }
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setSuccessMessage("Şifre başarıyla güncellendi!");
      setTimeout(() => {
        setSuccessMessage(null);
        setShowPasswordInput(false);
      }, 2500);
    } catch (error) {
      setLocalError( error.message );
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <img src="/phishville.png" alt="PhishVilleLogo" className="backHomeProfile" title="www.safeClicks.com" onClick={() => navigate("/")}/>
        {isEditing && <h1>Düzenle</h1>}
        {!isEditing && <h1>Profil Sayfası</h1>}
        {showPasswordInput && <h2>Kullanıcı Şifre Değişikliği</h2>}
        <div className="profile-avatar">
          <img src="/user (1).png" alt="user" className="avatar" />
        </div>
        {!isEditing ? (
          <div className="profile-info">
            <p><strong>Ad </strong>: {user.firstName}</p>
            <p><strong>Soyad </strong>: {user.lastName}</p>
            <p><strong>Kullanıcı Adı </strong>: {user.username}</p>
            <p><strong>E-posta </strong>: {user.email}</p>
            <p> <strong>Şifre </strong>: ********</p>
            <p><strong>Üyelik Tarihi</strong>: {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            <button className="edit-button" onClick={handleEditToggle}>
              Düzenle
            </button>
          </div>
        ) : (
          <div>
            {!showPasswordInput && (
              <div className="profile-edit">
                <p><strong>Ad </strong> <label>:</label>
                <input
                  type="text"
                  name="firstName"
                  value={editedUser?.firstName || ""}
                  onChange={handleInputChange}
                />
                </p>
                <p><strong>Soyad </strong> <label>:</label>
                <input
                  type="text"
                  name="lastName"
                  value={editedUser?.lastName || ""}
                  onChange={handleInputChange}
                />
                </p>
                <p><strong>Kullanıcı Adı </strong> <label>:</label>
                <input
                  type="text"
                  name="username"
                  value={editedUser?.username || ""}
                  onChange={handleInputChange}
                />
                </p>
                <p><strong>Mevcut Şifre </strong> <label>:</label>
                <input
                  type={type}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <div className="password-toggle" onClick={handleToggle}>
                  <Icon icon={icon} size={20} />
                </div>
                </p>
              
              {isEditing && successMessage && (
                <div className="success-message">
                  {successMessage}
                </div>
              )}
                {(localError || error) && <span className="error-message">{localError || error}</span>}
                
                {/* Editting Buttons */}
                <div className="editting-buttons">
                  <button className="save-button" onClick={handleSave}>
                    Kaydet
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit}>         
                    İptal
                  </button>
                </div>
                
                <label 
                  style={{
                  textDecoration:"underline", 
                  color:"royalblue", 
                  cursor:"pointer",
                  width: 150,
                  alignSelf: "end"
                  }}
                  onClick={() => setShowPasswordInput(!showPasswordInput)}
                  >Şifremi Değiştir
                </label>
              </div>
            )}

            {showPasswordInput && (
              <div className="profile-edit">
                <p style={{justifyContent:"center", justifySelf:"center", alignContent:"center"}}><strong> Eski Şifre </strong> <label>:</label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Eski Şifre"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  </p>
                <p><strong>Yeni Şifre </strong> <label>:</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Yeni Şifre"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                />
                </p>
                <p><strong>Yeni Şifre Tekrar </strong> <label>:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Yeni Şifre Tekrar"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                />
                </p>

                {(localError || error) && <span className="error-message">{localError || error}</span>}
                
                {isEditing && successMessage && (
                  <div className="success-message">
                    {successMessage}
                  </div>
                )}
                <div className="editting-buttons">
                  <button className="save-button" onClick={handleChangePassword}>
                    Kaydet
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>         
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
