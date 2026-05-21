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
  const [showImageIndex, setShowImageIndex] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Media state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
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
    
    const { error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 10) {
      alert('Maximum 10 images per post');
      return;
    }
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} exceeds 5MB limit`);
        return;
      }
    }
    
    setImages([...images, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('Video must be less than 50MB');
        return;
      }
      
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0 && !videoFile) {
      alert('Please select at least one photo or a video');
      return;
    }
    
    if (!museumName) {
      alert('Please enter the museum name');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let compressedImages = [];
      let videoUrl = null;
      let totalItems = (images.length > 0 ? 1 : 0) + (videoFile ? 1 : 0);
      let completed = 0;
      
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const compressed = await compressImage(images[i]);
          compressedImages.push(compressed);
          completed++;
          setUploadProgress(Math.round((completed / totalItems) * 100));
        }
      }
      
      if (videoFile) {
        videoUrl = await uploadVideoToStorage(videoFile);
        completed++;
        setUploadProgress(Math.round((completed / totalItems) * 100));
      }
      
      const { error } = await supabase.from('submissions').insert({
        student_name: studentName,
        images: compressedImages.length > 0 ? compressedImages : null,
        video_url: videoUrl,
        museum_name: museumName,
        description: description
      });

      if (error) throw error;
      
      alert('✅ Post shared successfully!');
      
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      
      setImages([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
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

  if (loading) return <div className="loading-spinner">Loading gallery...</div>;

  return (
    <div className="dashboard-container">
      <div className="class-header">
        <h1>🏛️ Museum Visit Gallery</h1>
        <p>Welcome, {studentName}!</p>
      </div>

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

      {canUpload && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={() => setShowForm(true)} className="share-btn">
            + Share Your Museum Visit
          </button>
        </div>
      )}

      <h2>📷 All Museum Visits ({allSubmissions.length})</h2>
      
      {allSubmissions.length === 0 ? (
        <div className="no-tasks">
          <p>No museum visits shared yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {allSubmissions.map(sub => (
            <div key={sub.id} className="submission-card">
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
                {sub.images && sub.images.length > 0 && <span className="image-badge">📸 {sub.images.length} images</span>}
                {sub.video_url && <span className="video-badge">🎥 Video</span>}
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

      {/* Upload Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (!uploading) {
            setShowForm(false);
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            if (videoPreview) URL.revokeObjectURL(videoPreview);
            setImages([]);
            setImagePreviews([]);
            setVideoFile(null);
            setVideoPreview(null);
          }
        }}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <h2>📸 Share Your Museum Visit</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Upload Photos (Max 10 images, up to 5MB each)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  multiple
                  disabled={uploading}
                />
                
                {imagePreviews.length > 0 && (
                  <div className="image-previews-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                          disabled={uploading}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Or Upload a Video (Max 50MB)</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoChange}
                  disabled={uploading}
                />
                {videoPreview && (
                  <div className="video-preview-container">
                    <video src={videoPreview} className="video-preview" controls preload="metadata" />
                    <button 
                      type="button" 
                      className="remove-video-btn"
                      onClick={removeVideo}
                      disabled={uploading}
                    >
                      Remove Video
                    </button>
                  </div>
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
                <button type="submit" disabled={uploading || (images.length === 0 && !videoFile)}>
                  {uploading ? `Uploading ${uploadProgress}%...` : 'Share Post'}
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