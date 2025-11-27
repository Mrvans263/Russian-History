// components/TopicDetail.js - UPDATED CONTENT RENDERING
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/languages';
import './TopicDetail.css';

const TopicDetail = ({ topic, onBack, onTakeQuiz }) => {
  const { currentLanguage } = useLanguage();
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopicData = async () => {
      setLoading(true);
      try {
        const module = await import(`../topics/lecture${topic.id}.js`);
        setTopicData(module.default);
        
        const currentProgress = localStorage.getItem(`topic_${topic.id}_progress`) || '0';
        if (currentProgress === '0') {
          localStorage.setItem(`topic_${topic.id}_progress`, '10');
        }
      } catch (error) {
        console.error('Error loading topic:', error);
        setTopicData(null);
      }
      setLoading(false);
    };

    loadTopicData();
  }, [topic.id]);

  const handleQuizComplete = (score, totalQuestions, quizPercentage, totalTime) => {
    const readingProgress = 70;
    const totalProgress = Math.min(100, quizPercentage + readingProgress);
    localStorage.setItem(`topic_${topic.id}_progress`, totalProgress.toString());
  };

  // FIXED CONTENT RENDERING FUNCTION
  const renderContent = (content) => {
    if (!content) return <p>Content not available in this language.</p>;
    
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];
    let inList = false;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${elements.length}`} className="content-list">{currentList}</ul>);
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        inList = false;
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      if (trimmedLine.startsWith('# ')) {
        flushList();
        inList = false;
        elements.push(<h1 key={`h1-${index}`} className="content-h1">{trimmedLine.replace('# ', '')}</h1>);
      } 
      else if (trimmedLine.startsWith('## ')) {
        flushList();
        inList = false;
        elements.push(<h2 key={`h2-${index}`} className="content-h2">{trimmedLine.replace('## ', '')}</h2>);
      }
      else if (trimmedLine.startsWith('### ')) {
        flushList();
        inList = false;
        elements.push(<h3 key={`h3-${index}`} className="content-h3">{trimmedLine.replace('### ', '')}</h3>);
      }
      else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        flushList();
        inList = false;
        elements.push(<p key={`p-${index}`} className="content-bold">{trimmedLine.replace(/\*\*/g, '')}</p>);
      }
      else if (trimmedLine.startsWith('- **')) {
        inList = true;
        const boldMatch = trimmedLine.match(/\*\*(.*?)\*\*/);
        const restText = trimmedLine.replace(/- \*\*.*?\*\*:?\s*/, '');
        currentList.push(
          <li key={`li-${index}`} className="content-list-item">
            <strong>{boldMatch ? boldMatch[1] : ''}</strong>
            {restText && ` ${restText}`}
          </li>
        );
      }
      else if (trimmedLine.startsWith('- ')) {
        inList = true;
        currentList.push(
          <li key={`li-${index}`} className="content-list-item">
            {trimmedLine.replace('- ', '')}
          </li>
        );
      }
      else {
        flushList();
        inList = false;
        elements.push(<p key={`p-${index}`} className="content-paragraph">{trimmedLine}</p>);
      }
    });

    flushList(); // Flush any remaining list items
    return elements;
  };

  if (loading) {
    return (
      <div className="topic-detail">
        <button className="back-button" onClick={onBack}>← Back to Topics</button>
        <div className="loading">Loading topic content...</div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="topic-detail">
        <button className="back-button" onClick={onBack}>← Back to Topics</button>
        <div className="error">
          <h3>Topic content not available yet</h3>
          <p>This topic is still under development. Please check back later.</p>
        </div>
      </div>
    );
  }

  const handleTakeQuiz = () => {
    onTakeQuiz({ 
      ...topicData, 
      onQuizComplete: handleQuizComplete 
    });
  };

  return (
    <div className="topic-detail">
      <button className="back-button" onClick={onBack}>← Back to Topics</button>
      
      <div className="topic-header">
        <h2>{getText(topicData.title, currentLanguage)}</h2>
        <p className="russian-title">{topicData.title.russian}</p>
      </div>

      {/* Learning Objectives */}
      {topicData.learningObjectives && topicData.learningObjectives.length > 0 && (
        <div className="learning-objectives">
          <h3>🎯 Learning Objectives</h3>
          <ul>
            {topicData.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Concepts */}
      {topicData.keyConcepts && topicData.keyConcepts.length > 0 && (
        <div className="key-concepts">
          <h3>🔑 Key Concepts</h3>
          <div className="concepts-tags">
            {topicData.keyConcepts.map((concept, index) => (
              <span key={index} className="concept-tag">
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reading Content */}
      <div className="content-section">
        <h3>📖 Reading Material</h3>
        <div className="content-text">
          {renderContent(getText(topicData.content, currentLanguage))}
        </div>
      </div>

      {/* Museum Connection */}
      {topicData.museumConnection && getText(topicData.museumConnection, currentLanguage) && (
        <div className="museum-connection">
          <h3>🏛️ Museum Connection</h3>
          <div className="museum-info">
            <h4>{topicData.relatedMuseum}</h4>
            <div className="museum-content">
              {renderContent(getText(topicData.museumConnection, currentLanguage))}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Button - FIXED: Check if quiz exists and has questions */}
      {topicData.quiz && topicData.quiz.length > 0 ? (
        <button className="quiz-button" onClick={handleTakeQuiz}>
          Take Quiz on This Topic ({topicData.quiz.length} questions)
        </button>
      ) : (
        <div className="no-quiz-available">
          <p>Quiz questions for this topic are coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default TopicDetail;