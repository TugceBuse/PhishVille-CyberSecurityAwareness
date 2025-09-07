import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../../Contexts/AuthContext";

const Navbar = ({ setHomeScrollTo }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthContext();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const handleClickOutside = (event) => {
        if (!event.target.closest(".user-info")) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [menuOpen]);

  const handleLogoClick = () => {
    window.location.reload(); // Sayfayı yeniler
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleAvatarClick = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div>
      <nav  className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-container">
          <div className="logo" onClick={handleLogoClick}></div>
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&display=swap" rel="stylesheet"></link>
          <h1 className="h1">PhishVille</h1>
        </div>
     

        <div className="rightPart">
          <button className="a navlink-btn" onClick={() => setHomeScrollTo("about")}>
            Hakkında
          </button>
          <button className="a navlink-btn" onClick={() => setHomeScrollTo("contact")}>
            İletişim
          </button>
          {/* <button className="a navlink-btn" onClick={() => setHomeScrollTo("feedback")}>
            Görüşler
          </button> */}

          <div className="loginPart">
            {isAuthenticated ? (
              <div className="user-info" onClick={handleAvatarClick}>
                <img
                  src="/user (1).png"
                  alt="User"
                  className="avatar"
                />
                <span className="username">{user.username}</span>

                {menuOpen && (
                  <div className="dropdown-menu">
                    <a href="/profile" className="dropdown-menu-a">
                      <img
                        src="icons/profile.png"
                        alt="User Profile"
                        className="menü-avatar"
                      /> 
                      Profil
                    </a>
                    <a href="/mygames" className="dropdown-menu-a"> 
                      <img
                        src="icons/gamepad.png"
                        alt="My Games"
                        className="menü-avatar"
                      /> Oyun Bilgilerim
                    </a>
                    <button onClick={logout}  className="dropdown-menu-button">
                      <img
                        src="icons/logout.png"
                        alt="Logout Icon"
                        className="menü-avatar"
                      /> Çıkış Yap
                      </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login" onClick={handleLoginClick}>
                GİRİŞ
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
