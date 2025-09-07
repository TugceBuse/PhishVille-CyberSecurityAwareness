import './App.css'; 
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import Homepage from "./pages/Homepage/Homepage";
import Game from "./pages/Game";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignPage from "./pages/SignPage/SignPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { AuthProvider } from "./Contexts/AuthContext";
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ScrollToTop from './utils/ScrollToTop';
import MyGames from './pages/MyGames/MyGames';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/mygames" element={<MyGames />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
