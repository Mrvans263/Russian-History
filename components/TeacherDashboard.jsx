import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  const handleApprove = async (id) => {
    await supabase.from('submissions').update({ status: 'approved' }).eq('id', id);
    loadSubmissions();
    alert('Approved!');
  };

  const handleReject = async (id) => {
    await supabase.from('submissions').update({ status: 'rejected' }).eq('id', id);
    loadSubmissions();
    alert('Rejected');
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this post?')) {
      await supabase.from('submissions').delete().eq('id', id);
      loadSubmissions();
      alert('Deleted');
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <h1>👨‍🏫 Teacher Dashboard</h1>
        <p>Review and manage student submissions</p>
      </div>

      <div className="submissions-list">
        {submissions.length === 0 ? (
          <div className="no-submissions">No submissions yet</div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="submission-card">
              {sub.photo_url && <img src={sub.photo_url} alt={sub.museum_name} className="submission-photo" />}
              <div className="submission-info">
                <h3>{sub.museum_name}</h3>
                <p className="student-name">🧑‍🎓 {sub.student_name}</p>
                <p>{sub.description}</p>
                <small>📅 {new Date(sub.created_at).toLocaleDateString()}</small>
                <div className="review-actions">
                  <button className="approve-btn" onClick={() => handleApprove(sub.id)}>✅ Approve</button>
                  <button className="reject-btn" onClick={() => handleReject(sub.id)}>❌ Reject</button>
                  <button className="delete-btn" onClick={() => handleDelete(sub.id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;