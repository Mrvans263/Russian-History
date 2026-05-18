// src/components/Navigation.js - UPDATED with Login Button
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LANGUAGES } from '../utils/Languages.jsx';
import LoginPage from './LoginPage.jsx';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange, hasSelectedTopic }) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const { user, profile, logout, isTeacher, isStudent } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleViewChange = (view) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    // Reset to topics view after logout
    onViewChange('topics');
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getRoleIcon = () => {
    if (isTeacher) return '👨‍🏫';
    if (isStudent) return '🧑‍🎓';
    return '';
  };

  // Hide navigation when viewing a topic (like before)
  if (hasSelectedTopic) return null;

  return (
    <>
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

            {/* Show My Class button only for logged in users */}
            {user && (isStudent || isTeacher) && (
              <button
                className={`nav-link ${currentView === 'class' ? 'active' : ''}`}
                onClick={() => handleViewChange('class')}
              >
                {isTeacher ? '👨‍🏫 My Class' : '📋 My Class'}
              </button>
            )}

            {/* Language Selector - mobile */}
            <div className="language-selector mobile-only">
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

          {/* Right side - Language & Auth */}
          <div className="nav-right">
            {/* Language Selector - desktop */}
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

            {/* Auth Section */}
            {user ? (
              <div className="user-menu-container">
                <button
                  className="user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {getRoleIcon()} {getUserDisplayName()} ▼
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <strong>{profile?.full_name || user.email}</strong>
                      <span className="user-role">{isTeacher ? 'Teacher' : 'Student'}</span>
                    </div>
                    <hr />
                    <button onClick={handleLogout} className="logout-button">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="login-button"
                onClick={() => setShowLoginModal(true)}
              >
                🔑 Login / Join Class
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginPage
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
            // Refresh the page or update state as needed
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default Navigation;