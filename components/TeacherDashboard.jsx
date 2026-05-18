// src/components/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CreateTaskModal from './CreateTaskModal';
import TaskSubmissions from './TaskSubmissions';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [selectedTaskForReview, setSelectedTaskForReview] = useState(null);
  const [generatedJoinCode, setGeneratedJoinCode] = useState('');

  useEffect(() => {
    if (user) {
      loadTeacherClasses();
    }
  }, [user]);

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const loadTeacherClasses = async () => {
    setLoading(true);
    
    const { data: classesData, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading classes:', error);
    } else {
      setClasses(classesData || []);
      if (classesData && classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData[0].id);
        loadClassData(classesData[0].id);
      }
    }
    
    setLoading(false);
  };

  const loadClassData = async (classId) => {
    setLoading(true);
    
    // Get class info
    const { data: classData } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();
    setClassInfo(classData);

    // Get tasks for this class
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });
    setTasks(tasksData || []);

    // Get students in this class
    const { data: membersData } = await supabase
      .from('class_members')
      .select('student_id')
      .eq('class_id', classId);
    
    if (membersData && membersData.length > 0) {
      const studentIds = membersData.map(m => m.student_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', studentIds);
      setStudents(profilesData || []);
    } else {
      setStudents([]);
    }

    // Get all submissions for tasks in this class
    if (tasksData && tasksData.length > 0) {
      const taskIds = tasksData.map(t => t.id);
      const { data: subsData } = await supabase
        .from('task_submissions')
        .select('*, task:task_id(*)')
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false });
      setSubmissions(subsData || []);
    } else {
      setSubmissions([]);
    }

    setLoading(false);
  };

  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
    loadClassData(classId);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const joinCode = generateJoinCode();
    
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: newClassName,
        description: newClassDesc,
        join_code: joinCode,
        teacher_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class. Please try again.');
    } else {
      setGeneratedJoinCode(joinCode);
      setShowCreateClass(false);
      setNewClassName('');
      setNewClassDesc('');
      loadTeacherClasses();
      setSelectedClassId(data.id);
      loadClassData(data.id);
    }
  };

  const handleTaskCreated = () => {
    if (selectedClassId) {
      loadClassData(selectedClassId);
    }
  };

  const handleSubmissionReviewed = () => {
    if (selectedClassId) {
      loadClassData(selectedClassId);
    }
  };

  // Calculate stats
  const totalStudents = students.length;
  const totalTasks = tasks.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;

  if (loading && classes.length === 0) {
    return (
      <div className="teacher-dashboard">
        <div className="loading-spinner">Loading your classes...</div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="teacher-header">
        <div>
          <h1>👨‍🏫 Teacher Dashboard</h1>
          <p>Welcome back, {profile?.full_name || user?.email}</p>
        </div>
        <button className="create-class-btn" onClick={() => setShowCreateClass(true)}>
          + New Class
        </button>
      </div>

      {/* Class Selector */}
      {classes.length > 0 ? (
        <div className="class-selector">
          <label>Select Class:</label>
          <select 
            value={selectedClassId || ''} 
            onChange={(e) => handleClassSelect(e.target.value)}
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="no-classes-card">
          <p>📚 You don't have any classes yet. Click "New Class" to get started!</p>
        </div>
      )}

      {selectedClassId && classInfo && (
        <>
          {/* Class Info */}
          <div className="class-info-card">
            <div>
              <h2>{classInfo.name}</h2>
              <p>{classInfo.description || 'No description'}</p>
              <div className="join-code">
                🔑 Join Code: <strong>{classInfo.join_code}</strong>
                <button 
                  className="copy-code-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(classInfo.join_code);
                    alert('Join code copied!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalStudents}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalTasks}</div>
              <div className="stat-label">Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{pendingSubmissions}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{approvedSubmissions}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="tasks-section">
            <div className="section-header">
              <h2>📋 Tasks</h2>
              <button className="add-task-btn" onClick={() => setShowCreateTask(true)}>
                + Create Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="no-tasks-card">
                <p>No tasks yet. Create your first task!</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map(task => {
                  const taskSubmissions = submissions.filter(s => s.task_id === task.id);
                  const pendingCount = taskSubmissions.filter(s => s.status === 'pending').length;
                  const totalCount = taskSubmissions.length;
                  
                  return (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <div>
                          <span className="task-type">
                            {task.type === 'museum' && '🏛️ Museum'}
                            {task.type === 'quiz' && '📝 Quiz'}
                            {task.type === 'essay' && '✍️ Essay'}
                            {task.type === 'reading' && '📖 Reading'}
                            {task.type === 'other' && '📌 Task'}
                          </span>
                          <h3>{task.title}</h3>
                          <p className="task-desc">{task.description}</p>
                        </div>
                        <div className="task-stats">
                          <span className="task-points">{task.points} pts</span>
                          {task.due_date && (
                            <span className="task-due">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="task-progress">
                        <span>Submissions: {totalCount}/{totalStudents}</span>
                        {pendingCount > 0 && (
                          <span className="pending-badge">{pendingCount} pending</span>
                        )}
                      </div>
                      
                      <button 
                        className="review-button"
                        onClick={() => setSelectedTaskForReview(task)}
                      >
                        Review Submissions ({pendingCount})
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Students Section */}
          {students.length > 0 && (
            <div className="students-section">
              <h2>👥 Students ({students.length})</h2>
              <div className="students-list">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Submissions</th>
                      <th>Approved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const studentSubs = submissions.filter(s => s.student_id === student.id);
                      const approvedCount = studentSubs.filter(s => s.status === 'approved').length;
                      
                      return (
                        <tr key={student.id}>
                          <td>{student.full_name || '—'}</td>
                          <td>{student.email}</td>
                          <td>{studentSubs.length}</td>
                          <td>{approvedCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="modal-overlay" onClick={() => setShowCreateClass(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Class</h2>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label>Class Name *</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Russian History Group A"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Class description..."
                  rows="2"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateClass(false)}>Cancel</button>
                <button type="submit">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && selectedClassId && (
        <CreateTaskModal
          classId={selectedClassId}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Review Submissions Modal */}
      {selectedTaskForReview && (
        <TaskSubmissions
          task={selectedTaskForReview}
          submissions={submissions.filter(s => s.task_id === selectedTaskForReview.id)}
          students={students}
          onClose={() => setSelectedTaskForReview(null)}
          onReviewComplete={handleSubmissionReviewed}
        />
      )}

      {/* Success Message for new class */}
      {generatedJoinCode && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <h2>✅ Class Created!</h2>
            <p>Share this code with your students:</p>
            <div className="join-code-large">{generatedJoinCode}</div>
            <button onClick={() => setGeneratedJoinCode('')}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;