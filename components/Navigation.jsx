// src/components/Navigation.jsx
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../utils/Languages';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange, hasSelectedTopic }) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (hasSelectedTopic) return null;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🏛️ Russian History</h2>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <button 
            className={`nav-link ${currentView === 'gallery' ? 'active' : ''}`} 
            onClick={() => onViewChange('gallery')}
          >
            🖼️ Gallery
          </button>
          <button 
            className={`nav-link ${currentView === 'topics' ? 'active' : ''}`} 
            onClick={() => onViewChange('topics')}
          >
            📚 Learn
          </button>
          <button 
            className={`nav-link ${currentView === 'museums' ? 'active' : ''}`} 
            onClick={() => onViewChange('museums')}
          >
            🏛️ Museums
          </button>
          
          {/* Language Selector */}
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="language-select"
            style={{ marginLeft: '10px', padding: '5px 10px', borderRadius: '8px' }}
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>{lang.flag} {lang.name}</option>
            ))}
          </select>
        </div>

        {/* Mode Switcher */}
        <div className="mode-switcher">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('setMode', { detail: 'visitor' }))}
            className="mode-btn visitor"
            style={{ padding: '6px 12px', margin: '0 3px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#95a5a6', color: 'white' }}
          >
            👁️ View
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('setMode', { detail: 'student' }))}
            className="mode-btn student"
            style={{ padding: '6px 12px', margin: '0 3px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#27ae60', color: 'white' }}
          >
            📸 Post
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('setMode', { detail: 'teacher' }))}
            className="mode-btn teacher"
            style={{ padding: '6px 12px', margin: '0 3px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#e74c3c', color: 'white' }}
          >
            👨‍🏫 Review
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;