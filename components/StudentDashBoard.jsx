// src/components/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UploadPhotoModal from './UploadPhotoModal';
import './StudentDashBoard.css';

const StudentDashBoard = () => {
  const { user, profile } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [classmates, setClassmates] = useState([]);

  useEffect(() => {
    if (user) {
      loadClassData();
    }
  }, [user]);

  const loadClassData = async () => {
    setLoading(true);
    
    try {
      // Get the class the student is enrolled in
      const { data: memberData, error: memberError } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', user.id)
        .single();

      if (memberData) {
        // Get class details
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .eq('id', memberData.class_id)
          .single();
        
        setClassInfo(classData);

        // Get tasks for this class
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('class_id', memberData.class_id)
          .order('due_date', { ascending: true });
        
        setTasks(tasksData || []);

        // Get student's submissions
        const { data: subsData } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('student_id', user.id);
        
        setSubmissions(subsData || []);

        // Get classmates
        const { data: classmatesData } = await supabase
          .from('class_members')
          .select('student_id')
          .eq('class_id', memberData.class_id);
        
        if (classmatesData) {
          const studentIds = classmatesData.map(c => c.student_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', studentIds);
          setClassmates(profilesData || []);
        }
      }
    } catch (error) {
      console.error('Error loading class data:', error);
    }
    
    setLoading(false);
  };

  const getSubmissionStatus = (taskId) => {
    const submission = submissions.find(s => s.task_id === taskId);
    if (!submission) return null;
    return submission;
  };

  const getTaskStatus = (task) => {
    const submission = submissions.find(s => s.task_id === task.id);
    
    if (!submission) {
      return { text: 'Not Started', class: 'status-not-started', icon: '⏳' };
    }
    
    if (submission.status === 'pending') {
      return { text: 'Waiting for Approval', class: 'status-pending', icon: '⏳' };
    }
    
    if (submission.status === 'approved') {
      const points = submission.grade || task.points;
      return { text: `Approved! ${points}/${task.points} pts`, class: 'status-approved', icon: '✅' };
    }
    
    if (submission.status === 'rejected') {
      return { text: 'Needs Resubmission', class: 'status-rejected', icon: '🔄' };
    }
    
    return { text: 'Submitted', class: 'status-pending', icon: '📤' };
  };

  const getTaskAction = (task) => {
    const submission = submissions.find(s => s.task_id === task.id);
    
    if (task.type === 'museum') {
      if (!submission || submission.status === 'rejected') {
        return { text: '📸 Upload Photo', action: () => {
          setSelectedTask(task);
          setShowUploadModal(true);
        }};
      }
      if (submission.status === 'pending') {
        return { text: '⏳ Pending Review', action: null };
      }
      if (submission.status === 'approved') {
        return { text: '✅ Completed', action: null };
      }
    }
    
    if (task.type === 'quiz') {
      return { text: '📝 Take Quiz', action: () => {
        // Navigate to quiz - we'll implement this later
        alert('Quiz feature coming soon!');
      }};
    }
    
    if (task.type === 'essay') {
      if (!submission || submission.status === 'rejected') {
        return { text: '✍️ Submit Essay', action: () => {
          alert('Essay submission coming soon!');
        }};
      }
      return { text: '✅ Submitted', action: null };
    }
    
    return { text: 'View Task', action: null };
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading your class...</div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="dashboard-container">
        <div className="no-class-card">
          <h2>📚 You haven't joined a class yet</h2>
          <p>Ask your teacher for a class code and click the "Login" button to join!</p>
          <button className="refresh-button" onClick={loadClassData}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => {
    const sub = submissions.find(s => s.task_id === t.id);
    return !sub || sub.status !== 'approved';
  });

  const completedTasks = tasks.filter(t => {
    const sub = submissions.find(s => s.task_id === t.id);
    return sub && sub.status === 'approved';
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="class-header">
        <div>
          <h1>📖 {classInfo.name}</h1>
          <p className="class-code">Code: {classInfo.join_code}</p>
        </div>
        <div className="student-badge">
          {profile?.full_name || user?.email}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedTasks.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingTasks.length}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <h2>📋 My Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks yet. Your teacher will add tasks soon!</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => {
              const status = getTaskStatus(task);
              const action = getTaskAction(task);
              const overdue = isOverdue(task.due_date) && status.class !== 'status-approved';
              
              return (
                <div key={task.id} className={`task-card ${status.class}`}>
                  <div className="task-type-badge">
                    {task.type === 'museum' && '🏛️ Museum'}
                    {task.type === 'quiz' && '📝 Quiz'}
                    {task.type === 'essay' && '✍️ Essay'}
                    {task.type === 'reading' && '📖 Reading'}
                    {task.type === 'other' && '📌 Task'}
                  </div>
                  
                  <h3>{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                  
                  <div className="task-meta">
                    <span className="task-points">🎯 {task.points} points</span>
                    {task.due_date && (
                      <span className={`task-due ${overdue ? 'overdue' : ''}`}>
                        📅 Due: {formatDate(task.due_date)}
                        {overdue && ' (Overdue!)'}
                      </span>
                    )}
                  </div>
                  
                  <div className="task-status">
                    <span className={`status-badge ${status.class}`}>
                      {status.icon} {status.text}
                    </span>
                  </div>
                  
                  {action.action && (
                    <button className="task-action-button" onClick={action.action}>
                      {action.text}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="completed-section">
          <h2>✅ Completed Tasks</h2>
          <div className="completed-list">
            {completedTasks.map(task => {
              const submission = submissions.find(s => s.task_id === task.id);
              return (
                <div key={task.id} className="completed-item">
                  <span className="completed-icon">✅</span>
                  <span className="completed-title">{task.title}</span>
                  <span className="completed-points">
                    {submission?.grade || task.points}/{task.points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Classmates Section */}
      {classmates.length > 0 && (
        <div className="classmates-section">
          <h2>👥 Classmates ({classmates.length})</h2>
          <div className="classmates-list">
            {classmates.map(classmate => (
              <div key={classmate.id} className="classmate-card">
                <span className="classmate-avatar">🧑‍🎓</span>
                <span className="classmate-name">
                  {classmate.full_name || classmate.email?.split('@')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedTask && (
        <UploadPhotoModal
          task={selectedTask}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedTask(null);
            loadClassData();
          }}
          onSubmitSuccess={() => {
            loadClassData();
          }}
        />
      )}
    </div>
  );
};

export default StudentDashBoard;