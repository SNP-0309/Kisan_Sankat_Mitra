import React, { createContext, useContext, useState } from 'react';

const TRANSLATIONS = {
  mr: {
    brandName: 'फसल रक्षक',
    brandTagline: 'संकटात सापडलेल्या पिकासाठी स्मार्ट रिकव्हरी',
    farmerRole: 'शेतकरी (Farmer)',
    buyerRole: 'खरेदीदार (Buyer)',
    adminRole: 'बाजार समिती (APMC Admin)',
    login: 'लॉगिन करा',
    logout: 'बाहेर पडा',
    demoAccounts: 'डेमो खाती (१-क्लिक लॉगिन)',
    sosDisruption: 'संकट / इमर्जन्सी घोषित करा',
    activeHarvests: 'सध्याची पिके व लॉट्स',
    addNewHarvest: '+ नवीन पीक नोंदणी',
    calculateRecovery: 'रिकव्हरी पर्याय शोधा',
    recoveryEngine: 'अल्गोरिथमिक रिकव्हरी इंजिन',
    netReturn: 'निव्वळ नफा (Net Return)',
    grossRevenue: 'एकूण किंमत',
    transportFee: 'वाहतूक खर्च',
    mandiFee: 'बाजार समिती फी',
    executePlan: 'हा रिकव्हरी प्लॅन तात्काळ स्वीकारा',
    mandisNearMe: 'जवळची कृषी केंद्रे व कोल्ड स्टोरेज',
    askAi: 'कृषी AI सहाय्यक (Gemini)',
    statusReady: 'तयार',
    statusDistressed: 'संकटात (Distressed)',
    statusRecovered: 'यशस्वी रिकव्हरी',
    marketplace: 'संकटग्रस्त शेतमाल बाजारपेठ',
    buyNow: 'तात्काळ खरेदी करा',
    governance: 'प्रशासकीय नियंत्रण कक्ष',
    produceValueSaved: 'वाचवलेले आर्थिक मूल्य',
    incidentsResolved: 'निवारण झालेले संकट प्रसंग',
  },
  hi: {
    brandName: 'फसल रक्षक',
    brandTagline: 'संकट में फंसी उपज के लिए स्मार्ट रिकवरी',
    farmerRole: 'किसान (Farmer)',
    buyerRole: 'खरीदार (Buyer)',
    adminRole: 'मंडी प्रशासन (APMC Admin)',
    login: 'लॉगिन करें',
    logout: 'लॉग आउट',
    demoAccounts: 'डेमो खाते (१-क्लिक लॉगिन)',
    sosDisruption: 'संकट / आपातकालीन अलर्ट',
    activeHarvests: 'सक्रिय फसलें और लॉट',
    addNewHarvest: '+ नई फसल जोड़ें',
    calculateRecovery: 'रिकवरी विकल्प खोजें',
    recoveryEngine: 'एल्गोरिद्मिक रिकवरी इंजन',
    netReturn: 'शुद्ध मुनाफा (Net Return)',
    grossRevenue: 'कुल बिक्री मूल्य',
    transportFee: 'परिवहन खर्च',
    mandiFee: 'मंडी शुल्क',
    executePlan: 'यह रिकवरी प्लान तुरंत लागू करें',
    mandisNearMe: 'निकटतम मंडियां और कोल्ड स्टोरेज',
    askAi: 'कृषि AI सहायक (Gemini)',
    statusReady: 'उपलब्ध',
    statusDistressed: 'संकटग्रस्त (Distressed)',
    statusRecovered: 'सफल रिकवरी',
    marketplace: 'डिस्ट्रेस्ड कृषि मार्केटप्लेस',
    buyNow: 'तुरंत खरीदें',
    governance: 'प्रशासनिक डैशबोर्ड',
    produceValueSaved: 'बचाया गया आर्थिक मूल्य',
    incidentsResolved: 'सफलतापूर्वक सुलझाए गए मामले',
  },
  en: {
    brandName: 'FasalRakshak AI',
    brandTagline: 'Intelligent Farm-to-Market Recovery Platform',
    farmerRole: 'Farmer Portal',
    buyerRole: 'Commercial Buyer',
    adminRole: 'APMC Market Admin',
    login: 'Sign In',
    logout: 'Log Out',
    demoAccounts: 'Demo Accounts (1-Click Switch)',
    sosDisruption: 'Declare Disruption / SOS',
    activeHarvests: 'Active Harvest Batches',
    addNewHarvest: '+ Register New Harvest',
    calculateRecovery: 'Calculate Recovery Options',
    recoveryEngine: 'Deterministic Recovery Engine',
    netReturn: 'Net Realized Return',
    grossRevenue: 'Gross Revenue',
    transportFee: 'Transport Cost',
    mandiFee: 'APMC / Platform Fee',
    executePlan: 'Authorize & Execute Recovery Plan',
    mandisNearMe: 'Nearby Mandis & Cold Storage',
    askAi: 'Kisan AI Copilot (Gemini 2.0)',
    statusReady: 'Ready for Sale',
    statusDistressed: 'Distressed (Urgent)',
    statusRecovered: 'Successfully Recovered',
    marketplace: 'Live Distress Sourcing Marketplace',
    buyNow: 'Instant Sourcing Buy',
    governance: 'APMC Telemetry & Governance',
    produceValueSaved: 'Economic Value Protected',
    incidentsResolved: 'Crisis Incidents Resolved',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('mr'); // Default Marathi

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
