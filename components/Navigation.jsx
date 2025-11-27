// components/Navigation.js - UPDATED
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { LANGUAGES } from '../utils/Languages.jsx';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange, hasSelectedTopic }) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleViewChange = (view) => {
    onViewChange(view);
    setIsMenuOpen(false); // Close menu after selection on mobile
  };

  if (hasSelectedTopic) return null;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>История России</h2>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <button 
            className={`nav-link ${currentView === 'topics' ? 'active' : ''}`}
            onClick={() => handleViewChange('topics')}
          >
            📚 Учебные темы
          </button>
          <button 
            className={`nav-link ${currentView === 'museums' ? 'active' : ''}`}
            onClick={() => handleViewChange('museums')}
          >
            🏛️ Музейная экспозиция
          </button>

          {/* Language Selector - moved inside nav-links for mobile */}
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

        {/* Language Selector - desktop only (hidden on mobile) */}
        <div className="language-selector desktop-only">
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