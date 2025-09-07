import { useEffect, useRef } from 'react';
import { useFileContext } from '../../Contexts/FileContext';
import { useVirusContext } from '../../Contexts/VirusContext';
import { useWindowConfig } from '../../Contexts/WindowConfigContext';
import { useUIContext } from '../../Contexts/UIContext';
import { showFakeCMD } from '../../utils/fakeCMD';
import { useNotificationContext } from '../../Contexts/NotificationContext';
import { useGameContext } from '../../Contexts/GameContext';

const binaryMessage = "01000010 01110101 00100000 01100010 01101001 01110010 00100000 01000010 01101001 01101110 01100001 01110010 01111001 00100000 01010100 01100101 01110011 01110100 00101101 01101101 01100101 01110011 01100001 01101010 11000100 10110001 01100100 11000100 10110001 01110010 00001010";

const TaskAppSetupF = ({ file, fileName, onAntivirusCheck }) => {
  const { setFiles } = useFileContext();
  const { addVirus } = useVirusContext();
  const { lockMouse, unlockMouse, setOpenWindows } = useUIContext();
  const { setWindowConfig, windowConfig } = useWindowConfig();
  const { addNotification } = useNotificationContext();
  const hasStarted = useRef(false);

  const { endGame } = useGameContext();

  useEffect(() => {
    const handleClick = async () => {
      if (hasStarted.current) return;

      // ANTIVIRUS CHECK: Virüs etkisi başlamadan kontrol!
      if (typeof onAntivirusCheck === "function") {
        const result = await onAntivirusCheck({ customVirusType: "clown" });
        if (result === "blocked") return;
      }

      hasStarted.current = true;
      lockMouse();

      addVirus({
        id: "deadlyclown",
        type: "clown",
        detectable: false,
        sourcefile: fileName,
        impact: null,
        severity: "high",
      });

      setTimeout(() => {
        showFakeCMD({
          lines: [
            "copy clown.bat C:\\Windows\\System32",
            "copy clown.bat C:\\Windows\\System32",
            "clown.bat çalıştırılıyor...",
            "..."
          ],
          duration: 500
        });
      }, 5000);

      setTimeout(() => {  
        addNotification({
          type: "warning",
          appType: "system",
          title: "Sistem Sıcaklığı Yüksek",
          message: "CPU sıcaklığı 99°C'ye ulaştı. Bilgisayarınız aşırı ısınabilir.",
          icon: "/icons/warning.png",
          isPopup: true,
          isTaskbar: false,
          duration: 6000
        });
      }, 3500);

      setTimeout(async () => {
        setOpenWindows([]);
        for (const key of Object.keys(windowConfig)) {
          setWindowConfig(prev => ({
            ...prev,
            [key]: { ...prev[key], available: false }
          }));
          await new Promise(res => setTimeout(res, 550));
        }

        const allBits = binaryMessage.replace(/\s+/g, '');
        const totalFiles = 84;
        const baseChunkSize = Math.floor(allBits.length / totalFiles);
        const extraBits = allBits.length % totalFiles;
        let pointer = 0;

        for (let i = 0; i < totalFiles; i++) {
          const chunkLength = baseChunkSize + (i < extraBits ? 1 : 0);
          const bitChunk = allBits.slice(pointer, pointer + chunkLength);
          const fileName = `clownfile_${i}`;

          setFiles(prev => ({
            ...prev,
            [fileName]: {
              available: true,
              quarantined: false,
              infected: true,
              type: "bin",
              size: "1KB",
              location: "desktop",
              label: bitChunk,
              icon: "/icons/clown.png",
              content: bitChunk
            }
          }));

          pointer += chunkLength;
          await new Promise(res => setTimeout(res, 200));
        }
      }, 4500);

      setTimeout(() => {
        showFakeCMD({
          lines: [
            "taskkill /F /IM explorer.exe",
            "BAŞARI: explorer.exe sonlandırıldı.",
            "del /F /Q C:\\Users\\Onur\\Desktop\\*.*",
            "cipher /w:C:\\"
          ],
          duration: 500
        });
      }, 6500);

      setTimeout(() => {
        showFakeCMD({
          lines: [
            "copy clown.exe C:\\Windows\\System32",
            "reg add ...\\Run /v Clown /t REG_SZ /d clown.exe",
            "shutdown /s /f /t 10"
          ],
          duration: 500
        });
      }, 8000);

      setTimeout(() => {
        unlockMouse();
        // ENTEGRASYON: Virüs etkileri bittikten sonra oyunu bitir
        endGame({
          title: "Sistem Kritik Virüsle Kapatıldı!",
          description: "Sisteminiz, clown virüsü nedeniyle kapatıldı. Sonuçlarınız kaydedildi."
        });
      }, 30000);
    };

    window.addEventListener('click', handleClick, { once: true });
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [
    setFiles,
    addVirus,
    lockMouse,
    unlockMouse,
    setWindowConfig,
    windowConfig,
    onAntivirusCheck,
    fileName,
    addNotification,
    endGame // DİKKAT!
  ]);

  return null;
};

export default TaskAppSetupF;
