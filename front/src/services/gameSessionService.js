// services/gameSessionService.js

// Güvenli JSON parse (response.json() patlamasın)
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Backend hata mesajını yakalayıp anlamlı exception fırlat
function throwHttpError(res, json, fallback) {
  const msg =
    (json && (json.error || json.message)) ||
    `${fallback} (HTTP ${res.status})`;
  throw new Error(msg);
}

// Gelen cevaptan dizi çıkart (dizi değilse boş dizi)
function normalizeSessionsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.sessions)) return payload.sessions;
  return [];
}

/**
 * Kullanıcının oyun oturumlarını getirir.
 * - Başarılı durumda DAİMA bir dizi döndürür ([], [...]).
 * - Hata durumunda backend mesajını yansıtır.
 */
export const fetchGameSessions = async (token) => {
  const res = await fetch("http://localhost:5000/api/gamesessions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await safeJson(res);

  if (!res.ok) {
    throwHttpError(res, json, "Oyun geçmişi alınamadı");
  }

  // Her zaman dizi döndür
  return normalizeSessionsPayload(json);
};

/**
 * Belirli bir oyun oturumunu ID ile getirir.
 * - Başarılı durumda bir obje (tek oturum) döndürür.
 * - Hata durumunda backend mesajını yansıtır.
 */
export const fetchGameSessionById = async (id, token) => {
  const res = await fetch(`http://localhost:5000/api/gamesessions/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await safeJson(res);

  if (!res.ok) {
    throwHttpError(res, json, "Oyun detayı alınamadı");
  }

  // Tekil oturum bekleniyor; gelen json bu şekilde dönsün
  return json;
};
