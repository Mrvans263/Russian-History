// src/components/StudentDashBoard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './StudentDashBoard.css';

const StudentDashBoard = ({ canUpload = false }) => {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  const uploadVideoToStorage = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `videos/${fileName}`;
    
    // Compress video by limiting size (optional - using file directly)
    const { error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 50MB for videos)
      if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        alert('Video must be less than 50MB. Please compress your video.');
        return;
      }
      
      // Check image size (max 5MB)
      if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB.');
        return;
      }
      
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      
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
    setUploadProgress(0);

    try {
      let mediaUrl;
      
      if (mediaType === 'photo') {
        setUploadProgress(50);
        mediaUrl = await compressImage(mediaFile);
        setUploadProgress(100);
      } else {
        // Upload video to storage
        setUploadProgress(30);
        mediaUrl = await uploadVideoToStorage(mediaFile);
        setUploadProgress(100);
      }
      
      const { error } = await supabase.from('submissions').insert({
        student_name: studentName,
        photo_url: mediaType === 'photo' ? mediaUrl : null,
        video_url: mediaType === 'video' ? mediaUrl : null,
        media_type: mediaType,
        museum_name: museumName,
        description: description
      });

      if (error) throw error;
      
      alert('✅ Media shared successfully!');
      setMediaFile(null);
      setMediaPreview(null);
      setMuseumName('');
      setDescription('');
      setShowForm(false);
      setUploadProgress(0);
      await loadAllSubmissions();
      
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
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
                  preload="metadata"
                />
              ) : (
                sub.photo_url && (
                  <img 
                    src={sub.photo_url} 
                    alt={sub.museum_name} 
                    className="submission-photo"
                    onClick={() => setShowMediaModal(sub)}
                    style={{ cursor: 'pointer' }}
                    loading="lazy"
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

      {/* Media Modal */}
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
                preload="metadata"
              />
            ) : (
              <img 
                src={showMediaModal.photo_url} 
                alt={showMediaModal.museum_name} 
                className="image-modal-full" 
                loading="lazy"
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

      {/* Upload Modal with Progress */}
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
                <label>Upload Photo or Video (Max: 5MB photo, 50MB video)</label>
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
                  <video src={mediaPreview} className="video-preview" controls preload="metadata" />
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
              
              {uploading && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" onClick={() => !uploading && setShowForm(false)} disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" disabled={uploading}>
                  {uploading ? `Uploading ${uploadProgress}%...` : 'Share'}
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