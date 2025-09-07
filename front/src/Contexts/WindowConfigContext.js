import React, { createContext, useContext, useEffect, useState } from 'react';
import Mailbox, { useMailbox } from '../components/Mailbox/Mailbox';
import Todolist, { useTodoList } from '../components/Todolist/Todolist';
import Browser, { useBrowser } from '../components/Browser/Browser';
import ChatApp, { useChatApp } from '../components/ChatApp/ChatApp';
import Folder, { useFolder } from '../components/Folder/Folder';
import Scanner, { useScanner } from '../components/Scanner/Scanner';
import Antivirus, { useAntivirus } from '../components/Antivirus/Antivirus';
import NovabankApp, { useNovabankApp } from '../components/NovabankApp/NovabankApp';
import PhoneApp, { usePhoneApp } from '../components/PhoneApp/PhoneApp';
import DocuLiteApp, { useDocuLiteApp } from '../components/DocuLiteApp/DocuLiteApp';
import QuickPDFViewApp, { useQuickPDFViewApp } from '../components/QuickPDFViewApp/QuickPDFViewApp';
import OpenLitePDFApp, { useOpenLitePDFApp } from '../components/OpenLitePDFApp/OpenLitePDFApp';
import { useQuestManager } from './QuestManager';

const WindowConfigContext = createContext();

const initialWindowConfig = {
  todolist: {
    icon: '/icons/to-do-list.png',
    label: 'To Do List',
    component: Todolist,
    useComponent: useTodoList,
    location: 'desktop',
    clickable: true,
    available: true,
    requiresInternet: false
  },
  mailbox: {
    icon: '/icons/mail.png',
    label: 'Mail',
    component: Mailbox,
    useComponent: useMailbox,
    location: 'desktop',
    clickable: true,
    available: true,
    requiresInternet: true
  },
  browser: {
    icon: '/icons/internet.png',
    label: 'Browser',
    component: Browser,
    useComponent: useBrowser,
    location: 'desktop',
    clickable: true,
    available: true,
    requiresInternet: true
  },
  chatapp: {
    icon: '/icons/chatting.png',
    label: 'Sohbet',
    component: ChatApp,
    useComponent: useChatApp,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: true
  },
  folder: {
    icon: '/icons/folder.png',
    label: 'Folder',
    component: Folder,
    useComponent: useFolder,
    location: 'desktop',
    clickable: true,
    available: true,
    requiresInternet: false
  },
  scanner: {
    icon: '/icons/qr-code.png',
    label: 'QR Scanner',
    component: Scanner,
    useComponent: useScanner,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: false
  },
  antivirus: {
    icon: '/icons/shieldSecure.png',
    label: 'Antivirus',
    component: Antivirus,
    useComponent: useAntivirus,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: false
  },
  novabankapp: {
    icon: '/novaBank/novaLogo.png',
    label: 'NovaBank',
    component: NovabankApp,
    useComponent: useNovabankApp,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: true
  },
  phoneapp: {
    icon: '/PhoneApp/chat.png',
    label: 'Telefon Bağlantısı',
    component: PhoneApp,
    useComponent: usePhoneApp,
    location: 'desktop',
    clickable: true,
    available: true,
    requiresInternet: true
  },
  pdfviewer: {
    icon: '/PDFViewer/pdf.png',
    label: 'PDF Görüntüleyici',
    component: DocuLiteApp,
    useComponent: useDocuLiteApp,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: false
  },
  quickpdfviewer: {
    icon: '/PDFViewer/pdf-logo.png',
    label: 'QuickPDFView',
    component: QuickPDFViewApp,
    useComponent: useQuickPDFViewApp,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: false
  },
  openlitepdfviewer: {
    icon: '/PDFViewer/pdf-logo-open.png',
    label: 'OpenLite PDF',
    component: OpenLitePDFApp,
    useComponent: useOpenLitePDFApp,
    location: 'desktop',
    clickable: true,
    available: false,
    requiresInternet: false
  },
  // hack1: {
  //   icon: '/icons/pdf.png',
  //   label: '2025 - Raporlar',
  //   component: OpenLitePDFApp,
  //   useComponent: useOpenLitePDFApp,
  //   location: 'desktop',
  //   clickable: true,
  //   available: false,
  //   requiresInternet: false
  // },
  // hack2: {
  //   icon: '/icons/zip-file.png',
  //   label: 'Denetim_Puanları.zip',
  //   component: OpenLitePDFApp,
  //   useComponent: useOpenLitePDFApp,
  //   location: 'desktop',
  //   clickable: true,
  //   available: false,
  //   requiresInternet: false
  // },
  // hack3: {
  //   icon: '/icons/virus.png',
  //   label: '************',
  //   component: OpenLitePDFApp,
  //   useComponent: useOpenLitePDFApp,
  //   location: 'desktop',
  //   clickable: true,
  //   available: false,
  //   requiresInternet: false
  // },
  //  hack4: {
  //   icon: '/icons/coding.png',
  //   label: 'pc.jpg',
  //   component: OpenLitePDFApp,
  //   useComponent: useOpenLitePDFApp,
  //   location: 'desktop',
  //   clickable: true,
  //   available: false,
  //   requiresInternet: false
  // },
  // hack5: {
  //   icon: '/icons/play-music.png',
  //   label: 'Video Oynatıcı.jpg',
  //   component: OpenLitePDFApp,
  //   useComponent: useOpenLitePDFApp,
  //   location: 'desktop',
  //   clickable: true,
  //   available: false,
  //   requiresInternet: false
  // }
};

export const WindowConfigProvider = ({ children }) => {
  const [windowConfig, setWindowConfig] = useState(initialWindowConfig);

  const updateAvailableStatus = (windowName, available) => {
    setWindowConfig((prevConfig) => {
    if (!prevConfig[windowName]) return prevConfig; // Yoksa dokunma
    const { [windowName]: existingApp, ...rest } = prevConfig;
    return {
      ...rest,
      [windowName]: {
        ...existingApp,
        available: true
      }
    };
  });
  };

 const addWindowApp = (appName, appConfig) => {          // ÖRNEK KULLANIM:
  setWindowConfig((prevConfig) => {                      // addWindowApp("custompdfviewer", {
    if (prevConfig[appName]) {                           // icon: '/icons/custompdf.png',
      // Eğer zaten varsa available'ı true yap           // label: 'Custom PDF Viewer',
      return {                                           // component: CustomPDFViewer,
        ...prevConfig,                                   // useComponent: useCustomPDFViewer, 
        [appName]: {                                     // location: 'desktop',  
          ...prevConfig[appName],                        // clickable: true,  
          available: true                                // available: true,
        }                                                // requiresInternet: false
      };                                                 // });
    }
    // Yoksa normal ekle
    return {
      ...prevConfig,
      [appName]: appConfig,
    };
  });
};


  return (
    <WindowConfigContext.Provider value={{ windowConfig, setWindowConfig, updateAvailableStatus, addWindowApp }}>
      {children}
    </WindowConfigContext.Provider>
  );
};

export const useWindowConfig = () => useContext(WindowConfigContext);
