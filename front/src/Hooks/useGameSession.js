// src/Hooks/useGameSession.js
import { useAuthContext } from "../Contexts/AuthContext";

export const useGameSession = () => {
  const { token } = useAuthContext();

  // Backend'e oyun verisi kaydeder
  const saveGameSession = async (body) => {
    const response = await fetch("http://localhost:5000/api/gamesessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "GameSession kaydedilemedi.");
    }
    return response.json();
  };

  return { saveGameSession };
};
