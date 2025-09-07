  import Desktop from "../components/Desktop/Desktop.jsx";
  import Notification from "../components/Notifications/Notifications.jsx";
  import { useEffect, useState } from 'react';
  import { GameContextProvider } from '../Contexts/GameContext.js';
  import { FileContextProvider } from '../Contexts/FileContext.js';
  import { UIContextProvider } from '../Contexts/UIContext.js';
  import { MailContextProvider } from '../Contexts/MailContext.js';
  import { VirusProvider } from '../Contexts/VirusContext.js';
  import { SecurityProvider } from '../Contexts/SecurityContext.js'; 
  import { WindowConfigProvider } from '../Contexts/WindowConfigContext.js';
  import { NotificationProvider } from '../Contexts/NotificationContext';
  import { PhoneProvider } from '../Contexts/PhoneContext.js';
  import { TodoProvider } from '../Contexts/TodoContext.js';
  import CargoMailNotifier from '../components/CargoMailNotifier.jsx';
  import { ChatContextProvider } from '../Contexts/ChatContext.js';
  import { TimeProvider } from '../Contexts/TimeContext.js';
  import IntroScreen from '../components/IntroScreen/IntroScreen.jsx';
  import { QuestManagerProvider } from '../Contexts/QuestManager';
  import { NotepadProvider } from '../Contexts/NotepadContext.js';
  import { EventLogProvider } from "../Contexts/EventLogContext.js";
  import ScreenFadeTransition from "./ScreenFadeTransition.jsx";

    const Game = () => {
      useEffect(() => {
        const handleContextMenu = (event) => {
          event.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
          document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);
    const [phase, setPhase] = useState("intro");

    const [fade, setFade] = useState(false);

    const handleIntroFinish = () => {
      setFade(true);                // 1. Fadeyi ekranda göster
      setTimeout(() => {
        setPhase("desktop");        // 2. Fade devam ederken phase değiştir
        setFade(false);             // 3. Fade animasyonu bittiğinde kapat
      }, 600); // Fade süresi ile aynı olmalı!
    };

    return (
      <TimeProvider>
        <EventLogProvider>
          <UIContextProvider>
            <NotificationProvider>
              <Notification />
                <QuestManagerProvider>
                  <SecurityProvider>
                    <VirusProvider>
                      <FileContextProvider>
                        <WindowConfigProvider>
                          <MailContextProvider>
                            <PhoneProvider>
                              <GameContextProvider>
                                <TodoProvider>
                                  <ChatContextProvider>
                                    <NotepadProvider>
                                    <CargoMailNotifier />
                                    <div className="game">
                                    <ScreenFadeTransition show={fade} duration={1300} />
                                      {phase === "intro" ? (
                                        <IntroScreen onFinish={handleIntroFinish} />
                                      ) : (
                                        <Desktop />
                                      )}
                                  </div>
                                  </NotepadProvider>
                                </ChatContextProvider>
                              </TodoProvider>
                            </GameContextProvider>
                          </PhoneProvider>
                        </MailContextProvider>
                      </WindowConfigProvider> 
                    </FileContextProvider>
                  </VirusProvider>
                </SecurityProvider>
              </QuestManagerProvider>
            </NotificationProvider>
          </UIContextProvider>
        </EventLogProvider>
      </TimeProvider>
    );
  };

  export default Game;
