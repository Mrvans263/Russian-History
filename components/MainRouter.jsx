// components/MainRouter.js
import React, { useState } from 'react';
import Navigation from './Navigation';
import TopicList from './TopicList';
import TopicDetail from './TopicDetail';
import Quiz from './Quiz';
import MuseumExploration from './MuseumExploration';

const MainRouter = () => {
  const [currentView, setCurrentView] = useState('topics');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const renderContent = () => {
    if (showQuiz && currentTopic) {
      return <Quiz topic={currentTopic} onBack={() => setShowQuiz(false)} />;
    }
    if (currentTopic) {
      return (
        <TopicDetail 
  topic={currentTopic} 
  onBack={() => setCurrentTopic(null)}
  onTakeQuiz={(topicWithQuiz) => {      // ← FIXED!
    setCurrentTopic(topicWithQuiz);
    setShowQuiz(true);
  }}
/>
      );
    }
    switch (currentView) {
      case 'museums': return <MuseumExploration />;
      case 'topics':
      default: return <TopicList onSelectTopic={setCurrentTopic} />;
    }
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