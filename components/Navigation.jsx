// src/components/Navigation.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../utils/Languages';
import LoginPage from './LoginPage';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange, hasSelectedTopic }) => {
  const { user, logout, isStudent, isTeacher } = useAuth();
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (hasSelectedTopic) return null;

  const handleLogout = async () => {
    await logout();
    onViewChange('topics');
  };

  return (
    <>
      <nav className="main-navigation">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>🏛️ Russian History</h2>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </button>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <button className={`nav-link ${currentView === 'topics' ? 'active' : ''}`} onClick={() => onViewChange('topics')}>
              📚 Learn
            </button>
            <button className={`nav-link ${currentView === 'museums' ? 'active' : ''}`} onClick={() => onViewChange('museums')}>
              🏛️ Museums
            </button>
            {user && (isStudent || isTeacher) && (
              <button className={`nav-link ${currentView === 'class' ? 'active' : ''}`} onClick={() => onViewChange('class')}>
                {isTeacher ? '📋 Review Work' : '📸 My Gallery'}
              </button>
            )}
            
            {/* Language Selector */}
            <select 
              value={currentLanguage} 
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="language-select"
            >
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>

          <div className="nav-right">
            {user ? (
              <button className="user-menu-button" onClick={handleLogout}>
                👤 {user.email?.split('@')[0]} | Logout
              </button>
            ) : (
              <button className="login-button" onClick={() => setShowLoginModal(true)}>
                🔑 Login / Join
              </button>
            )}
          </div>
        </div>
      </nav>

      {showLoginModal && (
        <LoginPage onClose={() => setShowLoginModal(false)} onLoginSuccess={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default Navigation;