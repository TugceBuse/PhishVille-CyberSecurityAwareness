import React, { createContext, useContext, useEffect, useState } from 'react';
import { useEventLog } from './EventLogContext'; // Yolu projene göre düzelt
import { useTimeContext } from './TimeContext';

const VirusContext = createContext();

export const VirusProvider = ({ children }) => {
    const [viruses, setViruses] = useState([]);
    const { gameDate } = useTimeContext();
    const { addEventLog } = useEventLog(); // LOG eklemek için

    const defaultVirusStructure = {
        id: null,
        type: null,
        detectable: false,
        sourcefile: null,
        impact: null,
        severity: "low",
        startTime: null
    };

    // Virüs ekle ve logla
    const addVirus = (newVirus) => {
        const completeVirus = {
            ...defaultVirusStructure,
            ...newVirus,
            id: newVirus.id || `virus-${Date.now()}`,
            startTime: gameDate
              ? gameDate.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
              : new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }),
        };
        const alreadyExists = viruses.some(v => v.id === completeVirus.id);
        if (!alreadyExists) {
            setViruses([...viruses, completeVirus]);
            // LOG: Virüs eklendi
            addEventLog({
                type: "add_virus",
                questId: null,
                logEventType: "virus",
                value: -15,
                data: {
                    id: completeVirus.id,
                    type: completeVirus.type,
                    sourcefile: completeVirus.sourcefile,
                    impact: completeVirus.impact,
                    severity: completeVirus.severity,
                }
            });
        }
    };

    // Virüs sil ve logla (antivirüs)
    const removeVirus = (virusID) => {
        const virus = viruses.find(v => v.id === virusID);
        setViruses(viruses.filter(v => v.id !== virusID));
        if (virus) {
            addEventLog({
                type: "remove_virus",
                questId: null,
                logEventType: "virus",
                value: 10,
                data: {
                    id: virus.id,
                    type: virus.type,
                    sourcefile: virus.sourcefile,
                    impact: virus.impact,
                    severity: virus.severity,
                }
            });
        }
    };

    // Tüm virüsleri sil ve logla (opsiyonel)
    const removeAllViruses = () => {
        viruses.forEach(virus => {
            addEventLog({
                type: "remove_virus",
                questId: null,
                logEventType: "virus",
                value: 10,
                data: {
                    id: virus.id,
                    type: virus.type,
                    sourcefile: virus.sourcefile,
                    impact: virus.impact,
                    severity: virus.severity,
                }
            });
        });
        setViruses([]);
    };

    useEffect(() => {
        console.log("Virüsler güncellendi:", viruses);
    }, [viruses]);
    
    return (
        <VirusContext.Provider value={{
            viruses,
            addVirus,
            removeVirus,
            removeAllViruses
        }}>
            {children}
        </VirusContext.Provider>
    );
};

export const useVirusContext = () => useContext(VirusContext);
