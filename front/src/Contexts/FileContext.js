import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUIContext } from './UIContext';
import NovaBankAppSetup from '../exefiles/NovaBankAppSetup/NovaBankAppSetup';

const FileContext = createContext();

export const FileContextProvider = ({ children }) => {
    const { openWindow, closeWindow } = useUIContext();
    
    // Standart dosya şeması
const defaultFileSchema = {
    available: true,
    quarantined: false,
    clickable: true,
    infected: false,
    detectable: false,
    virusType: null,
    type: "txt",
    size: "1KB",
    location: "downloads",
    label: "",
    icon: "/icons/txt.png",
    content: null,
    exeType: null,
    specialView: null,
    extra: {}
};

    // Dosya ve Özellikleri
    const [files, setFiles] = useState({
        benioku: { 
            available: true,
            quarantined: false,
            clickable: true,
            infected: false,
            virusType: null, 
            type: "txt", 
            size: "1KB", 
            location: "downloads", 
            label: "benioku", 
            icon: "/icons/txt.png", 
            content: "/files/benioku.txt",
            locked: false,
            hash: " ",
        },
        rapor_2025: { 
            available: false, 
            clickable: true,
            quarantined: false,
            infected: true,
            detectable: true,
            virusType: "ransomware", 
            type: "docx", 
            size: "2MB", 
            location: "downloads", 
            label: "Rapor_2025", 
            icon: "/icons/docx.png", 
            specialView : "enableContentDocx" ,
            locked: false,
            hash: " ",
        },
        sahtefatura: { 
            available: false,
            clickable: true,
            quarantined: false,
            infected: true,
            detectable: true,
            virusType: "ransomwareHash", 
            type: "docx", 
            size: "4MB", 
            location: "downloads", 
            label: "TechDepo Fatura - 764213938402.pdf", 
            icon: "/icons/docx.png", 
            specialView: "enableContentDocx",
            locked: false,
            hash: " ",
        },
        antivirussetup: { 
            available: false,
            quarantined: false, 
            clickable: true,
            infected: false,
            type: "exe", 
            size: "35MB", 
            location: "downloads", 
            label: "Antivirus Kurulumu", 
            icon: "/icons/setting.png", 
            exeType: "antivirussetup"
        },
        novabankappsetup: {
            available: false,
            quarantined: false,
            clickable: true,
            infected: false,
            type: "exe",
            size: "18MB",
            location: "downloads",
            label: "Nova Bank Kurulumu",
            icon: "/novaBank/NovaBankAppSetup.png",
            exeType: "novabankappsetup"
        },
        taskappsetup: { 
            available: false,
            quarantined: false,
            clickable: true, 
            infected: false,
            type: "exe", 
            size: "12MB", 
            location: "downloads", 
            label: "TaskApp Kurulumu", 
            icon: "/icons/task-list.png", 
            exeType: "taskappsetup"
        },
        taskappsetupf: { 
            available: false,
            quarantined: false, 
            clickable: true,
            infected: true,
            type: "exe", 
            size: "17MB", 
            location: "downloads", 
            label: "TaskApp Kurulumu", 
            icon: "/icons/task-list.png", 
            exeType: "taskappsetupf",
            virusType: "clown",
            detectable: false,
        },
        officedoc: { 
            available: false,
            quarantined: false, 
            clickable: true,
            infected: false, 
            type: "docx", 
            size: "75KB", 
            location: "personal", 
            label: "İş Dosyası", 
            icon: "/icons/docx.png", 
            content: "/files/word1.docx" ,
            locked: false,
        },
        photo1: { 
            available: false,
            quarantined: false, 
            clickable: true,
            infected: false, 
            type: "jpg", 
            size: "363KB", 
            location: "personal", 
            label: "Ofis Fotoğrafı", 
            icon: "/icons/image.png", 
            content: "/images/office.jpg"
        },
        photo12: { 
            available: false,
            quarantined: false,
            clickable: true, 
            infected: false, 
            type: "jpg", 
            size: "363KB", 
            location: "downloads", 
            label: "Ofis Fotoğrafı2", 
            icon: "/icons/image.png", 
            content: "/images/office.jpg"
        },
        photo2: { 
            available: false,
            quarantined: false, 
            clickable: true,
            infected: false, 
            type: "jpg", 
            size: "1.8MB", 
            location: "pictures", 
            label: "Toplantı Fotoğrafı", 
            icon: "/icons/image.png", 
            content: "/images/meeting.jpg"
        },
        kisiselkullanicibilgileri: {
            available: false,
            quarantined: false,
            clickable: true,
            infected: false,
            virusType: null,
            type: "pdf",
            size: "740KB",
            location: "downloads",
            label: "Kullanıcı Bilgileri.pdf",
            icon: "/icons/pdf.png",
            content: "/files/Kişisel_Kullanıcı_Bilgileri.txt",
            locked: false,
            hash: " ",
        },
        issozlesmesi: {
            available: false,
            quarantined: false,
            clickable: true,
            infected: false,
            virusType: null,
            type: "pdf",
            size: "1.2MB",
            location: "downloads",
            label: "İş Sözleşmesi.pdf",
            icon: "/icons/pdf.png",
            content: "/files/İş_Sözleşmesi.txt",
            locked: false,
            hash: " ",
        },
        gizlilikpolitikasi: {
            available: false,
            quarantined: false,
            clickable: true,
            infected: false,
            virusType: null,
            type: "pdf",
            size: "860KB",
            location: "downloads",
            label: "Gizlilik Politikası.pdf",
            icon: "/icons/pdf.png",
            content: "/files/Gizlilik_Politikası.txt",
            locked: false,
            hash: " ",
        },
        personelelkitabi: {
            available: false,
            quarantined: false,
            clickable: true,
            infected: false,
            virusType: null,
            type: "pdf",
            size: "2.1MB",
            location: "downloads",
            label: "Personel El Kitabı.pdf",
            icon: "/icons/pdf.png",
            content: "/files/Personel_El_Kitabı.txt",
            locked: false,
            hash: " ",
        },
        farkindalik_afisi: {
            available: false,
            quarantined: false,
            clickable: true,
            infected: false,
            type: "jpg",
            size: "712KB",
            location: "downloads",
            label: "Farkindalik-Afisi.jpg",
            icon: "/icons/image.png",
            content: "/files/farkindalik_afisi.jpg",
            hash: " ",
            locked: false
        },
        aa: {
            available: true,
            quarantined: false,
            clickable: true,
            infected: false,
            type: "png",
            size: "712KB",
            location: "downloads",
            label: "image.png",
            icon: "/icons/image.png",
            content: "/icons/image.png",
            hash: " ",
            locked: false
        }
    });

    const addFile = (fileName, fileData) => {
        setFiles(prevFiles => ({
            ...prevFiles,
            [fileName]: {
                ...defaultFileSchema,
                ...fileData
            }
        }));
    };

    const deleteFile = (fileName) => {
        setFiles(prevFiles => {
            const newFiles = { ...prevFiles };
            delete newFiles[fileName];
            return newFiles;
        });
        setOpenedFiles(prev => prev.filter(f => f !== fileName));
    };

    useEffect(() => {
        console.log('Files:', files);
    }
    , [files]);

    // 📌 Açılan dosyaları takip eden state
    const [openedFiles, setOpenedFiles] = useState([]);

    // 📌 Dosya durumunu güncelleme fonksiyonu
    const updateFileStatus = (fileName, updates) => {
        setFiles((prevFiles) => {
            // Eğer sadece { available: true } ise ve başka bir alan güncellenmiyorsa
            const updateKeys = Object.keys(updates);
            const isOnlyAvailableTrue = (
            updateKeys.length === 1 &&
            updateKeys[0] === "available" &&
            updates.available === true &&
            prevFiles[fileName] && prevFiles[fileName].available !== true
            );

            if (isOnlyAvailableTrue) {
            // Dosyayı kaldır ve sona ekle
            const { [fileName]: existingFile, ...rest } = prevFiles;
            return {
                ...rest,
                [fileName]: {
                ...existingFile,
                available: true
                }
            };
            }

            // Diğer tüm güncellemeler normal şekilde çalışır
            return {
            ...prevFiles,
            [fileName]: {
                ...prevFiles[fileName],
                ...updates,
            },
            };
        });
    };

    useEffect(() => {
        console.log('openedFiles:', openedFiles);
    }, [openedFiles]);

    // 📌 Dosya açma fonksiyonu
    const openFile = (fileName, theme) => {
        if (
            files[fileName] &&
            !openedFiles.includes(fileName) &&
            !files[fileName].locked // KİLİTLİYSE AÇMA!
        ) {
            setOpenedFiles([...openedFiles, fileName]);
            openWindow(fileName, { theme });
        }
    };

    // 📌 Dosya kapatma fonksiyonu
    const closeFile = (fileName) => {
        console.log('📌 Dosya kapatılıyor:', fileName);
        setOpenedFiles(openedFiles.filter(file => file !== fileName)); // Açılan dosyalar listesinden çıkar
        closeWindow(fileName); // 📌 UIContext ile Taskbar ve pencereyi kapat
    };

    return (
        <FileContext.Provider value={{ files, setFiles, openedFiles, updateFileStatus, openFile, closeFile, addFile, deleteFile }}>
            {children}
        </FileContext.Provider>
    );
};

// 📌 FileContext kullanabilmek için hook
export const useFileContext = () => useContext(FileContext);
