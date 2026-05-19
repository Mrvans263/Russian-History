import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../utils/Languages';
import './Navigation.css';

const Navigation = ({ currentView, onViewChange, hasSelectedTopic, role, onRoleChange, onAddTask, onDeletePost }) => {
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
          <button className={`nav-link ${currentView === 'gallery' ? 'active' : ''}`} onClick={() => onViewChange('gallery')}>
            🖼️ Gallery
          </button>
          <button className={`nav-link ${currentView === 'topics' ? 'active' : ''}`} onClick={() => onViewChange('topics')}>
            📚 Learn
          </button>
          <button className={`nav-link ${currentView === 'museums' ? 'active' : ''}`} onClick={() => onViewChange('museums')}>
            🏛️ Museums
          </button>
          
          <button className={`nav-link ${role === 'student' ? 'active' : ''}`} onClick={() => onRoleChange('student')}>
            🧑‍🎓 Student
          </button>
          <button className={`nav-link ${role === 'teacher' ? 'active' : ''}`} onClick={() => onRoleChange('teacher')}>
            👨‍🏫 Teacher
          </button>

          {role === 'teacher' && (
            <>
              <button className="nav-link" onClick={onAddTask}>➕ Add Task</button>
              <button className="nav-link" onClick={onDeletePost}>🗑️ Delete Post</button>
            </>
          )}
          
          <select value={currentLanguage} onChange={(e) => setCurrentLanguage(e.target.value)} className="language-select">
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>{lang.flag} {lang.name}</option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;