// src/components/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMediaModal, setShowMediaModal] = useState(null);
  const [showImageIndex, setShowImageIndex] = useState(0);

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
    alert('✅ Approved!');
  };

  const handleReject = async (id) => {
    await supabase.from('submissions').update({ status: 'rejected' }).eq('id', id);
    loadSubmissions();
    alert('❌ Rejected');
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this post?')) {
      await supabase.from('submissions').delete().eq('id', id);
      loadSubmissions();
      alert('🗑️ Deleted');
    }
  };

  const openMediaModal = (submission, startIndex = 0) => {
    setShowMediaModal(submission);
    setShowImageIndex(startIndex);
  };

  const nextImage = () => {
    if (showMediaModal && showMediaModal.images) {
      const nextIndex = (showImageIndex + 1) % showMediaModal.images.length;
      setShowImageIndex(nextIndex);
    }
  };

  const prevImage = () => {
    if (showMediaModal && showMediaModal.images) {
      const prevIndex = (showImageIndex - 1 + showMediaModal.images.length) % showMediaModal.images.length;
      setShowImageIndex(prevIndex);
    }
  };

  if (loading) return <div className="loading-spinner">Loading submissions...</div>;

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <h1>👨‍🏫 Teacher Dashboard</h1>
        <p>Review and manage student museum submissions</p>
      </div>

      <div className="submissions-list">
        {submissions.length === 0 ? (
          <div className="no-submissions">No submissions yet</div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="submission-card">
              {/* Display video or first image as cover */}
              {sub.video_url ? (
                <video 
                  src={sub.video_url} 
                  className="submission-video"
                  onClick={() => openMediaModal(sub, 0)}
                  style={{ cursor: 'pointer' }}
                  preload="metadata"
                />
              ) : sub.images && sub.images.length > 0 ? (
                <div className="image-gallery-preview">
                  <img 
                    src={sub.images[0]} 
                    alt={sub.museum_name} 
                    className="submission-photo"
                    onClick={() => openMediaModal(sub, 0)}
                    style={{ cursor: 'pointer' }}
                    loading="lazy"
                  />
                  {sub.images.length > 1 && (
                    <div className="image-count-badge">
                      +{sub.images.length - 1} more
                    </div>
                  )}
                </div>
              ) : null}
              
              <div className="submission-info">
                <h3>{sub.museum_name}</h3>
                <p className="student-name">🧑‍🎓 {sub.student_name}</p>
                <p>{sub.description}</p>
                <small>📅 {new Date(sub.created_at).toLocaleDateString()}</small>
                <div className="media-badges">
                  {sub.images && sub.images.length > 0 && (
                    <span className="image-badge">📸 {sub.images.length} images</span>
                  )}
                  {sub.video_url && (
                    <span className="video-badge">🎥 Video</span>
                  )}
                </div>
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

      {/* Media Modal - For viewing images and videos */}
      {showMediaModal && (
        <div className="image-modal-overlay" onClick={() => setShowMediaModal(null)}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowMediaModal(null)}>✕</button>
            
            {showMediaModal.video_url ? (
              <video 
                src={showMediaModal.video_url} 
                className="image-modal-full"
                controls
                autoPlay
                playsInline
                preload="metadata"
              />
            ) : showMediaModal.images && showMediaModal.images.length > 0 && (
              <>
                {showMediaModal.images.length > 1 && (
                  <>
                    <button className="modal-nav prev" onClick={prevImage}>❮</button>
                    <button className="modal-nav next" onClick={nextImage}>❯</button>
                  </>
                )}
                
                <img 
                  src={showMediaModal.images[showImageIndex]} 
                  alt={`${showMediaModal.museum_name} - ${showImageIndex + 1}`}
                  className="image-modal-full" 
                  loading="lazy"
                />
                
                {showMediaModal.images.length > 1 && (
                  <div className="image-counter">
                    {showImageIndex + 1} / {showMediaModal.images.length}
                  </div>
                )}
              </>
            )}
            
            <div className="image-modal-info">
              <h3>{showMediaModal.museum_name}</h3>
              <p className="student-name">🧑‍🎓 {showMediaModal.student_name}</p>
              <p>{showMediaModal.description}</p>
              <small>📅 {new Date(showMediaModal.created_at).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;