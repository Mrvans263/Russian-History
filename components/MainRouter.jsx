// src/components/MainRouter.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import TopicList from './TopicList';
import TopicDetail from './TopicDetail';
import Quiz from './Quiz';
import MuseumExploration from './MuseumExploration';
import StudentDashBoard from './StudentDashBoard';
import TeacherDashboard from './TeacherDashboard';

const MainRouter = () => {
  const { user, profile, isTeacher, isStudent, loading } = useAuth();
  const [currentView, setCurrentView] = useState('topics');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Handle initial auth check
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Reset view when user logs out
  useEffect(() => {
    if (!user && authChecked) {
      setCurrentView('topics');
      setCurrentTopic(null);
      setShowQuiz(false);
    }
  }, [user, authChecked]);

  const renderContent = () => {
    // Show loading state with better UX
    if (loading || !authChecked) {
      return (
        <div className="loading-container" style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div className="loading-spinner" style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
          </div>
          <div>Loading your account...</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
            Please wait while we set up your profile
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }
    
    // Quiz view - highest priority
    if (showQuiz && currentTopic) {
      return (
        <Quiz 
          topic={currentTopic} 
          onBack={() => {
            setShowQuiz(false);
            setCurrentTopic(null);
          }} 
        />
      );
    }
    
    // Topic detail view
    if (currentTopic) {
      return (
        <TopicDetail 
          topic={currentTopic} 
          onBack={() => {
            setCurrentTopic(null);
            setShowQuiz(false);
          }}
          onTakeQuiz={(topicWithQuiz) => {
            setCurrentTopic(topicWithQuiz);
            setShowQuiz(true);
          }}
        />
      );
    }
    
    // Class Dashboard Views (only for logged in users)
    if (currentView === 'class') {
      // Check if user is logged in
      if (!user) {
        // Redirect to topics if not logged in
        setCurrentView('topics');
        return <TopicList onSelectTopic={setCurrentTopic} />;
      }
      
      // Check role and render appropriate dashboard
      if (isTeacher) {
        return <TeacherDashboard />;
      } else if (isStudent) {
        return <StudentDashboard />;
      } else {
        // Fallback for unknown role
        return (
          <div className="error-container" style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h3 style={{ color: '#e74c3c' }}>Account Setup Required</h3>
            <p>Your account role could not be determined. Please try logging out and back in.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Refresh Page
            </button>
          </div>
        );
      }
    }
    
    // Regular content views (available to everyone, including guests)
    switch (currentView) {
      case 'museums':
        return <MuseumExploration />;
      case 'topics':
      default:
        return <TopicList onSelectTopic={setCurrentTopic} />;
    }
  };

  // Don't render navigation while loading to prevent flicker
  if (loading || !authChecked) {
    return (
      <>
        <header className="app-header">
          <h1>Russian History for International Students</h1>
          <p>Explore the rich history of Russia through interactive lessons</p>
        </header>
        <main className="app-main">
          {renderContent()}
        </main>
        <footer className="app-footer">
          <p>RTU MIREA History Project • Created for International Students</p>
        </footer>
      </>
    );
  }

  return (
    <>
      <Navigation 
        currentView={currentView} 
        onViewChange={(view) => {
          // Prevent changing view while loading
          if (!loading) {
            setCurrentView(view);
            // Clear topic selection when changing views
            if (view !== 'topics') {
              setCurrentTopic(null);
              setShowQuiz(false);
            }
          }
        }}
        hasSelectedTopic={!!currentTopic}
      />
      <header className="app-header">
        <h1>Russian History for International Students</h1>
        <p>Explore the rich history of Russia through interactive lessons</p>
      </header>
      <main className="app-main">
        {renderContent()}
      </main>
      <footer className="app-footer">
        <p>RTU MIREA History Project • Created for International Students</p>
      </footer>
    </>
  );
};

export default MainRouter;