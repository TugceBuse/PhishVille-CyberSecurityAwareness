import "./SignPage.css";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import {Icon} from 'react-icons-kit';
import {eyeOff} from "react-icons-kit/feather/eyeOff";
import {eye} from "react-icons-kit/feather/eye";

const SignPage = () => {
  const { register, error, clearError } = useContext(AuthContext);
  const [localError, setLocalError] = useState(null);
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(eyeOff);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const isValidUsername = (username) => /^[a-zA-Z0-9_]+$/.test(username);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      if (!isValidUsername(value)) {
        setLocalError("Kullanıcı adı yalnızca ingilizce harf, rakam, alt çizgi (_) içerebilir.");
        return;
      }
      else if (value.length < 3 || value.length > 15) {
        setLocalError("Kullanıcı adı 3-15 karakter arasında olmalıdır.");
        return;
      }
      else {
        setLocalError(null);
      }
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

  useEffect(() => {
    clearError(); 
    setLocalError(null); 
  }, []);
  
  
  // pop-up mesajı için const
  const [showPopup, setShowPopup] = useState(false); 
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await register(formData); 
      setShowPopup(true); 
      clearError();
      setTimeout(() => {
        setShowPopup(false); 
        setLocalError(null); 
        navigate("/"); 
      }, 2000); 
    } catch (err) {
      setLocalError(err.message || "Bir hata oluştu."); 
    }
  };

  return (
    <div className="sign_page">
      <div className="box2">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <form className="inputPart2" onSubmit={handleSubmit}>
          <img className="backLogin" src="./icons/left-arrow.png" alt="Back To Login Page" onClick={() => navigate("/login")} />
          <h1>KAYIT SAYFASI</h1>
          <img className="userImg" src="./user (1).png" alt="user" />
          <div className="textbox2">
            <div className="textbox_signAd">
              <input
                type="text"
                placeholder="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="textbox_signSoyad">
              <input
                type="text"
                placeholder="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="textbox_signkullanıcıAdı">
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="textbox_email">
              <input
                type="text"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pswd">
              <input
                type={type}
                placeholder="Şifre"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="password-toggle" onClick={handleToggle}>
                <Icon icon={icon} size={20} />
              </div>
            </div>
          </div>
          <input type="submit" className="btn" value="Kayıt Ol" />
          {(error || localError) && <p className="error">{error || localError}</p>}
        </form>

         {/* Pop-up mesajı */}
         {showPopup && (
        <div className="popupRegister">
          Kayıt başarılı! Ana sayfaya yönlendiriliyorsunuz...
        </div>
        )}

      </div>
      <squre className="circle1" />
      <squre className="circle2" />
    </div>
  );
};

export default SignPage;
