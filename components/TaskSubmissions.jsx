// src/components/TaskSubmissions.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './TaskSubmissions.css';

const TaskSubmissions = ({ task, submissions, students, onClose, onReviewComplete }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState(task.points);
  const [loading, setLoading] = useState(false);

  // Map submissions to students
  const submissionsWithStudents = submissions.map(sub => {
    const student = students.find(s => s.id === sub.student_id);
    return {
      ...sub,
      student_name: student?.full_name || student?.email?.split('@')[0] || 'Unknown',
      student_email: student?.email,
    };
  });

  const pendingSubmissions = submissionsWithStudents.filter(s => s.status === 'pending');
  const reviewedSubmissions = submissionsWithStudents.filter(s => s.status !== 'pending');

  const handleApprove = async (submission) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('task_submissions')
      .update({
        status: 'approved',
        grade: grade,
        feedback: feedback || null,
      })
      .eq('id', submission.id);

    if (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve. Please try again.');
    } else {
      setSelectedSubmission(null);
      setFeedback('');
      setGrade(task.points);
      onReviewComplete();
    }
    
    setLoading(false);
  };

  const handleReject = async (submission) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('task_submissions')
      .update({
        status: 'rejected',
        feedback: feedback || 'Please resubmit with required changes.',
      })
      .eq('id', submission.id);

    if (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject. Please try again.');
    } else {
      setSelectedSubmission(null);
      setFeedback('');
      onReviewComplete();
    }
    
    setLoading(false);
  };

  const viewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || '');
    setGrade(submission.grade || task.points);
  };

  return (
    <div className="submissions-overlay" onClick={onClose}>
      <div className="submissions-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>
        
        <h2>📋 {task.title}</h2>
        <p className="task-info">{task.description}</p>
        
        <div className="submissions-tabs">
          <div className="tab-header">
            <span className={`tab ${selectedSubmission === null ? 'active' : ''}`}>
              Pending ({pendingSubmissions.length})
            </span>
            <span>Reviewed ({reviewedSubmissions.length})</span>
          </div>
        </div>

        <div className="submissions-list">
          {selectedSubmission === null ? (
            // List view
            <>
              {pendingSubmissions.length === 0 && reviewedSubmissions.length === 0 ? (
                <div className="no-submissions">
                  <p>No submissions yet.</p>
                </div>
              ) : (
                <>
                  {pendingSubmissions.length > 0 && (
                    <div className="submission-group">
                      <h3>⏳ Pending Review</h3>
                      {pendingSubmissions.map(sub => (
                        <div key={sub.id} className="submission-item" onClick={() => viewSubmission(sub)}>
                          <div className="submission-student">
                            <span className="student-avatar">🧑‍🎓</span>
                            <div>
                              <div className="student-name">{sub.student_name}</div>
                              <div className="submission-date">
                                Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {sub.photo_url && (
                            <div className="submission-photo-thumb">
                              📸 Photo attached
                            </div>
                          )}
                          <div className="review-badge pending">Pending</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {reviewedSubmissions.length > 0 && (
                    <div className="submission-group">
                      <h3>✅ Reviewed</h3>
                      {reviewedSubmissions.map(sub => (
                        <div key={sub.id} className="submission-item reviewed" onClick={() => viewSubmission(sub)}>
                          <div className="submission-student">
                            <span className="student-avatar">🧑‍🎓</span>
                            <div>
                              <div className="student-name">{sub.student_name}</div>
                              <div className="submission-date">
                                {new Date(sub.submitted_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className={`review-badge ${sub.status}`}>
                            {sub.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Detail view
            <div className="submission-detail">
              <button className="back-button" onClick={() => setSelectedSubmission(null)}>
                ← Back to list
              </button>
              
              <div className="detail-header">
                <h3>{selectedSubmission.student_name}</h3>
                <p className="student-email">{selectedSubmission.student_email}</p>
              </div>
              
              <div className="detail-content">
                <div className="info-row">
                  <span className="info-label">Submitted:</span>
                  <span>{new Date(selectedSubmission.submitted_at).toLocaleString()}</span>
                </div>
                
                {selectedSubmission.photo_url && (
                  <div className="photo-section">
                    <label>Museum Photo:</label>
                    <img 
                      src={selectedSubmission.photo_url} 
                      alt="Museum submission"
                      className="submission-photo"
                      onClick={() => window.open(selectedSubmission.photo_url, '_blank')}
                    />
                  </div>
                )}
                
                {selectedSubmission.content && (
                  <div className="content-section">
                    <label>Student's Note:</label>
                    <div className="content-text">{selectedSubmission.content}</div>
                  </div>
                )}
                
                <div className="review-section">
                  <label>Grade (out of {task.points})</label>
                  <input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(Math.min(parseInt(e.target.value) || 0, task.points))}
                    min="0"
                    max={task.points}
                    className="grade-input"
                  />
                  
                  <label>Feedback (optional)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add feedback for the student..."
                    rows="3"
                    className="feedback-input"
                  />
                </div>
              </div>
              
              <div className="detail-actions">
                <button 
                  className="reject-button" 
                  onClick={() => handleReject(selectedSubmission)}
                  disabled={loading}
                >
                  Reject - Need Resubmission
                </button>
                <button 
                  className="approve-button" 
                  onClick={() => handleApprove(selectedSubmission)}
                  disabled={loading}
                >
                  ✓ Approve & Award Points
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSubmissions;