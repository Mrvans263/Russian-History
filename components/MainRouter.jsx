// src/components/MainRouter.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import StudentDashBoard from './StudentDashBoard';
import TeacherDashboard from './TeacherDashboard';
import TopicList from './TopicList';
import MuseumExploration from './MuseumExploration';
import Navigation from './Navigation';

const MainRouter = () => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simple check - just use a button to switch modes
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  // Teacher mode - show teacher dashboard
  if (isTeacher) {
    return (
      <>
        <button 
          onClick={() => setIsTeacher(false)}
          style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, padding: '8px 16px', cursor: 'pointer' }}
        >
          Switch to Student View
        </button>
        <TeacherDashboard />
      </>
    );
  }

  // Student mode - show student dashboard
  return (
    <>
      <button 
        onClick={() => setIsTeacher(true)}
        style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, padding: '8px 16px', cursor: 'pointer' }}
      >
        Switch to Teacher View
      </button>
      <StudentDashBoard />
    </>
  );
};

export default MainRouter;