import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import "./Browser.css";
import { MakeDraggable } from "../../utils/Draggable";
import { useUIContext } from "../../Contexts/UIContext";
import sites from "../../constants/sites";
import { useGameContext } from "../../Contexts/GameContext";
import { useEventLog } from "../../Contexts/EventLogContext";
import ResetPassword from "../sites/ResetPassword";

export const useBrowser = () => {
  const { openWindow, closeWindow } = useUIContext();
  return {
    openHandler: (props = {}) => openWindow("browser", props),   // <-- props ile aç!
    closeHandler: () => closeWindow("browser"),
  };
};

const CachedComponents = {};

const Browser = ({ closeHandler, style }) => {
  // 1. windowProps'u oku
  const { addEventLogOnce } = useEventLog(); 
  const { windowProps } = useUIContext();
  const browserProps = windowProps?.browser || {};

  // 2. Sadece pencere ilk açıldığında gelen url ile başlat (her mount'ta değil)
  const [initialized, setInitialized] = useState(false);

  // 3. Varsayılan url/props
  const defaultUrl = browserProps.initialUrl || browserProps.url || "https://www.searchill.com";
  const [url, setUrl] = useState(defaultUrl);
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([defaultUrl]);
  const [matchedSites, setMatchedSites] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 4. Diğer props (ör: trackingNo) yakala
  const [extraProps, setExtraProps] = useState(
    browserProps.shippingCompany || browserProps.trackingNo
      ? { shippingCompany: browserProps.shippingCompany, trackingNo: browserProps.trackingNo }
      : null
  );

  const browserRef = useRef(null);
  const searchInputRef = useRef(null);
  const browserScrollRef = useRef(null);

  MakeDraggable(browserRef, ".browser-header");
  const { isWificonnected } = useGameContext();

  // ---- 5. EN KRİTİK KISIM: Pencere ilk açıldığında (ya da yeni props geldiğinde) güncelle
  useEffect(() => {
    if (!initialized) {
      // Öncelik: initialUrl > url > searchill
      const chosenUrl =
        browserProps.initialUrl ||
        browserProps.url ||
        "https://www.searchill.com";

      setUrl(chosenUrl);
      setCurrentUrl(chosenUrl);
      setHistory([chosenUrl]);
      setCurrentIndex(0);

      if (browserProps.shippingCompany || browserProps.trackingNo) {
        setExtraProps({
          shippingCompany: browserProps.shippingCompany,
          trackingNo: browserProps.trackingNo,
        });
      } else {
        setExtraProps(null);
      }

      setInitialized(true); // Sadece bir kere çalışsın
    } else {
      if (browserProps.url && browserProps.url !== currentUrl) {
        setUrl(browserProps.url);
        setCurrentUrl(browserProps.url);
        setHistory(prev => [...prev, browserProps.url]);
        setCurrentIndex(prev => prev + 1);
      }
    }
    // eslint-disable-next-line
  }, [
    browserProps.initialUrl,
    browserProps.url,
    browserProps.shippingCompany,
    browserProps.trackingNo,
    initialized
  ]);

  // ---- 6. (DEĞİŞMEDİ) Event ile link tıklanınca yönlendirme
  useEffect(() => {
    const handleOpenUrl = async (e) => {
      if (typeof e.detail === "object" && e.detail !== null) {
        const { url, shippingCompany, trackingNo } = e.detail;
        setExtraProps({ shippingCompany, trackingNo });
        await handleGoClick(url);
      } else {
        setExtraProps(null);
        await handleGoClick(e.detail);
      }
    };

    window.addEventListener("open-browser-url", handleOpenUrl);
    return () => window.removeEventListener("open-browser-url", handleOpenUrl);
  }, []);



  const startLoading = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
  };

  const handleUrlChange = (e) => setUrl(e.target.value);
  const handleKeyDown = (e) => e.key === "Enter" && handleGoClick(e.target.value);

  const handleSearchillSearch = async (searchText, addToHistory = true) => {
    if (!searchText || !searchText.trim()) return;
    const searchQuery = normalizeText(searchText.trim());

    addEventLogOnce(
      "browser_search",      // type
      "searchQuery",         // unique alan
      searchQuery,           // value
      {
        type: "browser_search",
        questId: null,
        logEventType: "browser_search",
        value: 0,
        data: {
          keyword: searchText
        }
      }
    );


    const searchUrl = `https://www.searchill.com/search?q=${encodeURIComponent(searchQuery)}`;
    setUrl(searchUrl);
    await startLoading();
    setCurrentUrl(searchUrl);

    if (addToHistory) {
      setHistory([...history.slice(0, currentIndex + 1), searchUrl]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleGoClick = async (newUrl = url, addToHistory = true) => {
    await startLoading(); 
    const cleanedUrl = newUrl.trim().replace(/^(www\.)?|\/$/g, '');
    const hasProtocol = /^https?:\/\//i.test(cleanedUrl);
    const finalUrl = hasProtocol ? cleanedUrl : `https://${cleanedUrl}`;
    const normalizedUrl = normalizeText(finalUrl);

    // REGEX destekli eşleşme
    let matchedSite = sites[finalUrl];
    let dynamicUrl = null;

    if (!matchedSite) {
      for (const [pattern, siteConfig] of Object.entries(sites)) {
        if (pattern.startsWith("^")) {
          const regex = new RegExp(pattern);
          if (regex.test(finalUrl)) {
            matchedSite = siteConfig;
            dynamicUrl = finalUrl;
            break;
          }
        }
      }
    }

    let value = 0;
    let reason = "normal";
    if (matchedSite?.isSponsored) {
      value = -4;
      reason = "sponsored";
    }
    addEventLogOnce(
      "browser_visit",
      "visitedUrl",
      finalUrl,
      {
        type: "browser_visit",
        questId: null,
        logEventType: "browser_visit",
        value,
        data: {
          url: finalUrl,
          isSponsored: matchedSite?.isSponsored || false,
          reason,
        }
      }
    );

    setCurrentUrl(matchedSite ? (dynamicUrl || finalUrl) : "404");
    setUrl(finalUrl);

    if (addToHistory) {
      setHistory([...history.slice(0, currentIndex + 1), finalUrl]);
      setCurrentIndex(currentIndex + 1);
    }
    setExtraProps(null); // her yeni sayfa için sıfırla
  };

  const goHome = async () => {
    const searchillUrl = "https://www.searchill.com";
    setUrl(searchillUrl);
    await startLoading();
    setCurrentUrl(searchillUrl);
    setHistory([...history.slice(0, currentIndex + 1), searchillUrl]);
    setCurrentIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (currentUrl.startsWith("https://www.searchill.com/search?q=")) {
      const searchQuery = normalizeText(decodeURIComponent(currentUrl.split("search?q=")[1]));
      const filteredSites = Object.entries(sites)
        .filter(([key, site]) =>
          site.searchKeys?.some((k) => normalizeText(k).includes(searchQuery))
        )
        .map(([key, site]) => ({
          key,
          site,
          score: (site.isSponsored ? 1000 : 0) + (site.seoScore || 0)
        }))
        .sort((a, b) => b.score - a.score);
      setMatchedSites(filteredSites);
    }
  }, [currentUrl]);

  const handleBackClick = async () => {
    if (currentIndex > 0) {
      await startLoading();
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setUrl(history[newIndex]); 
      setCurrentUrl(history[newIndex]); 
    }
  };

  const handleForwardClick = async () => {
    if (currentIndex < history.length - 1) {
      await startLoading();
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setUrl(history[newIndex]); 
      setCurrentUrl(history[newIndex]); 
    }
  };

  const renderContent = () => {
    if (!isWificonnected) {
      return (
        <div className="no-internet">
          <h2>İnternet Bağlantısı Bulunamadı</h2>
          <p>Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.</p>
          <img src="./icons/no-wifi.png" alt="No Internet" />
        </div>
      );
    }

    if (loading) {
      return <div className="browser-loading">
                <div className="lds-default">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
            </div>
    }

    if (currentUrl.startsWith("https://www.searchill.com/search?q=")) {
      const searchedText = decodeURIComponent(currentUrl.split("search?q=")[1]);
      return (
        <div className="download-pages">
          <div className='searchPart' style={{width:500, height:40, marginBottom:40}}>
            <img src="./icons/search.png" alt="Search Logo" onClick={() => handleSearchillSearch(searchInputRef.current.value) } />
            <input 
              type="text"
              defaultValue={searchedText}
              placeholder="SearChill'da Ara"
              ref={searchInputRef}
              onKeyDown={(e) => e.key === "Enter" && handleSearchillSearch(e.target.value)} 
            />

            <div className='searchPart_right'>
              <img src="./icons/keyboard.png" alt="Keyboard Logo"/>
              <img src="./icons/google-voice.png" alt="Voice Logo"/>
            </div>
          </div>

          <div className='searchPart_bottom'>
            <h3 className='tümü'>Tümü</h3>
            <h3>Görseller</h3>
            <h3>Videolar</h3>
            <h3>Yer siteleri</h3>
            <h3>Haberler</h3>
            <h3>Web</h3>
          </div>
          {matchedSites.length > 0 ? (
            matchedSites.map(({ key, site }) => {
              return (
                <div key={key} className="link-part" onClick={() => site.clickable && handleGoClick(key)}
                  style={{
                    cursor: site.clickable ? "pointer" : "default",
                    color: site.clickable ? "white" : "gray",
                  }}>
                  <div className="top-of-the-link">
                  <div
                    className={site.color ? "image-div" : `image-div site-${key.split("//")[1].split(".")[0]}`}
                    style={site.color ? { backgroundColor: site.color } : {}}
                  >
                    {site.title.charAt(0)}
                  </div>
                    <div className="link-content">
                      <p style={{ fontSize: 16, color: "#cacaca" }}>{key}</p>
                      <h3>
                        {site.title}
                        {site.isSponsored && (
                        <span className="sponsored-tag">Reklam</span>
                        )}
                      </h3>
                      <p>{site.statement}</p>
                    </div>
                  </div>
                  <h2 className={site.clickable ? "clickable-title" : "disabled-title"}>
                    {site.title} | {site.statement}
                  </h2>
                </div>
              );
            })
          ) : (
            <p>Aradığınız - <strong>{searchedText}</strong> - ile ilgili hiçbir arama sonucu mevcut değil.</p>
          )}
        </div>
      );
    }

    if (currentUrl.startsWith("http://reset/")) {
      try {
         window.currentBrowserUrl = currentUrl;

        const dummyUrl = currentUrl.replace("http://", "http://dummy.");
        const urlObj = new URL(dummyUrl);
        // 1. siteKey'i al
        const siteKey = urlObj.pathname.replace("/", "").toLowerCase();

        // 2. siteKey ile eşleşen siteyi, sites objesinin değerlerinden title'a göre bul
        const siteEntry = Object.entries(sites).find(
          ([_, config]) => config?.title?.toLowerCase() === siteKey
        );

        // 3. siteName'i al veya bilinmeyen fallback
        const siteName = siteEntry?.[1]?.title || "Bilinmeyen";

        return (
          <ResetPassword
            siteName={siteName}
          />
        );
      } catch (e) {
        return <div className="not-found">404 - Geçersiz sıfırlama bağlantısı</div>;
      }
    }

    if (currentUrl === "https://www.searchill.com") {
      return (
        <div className="firstPartOfBrowser">
          <h1>SearChill</h1>
          <div className="searchPart"> 
            <img src="./icons/search.png" alt="Search Logo" onClick={() => handleSearchillSearch(searchInputRef.current.value) } />
            <input 
              type="text" 
              placeholder="SearChill'da Ara"
              ref={searchInputRef}
              onKeyDown={(e) => e.key === "Enter" && handleSearchillSearch(e.target.value)} 
            />
            <div className="searchPart_right">
              <img src="./icons/keyboard.png" alt="Keyboard Logo" />
              <img src="./icons/google-voice.png" alt="Voice Logo" />
            </div>
          </div>
        </div>
      );
    }

    // REGEX destekli component render bölümü
    let site = sites[currentUrl];
    let dynamicUrl = null;
    let matchedSite = site;

    if (!site) {
      for (const [pattern, siteConfig] of Object.entries(sites)) {
        if (pattern.startsWith("^")) {
          const regex = new RegExp(pattern);
          if (regex.test(currentUrl)) {
            matchedSite = siteConfig;
            dynamicUrl = currentUrl;
            break;
          }
        }
      }
    }

    if (!matchedSite) return <div className="not-found">404 - Sayfa Bulunamadı</div>;

    switch (matchedSite.type) {
      case "component":
        if (!CachedComponents[matchedSite.component]) {
          CachedComponents[matchedSite.component] = lazy(() => import(`../sites/${matchedSite.component}.jsx`));
        }
        const SiteComponent = CachedComponents[matchedSite.component];
        return (
          <Suspense>
            <SiteComponent
              scrollRef={browserScrollRef}
              url={dynamicUrl || currentUrl}
              {...(extraProps || {})}
            />
          </Suspense>
        );
      default:
        return <div className="not-found">404 - Sayfa Bulunamadı</div>;
    }
  };

  return (
    <div className="browser-window" style={style} ref={browserRef} data-window="browser">
      <div className="browser-header">
        <h2>Browser</h2>
        <button className="browser-close" onClick={closeHandler}>×</button>
      </div>
      <div className="browser-search">
        <img 
          className="nav-arrow"
          src="./icons/arrow.png" alt="Arrow Logo" 
          onClick={handleBackClick}
        />
        <img 
          className={`nav-arrow ${currentIndex < history.length - 1 ? "" : "disabled"}`}
          src="./icons/right-arrow (1).png" 
          alt="Right Arrow Logo" 
          onClick={currentIndex < history.length - 1 ? handleForwardClick : null}
        />
        <img 
          className="home-icon"
          src="./icons/home.png" alt="Home" 
          onClick={goHome}
        />
        <input className="browser-url-input" type="text" value={url} onChange={handleUrlChange} onKeyDown={handleKeyDown} placeholder="Enter URL" />
        <button className="browser-go-button" onClick={() => handleGoClick(url)}>Go</button>
      </div>
      <div className="browser-content" ref={browserScrollRef}>{renderContent()}</div>
    </div>
  );
};

export default Browser;
