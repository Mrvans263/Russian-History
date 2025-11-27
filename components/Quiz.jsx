// components/Quiz.js
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext'
import { getText } from '../utils/Languages';
import './Quiz.css';

const Quiz = ({ topic, onBack }) => {
  const { currentLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState({});
  const [startTime, setStartTime] = useState(null);

  const questions = topic.quiz || [];

  // Start quiz timer when component mounts or quiz starts
  useEffect(() => {
    if (quizStarted && !showScore) {
      setStartTime(Date.now());
    }
  }, [quizStarted, currentQuestion, showScore]);

  // Handle answer selection
  const handleAnswerClick = (selectedIndex) => {
    if (isAnswered) return;

    // Calculate time taken for this question
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setTimePerQuestion(prev => ({
      ...prev,
      [currentQuestion]: timeTaken
    }));

    setSelectedAnswer(selectedIndex);
    setIsAnswered(true);

    // Check if answer is correct
    if (selectedIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  // Move to next question or finish quiz
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setStartTime(Date.now());
    } else {
      setShowScore(true);
      // Calculate total quiz time
      const totalTime = Object.values(timePerQuestion).reduce((sum, time) => sum + time, 0);
      
      // Update progress if callback provided
      if (topic.onQuizComplete) {
        const quizPercentage = (score / questions.length) * 100;
        topic.onQuizComplete(score, questions.length, quizPercentage, totalTime);
      }
    }
  };

  // Restart quiz
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimePerQuestion({});
    setStartTime(Date.now());
  };

  // Start quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  // Format time in minutes and seconds
  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate average time per question
  const getAverageTime = () => {
    const times = Object.values(timePerQuestion);
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  // If no questions available
  if (questions.length === 0) {
    return (
      <div className="quiz">
        <button className="back-button" onClick={onBack}>← Back to Topic</button>
        <div className="quiz-header">
          <h2>Quiz: {getText(topic.title, currentLanguage)}</h2>
        </div>
        <div className="no-questions">
          <p>No quiz questions available for this topic yet.</p>
          <button onClick={onBack} className="return-button">Return to Topic</button>
        </div>
      </div>
    );
  }

  // Quiz introduction screen
  if (!quizStarted) {
    return (
      <div className="quiz">
        <button className="back-button" onClick={onBack}>← Back to Topic</button>
        <div className="quiz-intro">
          <div className="intro-card">
            <h2>Quiz: {getText(topic.title, currentLanguage)}</h2>
            <div className="quiz-info">
              <div className="info-item">
                <span className="info-label">Number of Questions:</span>
                <span className="info-value">{questions.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Topic:</span>
                <span className="info-value">{getText(topic.title, currentLanguage)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Instructions:</span>
                <span className="info-value">Read each question carefully and select the best answer.</span>
              </div>
            </div>
            <button className="start-quiz-button" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showScore) {
    const percentage = Math.round((score / questions.length) * 100);
    const totalTime = Object.values(timePerQuestion).reduce((sum, time) => sum + time, 0);
    const averageTime = getAverageTime();

    // Determine performance message
    let performanceMessage = '';
    let performanceClass = '';
    if (percentage >= 90) {
      performanceMessage = 'Excellent! Perfect score!';
      performanceClass = 'excellent';
    } else if (percentage >= 75) {
      performanceMessage = 'Great job! Well done!';
      performanceClass = 'great';
    } else if (percentage >= 60) {
      performanceMessage = 'Good effort! Keep practicing.';
      performanceClass = 'good';
    } else {
      performanceMessage = 'Keep studying and try again!';
      performanceClass = 'needs-improvement';
    }

    return (
      <div className="quiz">
        <button className="back-button" onClick={onBack}>← Back to Topic</button>
        
        <div className="score-section">
          <div className="score-card">
            <h2>Quiz Complete!</h2>
            <div className="score-result">
              <div className="score-circle">
                <span className="score-percentage">{percentage}%</span>
                <span className="score-text">Score</span>
              </div>
              <div className="score-details">
                <div className="detail-item">
                  <span className="detail-label">Correct Answers:</span>
                  <span className="detail-value">{score} / {questions.length}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Time:</span>
                  <span className="detail-value">{formatTime(totalTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Average per Question:</span>
                  <span className="detail-value">{formatTime(averageTime)}</span>
                </div>
              </div>
            </div>
            
            <div className={`performance-message ${performanceClass}`}>
              {performanceMessage}
            </div>
            
            <div className="score-actions">
              <button onClick={resetQuiz} className="retake-button">
                ↻ Retake Quiz
              </button>
              <button onClick={onBack} className="return-button">
                ← Return to Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Current question screen
  const currentQ = questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz">
      <button className="back-button" onClick={onBack}>← Back to Topic</button>

      <div className="quiz-header">
        <h2>Quiz: {getText(topic.title, currentLanguage)}</h2>
        <div className="quiz-progress">
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="question-section">
        <div className="question-content">
          <div className="question-text">
            {getText(currentQ.question, currentLanguage)}
          </div>
          
          <div className="answer-options">
            {currentQ.options.map((option, index) => {
              const isCorrect = index === currentQ.correctAnswer;
              const isSelected = index === selectedAnswer;
              
              let buttonClass = "answer-button";
              if (isAnswered) {
                if (isCorrect) {
                  buttonClass += " correct";
                } else if (isSelected && !isCorrect) {
                  buttonClass += " incorrect";
                } else if (isCorrect) {
                  buttonClass += " correct-not-selected";
                }
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleAnswerClick(index)}
                  disabled={isAnswered}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">
                    {getText(option, currentLanguage)}
                  </span>
                  {isAnswered && isCorrect && (
                    <span className="answer-feedback correct-mark">✓ Correct</span>
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <span className="answer-feedback incorrect-mark">✗ Incorrect</span>
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="feedback-section">
              <div className={`feedback ${selectedAnswer === currentQ.correctAnswer ? 'correct' : 'incorrect'}`}>
                {selectedAnswer === currentQ.correctAnswer 
                  ? "✅ Correct! Well done." 
                  : "❌ That's not quite right. Review this topic and try again."
                }
              </div>
              <button onClick={handleNextQuestion} className="next-button">
                {currentQuestion + 1 === questions.length ? "Finish Quiz" : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;