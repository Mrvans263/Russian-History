// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = ({ onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  // Get auth functions
  const { signIn, signUp, joinClass, user, loading: authLoading } = useAuth();

  // Clear error when switching modes
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
    setClassCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!isLogin && mode === 'student' && !classCode) {
      setError('Please enter your class code to sign up');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // LOGIN
        const { error: signInError } = await signIn(email, password);
        
        if (signInError) {
          setError(signInError.message || 'Login failed. Please check your credentials.');
          setLoading(false);
          return;
        }
        
        // Login successful
        onLoginSuccess?.();
        onClose?.();
      } else {
        // SIGNUP
        const { error: signUpError } = await signUp(email, password, fullName.trim(), mode);
        
        if (signUpError) {
          setError(signUpError.message || 'Signup failed. Please try again.');
          setLoading(false);
          return;
        }
        
        // Signup successful
        if (mode === 'student') {
          // Store the class code for joining after signup
          setJustSignedUp(true);
          setShowJoinModal(true);
          setLoading(false);
        } else {
          // Teacher signup successful - no class to join
          onLoginSuccess?.();
          onClose?.();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await joinClass(classCode);
      
      if (result.error) {
        setError(result.error.message || 'Failed to join class. Please check the code and try again.');
        setLoading(false);
        return;
      }
      
      // Successfully joined class
      onLoginSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Join class error:', err);
      setError('Failed to join class. Please try again.');
      setLoading(false);
    }
  };

  // Show join class modal after student signup
  if (showJoinModal && (justSignedUp || (user && mode === 'student'))) {
    return (
      <div className="login-overlay" onClick={onClose}>
        <div className="login-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>✕</button>
          <h2>🎉 Welcome to Russian History!</h2>
          <p>Your account has been created. Please join your class using the code from your teacher:</p>
          <form onSubmit={handleJoinClass}>
            <div className="form-group">
              <label>Class Code</label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                required
                maxLength="10"
                autoFocus
              />
              <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
                Don't have a code? Ask your teacher to create a class and share the join code.
              </small>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ 
                  background: '#95a5a6', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
              >
                Skip for Now
              </button>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Joining...' : 'Join Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>
        
        <div className="mode-tabs">
          <button 
            className={`mode-tab ${mode === 'student' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('student')}
          >
            🧑‍🎓 Student
          </button>
          <button 
            className={`mode-tab ${mode === 'teacher' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('teacher')}
          >
            👨‍🏫 Teacher
          </button>
        </div>

        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="mode-description">
          {mode === 'student' 
            ? 'Join your class to track progress and submit museum visits' 
            : 'Login to manage your class and review student submissions'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              autoComplete={isLogin ? "email" : "off"}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
              disabled={loading}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {!isLogin && (
              <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
                Password must be at least 6 characters
              </small>
            )}
          </div>

          {!isLogin && mode === 'student' && (
            <div className="form-group">
              <label>Class Code *</label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Enter code from your teacher"
                required
                maxLength="10"
                disabled={loading}
              />
              <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
                Need a code? Ask your teacher to create a class and share the 6-character code.
              </small>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading || authLoading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="toggle-mode">
          <button type="button" onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setFullName('');
            setClassCode('');
          }}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>

        <div className="guest-note">
          <hr />
          <p>🎓 Continue as <strong>Guest</strong> to browse lectures and quizzes</p>
          <p className="guest-hint">Login only needed for class participation and submissions</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;