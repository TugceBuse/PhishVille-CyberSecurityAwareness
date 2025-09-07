import React, { createContext, useContext, useEffect, useState } from 'react';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
    // Antivirüs
    const [realTimeProtection, setRealTimeProtection] = useState(false);
    const [antivirusUpdated, setAntivirusUpdated] = useState(false);
    const [antivirusUpdating, setAntivirusUpdating] = useState(false);
    const [scanLogs, setScanLogs] = useState([]);
    const [isWificonnected, setIsWificonnected] = useState(false);
    // Tam koruma: realtime ve güncel birlikteyse aktif olsun
    const [fullProtection, setFullProtection] = useState(false);
    // Sistem güvenliği
    const [domainNetworkEnabled, setDomainNetworkEnabled] = useState(false);
    const [privateNetworkEnabled, setPrivateNetworkEnabled] = useState(false);
    const [publicNetworkEnabled, setPublicNetworkEnabled] = useState(false);

    useEffect(() => {
        if (realTimeProtection && antivirusUpdated)
            setFullProtection(true);
        else
            setFullProtection(false);
    }, [realTimeProtection, antivirusUpdated]);

    return (
        <SecurityContext.Provider value={{
            // Antivirüs
            realTimeProtection, setRealTimeProtection,
            antivirusUpdated, setAntivirusUpdated,
            fullProtection,
            antivirusUpdating, setAntivirusUpdating,
            scanLogs, setScanLogs,
            // Sistem güvenlik ayarları
            domainNetworkEnabled, setDomainNetworkEnabled,
            privateNetworkEnabled, setPrivateNetworkEnabled,
            publicNetworkEnabled, setPublicNetworkEnabled,
            isWificonnected, setIsWificonnected
        }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurityContext = () => useContext(SecurityContext);
