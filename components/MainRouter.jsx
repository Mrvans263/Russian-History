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
  const { user, isTeacher, isStudent, loading } = useAuth();
  const [currentView, setCurrentView] = useState('topics');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Auto-redirect to dashboard when logged in
  useEffect(() => {
    if (!loading) {
      if (user && (isTeacher || isStudent)) {
        setCurrentView('class');
      } else if (!user && currentView === 'class') {
        setCurrentView('topics');
      }
    }
  }, [loading, user, isTeacher, isStudent, currentView]);

  if (loading) {
    return (
      <>
        <header className="app-header">
          <h1>Russian History for International Students</h1>
          <p>Explore the rich history of Russia through interactive lessons</p>
        </header>
        <main className="app-main">
          <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>Loading...</div>
        </main>
        <footer className="app-footer">
          <p>RTU MIREA History Project • Created for International Students</p>
        </footer>
      </>
    );
  }

  const renderContent = () => {
    if (showQuiz && currentTopic) {
      return <Quiz topic={currentTopic} onBack={() => setShowQuiz(false)} />;
    }

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

    if (currentView === 'class' && user) {
      if (isTeacher) return <TeacherDashboard />;
      if (isStudent) return <StudentDashboard />;
    }

    if (currentView === 'museums') return <MuseumExploration />;
    return <TopicList onSelectTopic={setCurrentTopic} />;
  };

  return (
    <>
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        hasSelectedTopic={!!currentTopic}
      />
      <header className="app-header">
        <h1>Russian History for International Students</h1>
        <p>Explore the rich history of Russia through interactive lessons</p>
      </header>
      <main className="app-main">{renderContent()}</main>
      <footer className="app-footer">
        <p>RTU MIREA History Project • Created for International Students</p>
      </footer>
    </>
  );
};

export default MainRouter;