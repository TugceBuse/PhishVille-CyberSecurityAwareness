import React, { createContext, useContext, useEffect, useState } from "react";
import { useTimeContext } from "./TimeContext";

const EventLogContext = createContext();

export function useEventLog() {
  return useContext(EventLogContext);
}

export function EventLogProvider({ children }) {
  const [eventLogs, setEventLogs] = useState([]);
  const { gameDate } = useTimeContext();

  // Türkiye saatinde string timestamp üretir (gösterim için)
  const turkishTimeString = (dateObj) =>
    dateObj.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  // Tüm loglara otomatik olarak hem string timestamp hem numeric timestampMs ekler
  const addEventLog = (event) => {
    setEventLogs((prev) => [
      ...prev,
      {
        ...event,
        timestamp: turkishTimeString(gameDate), // Ekranda okunur haliyle
        timestampMs: gameDate.getTime(),        // Numeric, güvenli kıyas için
      }
    ]);
  };
  // Kullanım örneği:
  // addEventLog({
  //   type: "phishing_mail_open",
  //   questId: "connect_wifi",
  //   logEventType: "wifi",
  //   value: -10,
  //   data: { url: "phish.com" }
  // });

  // Çoklu event log ekler (her event yine addEventLog ile eklenir)
  const addEventLogs = (events) => {
    events.forEach(ev => addEventLog(ev));
  };
  // Kullanım örneği:
  // addEventLogs([
  //   { type: "secure_wifi_connect", questId: "connect_wifi", logEventType: "wifi", value: 10, data: { ssid: "Office" } },
  //   { type: "antivirus_scan", questId: "antivirus_install", logEventType: "antivirus", value: 20, data: { device: "mainPC" } }
  // ]);

  // uniqueField ve uniqueValue ile sadece bir kere logla
  // uniqueField/uniqueValue null geçilirse sadece type kontrolü yapılır
  const addEventLogOnce = (type, uniqueField, uniqueValue, eventObj) => {
    const isLogged = eventLogs.some(ev =>
      ev.type === type &&
      (uniqueField == null || (ev.data && ev.data[uniqueField] === uniqueValue))
    );
    if (!isLogged) {
      addEventLog(eventObj);
    }
  };
  // Kullanım örneği (sadece type kontrolü):
  // addEventLogOnce(
  //   "secure_wifi_connect", // type
  //   null, // uniqueField
  //   null, // uniqueValue
  //   { type: "secure_wifi_connect", questId: "connect_wifi", logEventType: "wifi", value: 10, data: { ssid: "Office" } }
  // );
  // Kullanım örneği (uniqueField ile):
  // addEventLogOnce(
  //   "secure_wifi_connect",
  //   "ssid",
  //   "Office",
  //   { type: "secure_wifi_connect", questId: "connect_wifi", logEventType: "wifi", value: 10, data: { ssid: "Office" } }
  // );

  // Cooldown ile tekrar log engelle
  // uniqueField/uniqueValue null geçilirse sadece type kontrolü yapılır
  const addEventLogWithCooldown = (
    type,
    uniqueField,
    uniqueValue,
    eventObj,
    cooldownMs = 60 * 60 * 1000 // Varsayılan: 1 saat
  ) => {
    const now = gameDate.getTime();
    const filteredLogs = eventLogs.filter(ev =>
      ev.type === type &&
      (uniqueField == null || (ev.data && ev.data[uniqueField] === uniqueValue))
    );
    // En son eklenen logu bul
    const lastLog = filteredLogs.sort((a, b) =>
      b.timestampMs - a.timestampMs
    )[0];

    if (!lastLog || now - lastLog.timestampMs > cooldownMs) {
      addEventLog(eventObj);
    }
  };
  // Kullanım örneği:
  // addEventLogWithCooldown(
  //   "antivirus_scan",
  //   null,
  //   null,
  //   { type: "antivirus_scan", questId: "antivirus_install", logEventType: "antivirus", value: 20, data: { device: "mainPC" } },
  //   30 * 60 * 1000
  // );
  // Kullanım örneği (uniqueField ile, örn. ssid):
  // addEventLogWithCooldown(
  //   "secure_wifi_connect",
  //   "ssid",
  //   "Office",
  //   { type: "secure_wifi_connect", questId: "connect_wifi", logEventType: "wifi", value: 10, data: { ssid: "Office" } },
  //   60 * 60 * 1000
  // );

  // State değişiminde logla (örn. toggle)
  // uniqueField ile hangi state'e bakılacağı belirlenir
  const addEventLogOnChange = (type, uniqueField, newValue, eventObj) => {
    // Son durumu bulmak için logları tersten dolaş
    const lastLog = [...eventLogs].reverse().find(ev =>
      ev.type === type &&
      (uniqueField == null || (ev.data && ev.data[uniqueField] !== undefined))
    );
    if (
      !lastLog ||
      (uniqueField
        ? lastLog.data[uniqueField] !== newValue
        : lastLog.data?.state !== newValue)
    ) {
      addEventLog(eventObj);
    }
  };
  // Kullanım örneği:
  // addEventLogOnChange(
  //   "remember_me_toggled",
  //   "state",
  //   isRememberMeActive,
  //   { type: "remember_me_toggled", questId: "login_mailbox", logEventType: "mailbox", value: isRememberMeActive ? -10 : 0, data: { state: isRememberMeActive } }
  // );
  // Kullanım örneği (uniqueField yoksa):
  // addEventLogOnChange(
  //   "remember_me_toggled",
  //   null,
  //   isRememberMeActive,
  //   { ... }
  // );

  // Tüm event loglarını temizle (oyun başı/sonu için)
  const resetEventLogs = () => setEventLogs([]);
  // Kullanım örneği:
  // resetEventLogs();

  useEffect(() => {
    console.log("Event logs updated:", eventLogs);
  }, [eventLogs]);

  const value = {
    eventLogs,                // Tüm event loglar (gamesession'a göndereceğin dizi)
    addEventLog,              // Her zaman ekle
    addEventLogs,             // Çoklu ekle
    addEventLogOnce,          // Tekrarsız ekle (type veya uniqueField ile)
    addEventLogWithCooldown,  // Cooldown ile ekle (type veya uniqueField ile)
    addEventLogOnChange,      // State değişiminde ekle (type veya uniqueField ile)
    resetEventLogs,           // Sıfırla
    setEventLogs,             // Doğrudan set et
  };

  return (
    <EventLogContext.Provider value={value}>
      {children}
    </EventLogContext.Provider>
  );
}
