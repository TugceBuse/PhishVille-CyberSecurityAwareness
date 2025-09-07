// Contexts/TimeContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
  // Oyun başlangıç tarihi: her zaman bugünün 09:00'u
  const [gameStart] = useState(() => {
    const now = new Date();
    now.setHours(9, 0, 0, 0); // saat: 09:00:00
    return new Date(now);
  });
  //Oyun başlangıcının gerçek tarihi
  const realStartRef = useRef(new Date());

  // Geçen oyun saniyesi
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(seconds);

  // Saniye güncellemesi
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // Oyun içi geçen ms (0'dan başlar, her saniye 1000 artar)
  const gameMs = seconds * 1000;

  // Anlık oyun zamanı Date objesi olarak (her saniye güncellenir)
  const [gameDate, setGameDate] = useState(new Date(gameStart.getTime()));
  useEffect(() => {
    setGameDate(new Date(gameStart.getTime() + gameMs));
  }, [gameMs, gameStart]);

  // getRelativeDate ve getDateFromseconds fonksiyonları aynı kalabilir
  const getRelativeDate = ({ days = 0, months = 0, hours = 0, minutes = 0 }) => {
    const newDate = new Date(gameStart.getTime());
    newDate.setMonth(newDate.getMonth() + months);
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(newDate.getHours() + hours);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  };

  const getDateFromseconds = (seconds) => {
    const date = new Date(gameStart.getTime());
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  };

  return (
    <TimeContext.Provider value={{
      seconds,
      secondsRef,
      gameStart,
      gameDate,
      gameMs,
      realStartRef,
      getRelativeDate,
      getDateFromseconds
    }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTimeContext = () => useContext(TimeContext);
