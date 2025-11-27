// utils/languages.js - UPDATED
export const LANGUAGES = {
  russian: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  english: { code: 'en', name: 'English', flag: '🇺🇸' },
  french: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  spanish: { code: 'es', name: 'Español', flag: '🇪🇸' }
};

export const getText = (obj, language) => {
  if (!obj) return '';
  
  // Return the requested language if it exists and has content
  if (obj[language] && obj[language].trim() !== '') {
    return obj[language];
  }
  
  // If requested language is empty, try Russian (default)
  if (language !== 'russian' && obj.russian && obj.russian.trim() !== '') {
    return obj.russian;
  }
  
  // Fallback to English if available
  if (obj.english && obj.english.trim() !== '') {
    return obj.english;
  }
  
  // Fallback to any available language with content
  const availableLanguages = Object.keys(obj).filter(key => 
    obj[key] && obj[key].trim() !== ''
  );
  
  if (availableLanguages.length > 0) {
    return obj[availableLanguages[0]];
  }
  
  return 'Translation not available';
};