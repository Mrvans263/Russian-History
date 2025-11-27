// components/Navigation.js - UPDATED
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { LANGUAGES } from '../utils/Languages.jsx';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange, hasSelectedTopic }) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  if (hasSelectedTopic) return null;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>История России</h2>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-link ${currentView === 'topics' ? 'active' : ''}`}
            onClick={() => onViewChange('topics')}
          >
            📚 Учебные темы
          </button>
          <button 
            className={`nav-link ${currentView === 'museums' ? 'active' : ''}`}
            onClick={() => onViewChange('museums')}
          >
            🏛️ Музейная экспозиция
          </button>
        </div>

        <div className="language-selector">
          <span className="current-language">
            {LANGUAGES[currentLanguage].flag} {LANGUAGES[currentLanguage].name}
          </span>
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="language-dropdown"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;