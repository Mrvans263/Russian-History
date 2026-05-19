// src/components/TeacherDashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <div>
          <h1>👨‍🏫 Teacher Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Active Tasks</div>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2>📋 Tasks</h2>
        </div>
        <div className="no-tasks-card">
          <p>No tasks yet. Create your first task!</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;