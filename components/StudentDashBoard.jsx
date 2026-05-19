// src/components/StudentDashBoard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './StudentDashboard.css';

const StudentDashBoard = ({ canUpload = false }) => {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('photo');
  const [museumName, setMuseumName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let name = localStorage.getItem('student_name');
    if (!name) {
      name = prompt('Enter your name:', 'Student') || 'Student';
      localStorage.setItem('student_name', name);
    }
    setStudentName(name);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadAllSubmissions(),
      loadAllTasks()
    ]);
    setLoading(false);
  };

  const loadAllSubmissions = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setAllSubmissions(data || []);
    }
  };

  const loadAllTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setTasks(data || []);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      
      // Detect media type
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('photo');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mediaFile) {
      alert('Please select a photo or video');
      return;
    }
    
    if (!museumName) {
      alert('Please enter the museum name');
      return;
    }

    setUploading(true);

    try {
      let mediaUrl;
      
      if (mediaType === 'photo') {
        mediaUrl = await compressImage(mediaFile);
      } else {
        // For videos, convert to base64 (or you could upload to Supabase storage)
        const reader = new FileReader();
        mediaUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(mediaFile);
        });
      }
      
      const { error } = await supabase.from('submissions').insert({
        student_name: studentName,
        photo_url: mediaType === 'photo' ? mediaUrl : null,
        video_url: mediaType === 'video' ? mediaUrl : null,
        media_type: mediaType,
        museum_name: museumName,
        description: description
      });

      if (error) {
        setUploading(false);
        alert('Error: ' + error.message);
      } else {
        alert('✅ Media shared successfully!');
        setMediaFile(null);
        setMediaPreview(null);
        setMuseumName('');
        setDescription('');
        setShowForm(false);
        setUploading(false);
        await loadAllSubmissions();
      }
    } catch (err) {
      setUploading(false);
      alert('Error submitting. Please try again.');
    }
  };

  if (loading) return <div className="loading-spinner">Loading gallery...</div>;

  return (
    <div className="dashboard-container">
      <div className="class-header">
        <h1>🏛️ Museum Visit Gallery</h1>
        <p>Welcome, {studentName}!</p>
      </div>

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <>
          <h2>📋 Tasks to Complete</h2>
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>🎯 {task.points} points</p>
                <button className="task-btn" onClick={() => alert('Task instructions will appear here')}>
                  Start Task
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Button */}
      {canUpload && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={() => setShowForm(true)} className="share-btn">
            + Share Your Museum Visit
          </button>
        </div>
      )}

      {/* Gallery Section */}
      <h2>📷 All Museum Visits ({allSubmissions.length})</h2>
      
      {allSubmissions.length === 0 ? (
        <div className="no-tasks">
          <p>No museum visits shared yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {allSubmissions.map(sub => (
            <div key={sub.id} className="submission-card">
              {sub.media_type === 'video' ? (
                <video 
                  src={sub.video_url} 
                  className="submission-video"
                  onClick={() => setShowMediaModal(sub)}
                  style={{ cursor: 'pointer' }}
                  poster="/video-poster.jpg"
                />
              ) : (
                sub.photo_url && (
                  <img 
                    src={sub.photo_url} 
                    alt={sub.museum_name} 
                    className="submission-photo"
                    onClick={() => setShowMediaModal(sub)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              )}
              <div className="submission-info">
                <h3>{sub.museum_name}</h3>
                <p className="student-name">🧑‍🎓 {sub.student_name}</p>
                <p>{sub.description}</p>
                <small>📅 {new Date(sub.created_at).toLocaleDateString()}</small>
                {sub.media_type === 'video' && <span className="video-badge">🎥 Video</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Modal - Full Screen View */}
      {showMediaModal && (
        <div className="image-modal-overlay" onClick={() => setShowMediaModal(null)}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowMediaModal(null)}>✕</button>
            
            {showMediaModal.media_type === 'video' ? (
              <video 
                src={showMediaModal.video_url} 
                className="image-modal-full"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img 
                src={showMediaModal.photo_url} 
                alt={showMediaModal.museum_name} 
                className="image-modal-full" 
              />
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

      {/* Upload Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (!uploading) {
            setShowForm(false);
          }
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>📸 Share Your Museum Visit</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Upload Photo or Video *</label>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={handleMediaChange} 
                  required 
                  disabled={uploading} 
                />
                {mediaPreview && mediaType === 'photo' && (
                  <img src={mediaPreview} alt="Preview" className="photo-preview" />
                )}
                {mediaPreview && mediaType === 'video' && (
                  <video src={mediaPreview} className="video-preview" controls />
                )}
              </div>
              
              <div className="form-group">
                <label>Museum Name *</label>
                <input 
                  type="text" 
                  value={museumName} 
                  onChange={(e) => setMuseumName(e.target.value)} 
                  required 
                  disabled={uploading} 
                />
              </div>
              
              <div className="form-group">
                <label>What did you see?</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3" 
                  disabled={uploading} 
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => !uploading && setShowForm(false)} disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashBoard;