// src/components/MainRouter.jsx
import React, { useState } from 'react';
import StudentDashBoard from './StudentDashBoard';
import TeacherDashboard from './TeacherDashboard';
import TopicList from './TopicList';
import TopicDetail from './TopicDetail';
import Quiz from './Quiz';
import MuseumExploration from './MuseumExploration';
import Navigation from './Navigation';
import CreateTaskModal from './CreateTaskModal';

const MainRouter = () => {
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [currentView, setCurrentView] = useState('gallery');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);

  // Handle role change from Navigation
  const handleRoleChange = (newRole) => {
    console.log('Role changing to:', newRole);
    setRole(newRole);
    setCurrentView('gallery'); // Reset to gallery when role changes
  };

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

  // Teacher mode
  if (role === 'teacher') {
    return (
      <>
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
          hasSelectedTopic={!!currentTopic}
          role={role}
          onRoleChange={handleRoleChange}
          onAddTask={() => setShowAddTask(true)}
          onDeletePost={() => setShowDeletePost(true)}
        />
        <TeacherDashboard />
        {showAddTask && <CreateTaskModal onClose={() => setShowAddTask(false)} onTaskCreated={() => {}} />}
      </>
    );
  }

  // Student mode (default)
  return (
    <>
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        hasSelectedTopic={!!currentTopic}
        role={role}
        onRoleChange={handleRoleChange}
        onAddTask={() => {}}
        onDeletePost={() => {}}
      />
      
      {currentView === 'gallery' && <StudentDashBoard canUpload={true} />}
      
      {currentView === 'topics' && (
        <>
          <header className="app-header">
            <h1>Russian History for International Students</h1>
            <p>Learn, explore museums, and see what others have discovered</p>
          </header>
          <main className="app-main">
            <TopicList onSelectTopic={setCurrentTopic} />
          </main>
        </>
      )}
      
      {currentView === 'museums' && (
        <>
          <header className="app-header">
            <h1>Virtual Museum Tours</h1>
            <p>Explore Moscow's greatest museums</p>
          </header>
          <main className="app-main">
            <MuseumExploration />
          </main>
        </>
      )}
      
      <footer className="app-footer">
        <p>RTU MIREA History Project • Created for International Students</p>
      </footer>
    </>
  );
};

export default MainRouter;