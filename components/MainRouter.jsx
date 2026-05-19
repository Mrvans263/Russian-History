// src/components/MainRouter.jsx
import React, { useState } from 'react';
import StudentDashBoard from './StudentDashBoard';
import TeacherDashboard from './TeacherDashboard';
import TopicList from './TopicList';
import TopicDetail from './TopicDetail';
import Quiz from './Quiz';
import MuseumExploration from './MuseumExploration';
import Navigation from './Navigation';

const MainRouter = () => {
  const [mode, setMode] = useState('visitor'); // 'visitor', 'student', 'teacher'
  const [currentView, setCurrentView] = useState('gallery'); // 'gallery', 'topics', 'museums'
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Teacher mode - can review and grade
  if (mode === 'teacher') {
    return (
      <>
        <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
          <button onClick={() => setMode('visitor')} style={{ padding: '8px 16px', cursor: 'pointer', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px' }}>
            Exit Teacher Mode
          </button>
        </div>
        <TeacherDashboard />
      </>
    );
  }

  // Student mode - can upload posts
  if (mode === 'student') {
    return (
      <>
        <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
          <button onClick={() => setMode('visitor')} style={{ padding: '8px 16px', cursor: 'pointer', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px' }}>
            Exit Student Mode
          </button>
        </div>
        <StudentDashBoard />
      </>
    );
  }

  // Visitor mode (default) - everyone sees the gallery and can learn
  // Quiz view
  if (showQuiz && currentTopic) {
    return <Quiz topic={currentTopic} onBack={() => setShowQuiz(false)} />;
  }
  
  // Topic detail view
  if (currentTopic) {
    return (
      <TopicDetail 
        topic={currentTopic} 
        onBack={() => setCurrentTopic(null)}
        onTakeQuiz={(topicWithQuiz) => {
          setCurrentTopic(topicWithQuiz);
          setShowQuiz(true);
        }}
      />
    );
  }
  
  // Gallery view - everyone can see posts (default)
  if (currentView === 'gallery') {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <header className="app-header">
          <h1>🏛️ Museum Visit Gallery</h1>
          <p>See what everyone has discovered in Moscow's museums</p>
        </header>
        <main className="app-main">
          <StudentDashBoard /> {/* This shows all posts - no upload button in visitor mode */}
        </main>
        <footer className="app-footer">
          <p>RTU MIREA History Project • Created for International Students</p>
        </footer>
      </>
    );
  }
  
  // Museums view
  if (currentView === 'museums') {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <header className="app-header">
          <h1>Virtual Museum Tours</h1>
          <p>Explore Moscow's greatest museums</p>
        </header>
        <main className="app-main">
          <MuseumExploration />
        </main>
        <footer className="app-footer">
          <p>RTU MIREA History Project</p>
        </footer>
      </>
    );
  }
  
  // Topics view (learning material)
  return (
    <>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <header className="app-header">
        <h1>Russian History for International Students</h1>
        <p>Learn, explore museums, and see what others have discovered</p>
      </header>
      <main className="app-main">
        <TopicList onSelectTopic={setCurrentTopic} />
      </main>
      <footer className="app-footer">
        <p>RTU MIREA History Project • Created for International Students</p>
      </footer>
    </>
  );
};

export default MainRouter;