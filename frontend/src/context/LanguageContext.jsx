import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    system_title: 'Madrasa Milad Management System',
    welcome: 'Welcome to Milad-un-Nabi Fest 2026',
    home: 'Home',
    dashboard: 'Dashboard',
    students: 'Students',
    houses: 'Houses',
    programs: 'Programs',
    timetable: 'Timetable',
    judge_panel: 'Judge Panel',
    live_scoring: 'Live Scoring',
    results: 'Results',
    certificates: 'Certificates',
    gallery: 'Gallery',
    notice_board: 'Notice Board',
    reports: 'Reports',
    settings: 'Settings',
    search: 'Search',
    login: 'Login',
    logout: 'Logout',
    role: 'Current Role',
    switch_role: 'Switch Role (Demo Mode)',
    countdown: 'Milad Festival Countdown',
    live_leaderboard: 'Live House Leaderboard',
    upcoming_programs: 'Upcoming Programs',
    announcements: 'Announcements & Updates',
    search_placeholder: 'Search students, programs, judges, results...'
  },
  ml: {
    system_title: 'മദ്രസ മീലാദ് മാനേജ്‌മെന്റ് സിസ്റ്റം',
    welcome: 'മീലാദുന്നബി ഫെസ്റ്റ് 2026 ലേക്ക് സ്വാഗതം',
    home: 'ഹോം',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    students: 'വിദ്യാർത്ഥികൾ',
    houses: 'ഹൗസുകൾ',
    programs: 'പ്രോഗ്രാമുകൾ',
    timetable: 'ടൈംടേബിൾ',
    judge_panel: 'ജഡ്ജ് പാനൽ',
    live_scoring: 'ലൈവ് സ്കോറിംഗ്',
    results: 'ഫലങ്ങൾ',
    certificates: 'സർട്ടിഫിക്കറ്റുകൾ',
    gallery: 'ഗാലറി',
    notice_board: 'നോട്ടീസ് ബോർഡ്',
    reports: 'റിപ്പോർട്ടുകൾ',
    settings: 'സെറ്റിംഗ്സ്',
    search: 'തിരയുക',
    login: 'ലോഗിൻ',
    logout: 'ലോഗ് ഔട്ട്',
    role: 'നിലവിലെ റോൾ',
    switch_role: 'റോൾ മാറ്റുക',
    countdown: 'മീലാദ് ഫെസ്റ്റിവൽ കൗണ്ട്ഡൗൺ',
    live_leaderboard: 'ലൈവ് ഹൗസ് ലീഡർബോർഡ്',
    upcoming_programs: 'വരാനിരിക്കുന്ന പ്രോഗ്രാമുകൾ',
    announcements: 'അറിയിപ്പുകൾ',
    search_placeholder: 'വിദ്യാർത്ഥികൾ, പ്രോഗ്രാമുകൾ, ഫലങ്ങൾ എന്നിവ തിരയുക...'
  },
  ar: {
    system_title: 'نظام إدارة مهرجان المولد المدرسي',
    welcome: 'أهلاً بكم في مهرجان المولد النبوي الشريف ٢٠٢٦',
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    students: 'الطلاب',
    houses: 'الفرق/المنازل',
    programs: 'البرامج والمسابقات',
    timetable: 'جدول الفعاليات',
    judge_panel: 'جنة التحكيم',
    live_scoring: 'التقييم المباشر',
    results: 'النتائج',
    certificates: 'الشهادات',
    gallery: 'معرض الصور',
    notice_board: 'لوحة الإعلانات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    search: 'بحث',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    role: 'الدور الحالي',
    switch_role: 'تغيير الدور',
    countdown: 'العد التنازلي للمهرجان',
    live_leaderboard: 'لائحة الصدارة المباشرة',
    upcoming_programs: 'البرامج القادمة',
    announcements: 'الإعلانات والأخبار',
    search_placeholder: 'ابحث عن الطلاب، البرامج، النتائج...'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
