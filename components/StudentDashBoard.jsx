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
  
  // Multiple images support
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 10 images
    if (images.length + files.length > 10) {
      alert('Maximum 10 images per post');
      return;
    }
    
    // Check each file size
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} exceeds 5MB limit`);
        return;
      }
    }
    
    setImages([...images, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('Please select at least one photo');
      return;
    }
    
    if (!museumName) {
      alert('Please enter the museum name');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const compressedImages = [];
      const totalImages = images.length;
      
      for (let i = 0; i < images.length; i++) {
        const compressed = await compressImage(images[i]);
        compressedImages.push(compressed);
        setUploadProgress(Math.round(((i + 1) / totalImages) * 100));
      }
      
      const { error } = await supabase.from('submissions').insert({
        student_name: studentName,
        images: compressedImages,
        museum_name: museumName,
        description: description,
        media_type: 'gallery'
      });

      if (error) throw error;
      
      alert('✅ Gallery shared successfully!');
      
      // Clear form
      images.forEach(img => URL.revokeObjectURL(img));
      setImages([]);
      setImagePreviews([]);
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

  // Open image modal with navigation
  const openImageModal = (submission, startIndex = 0) => {
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
              {/* Show first image as cover */}
              {sub.images && sub.images.length > 0 && (
                <div className="image-gallery-preview">
                  <img 
                    src={sub.images[0]} 
                    alt={sub.museum_name} 
                    className="submission-photo"
                    onClick={() => openImageModal(sub, 0)}
                    style={{ cursor: 'pointer' }}
                    loading="lazy"
                  />
                  {sub.images.length > 1 && (
                    <div className="image-count-badge">
                      +{sub.images.length - 1} more
                    </div>
                  )}
                </div>
              )}
              <div className="submission-info">
                <h3>{sub.museum_name}</h3>
                <p className="student-name">🧑‍🎓 {sub.student_name}</p>
                <p>{sub.description}</p>
                <small>📅 {new Date(sub.created_at).toLocaleDateString()}</small>
                {sub.images && <span className="image-badge">📸 {sub.images.length} images</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery Modal */}
      {showMediaModal && showMediaModal.images && (
        <div className="image-modal-overlay" onClick={() => setShowMediaModal(null)}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowMediaModal(null)}>✕</button>
            
            {/* Navigation Arrows */}
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
            
            {/* Image Counter */}
            {showMediaModal.images.length > 1 && (
              <div className="image-counter">
                {showImageIndex + 1} / {showMediaModal.images.length}
              </div>
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

      {/* Upload Modal - Multiple Images */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (!uploading) {
            setShowForm(false);
            // Clean up previews
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            setImages([]);
            setImagePreviews([]);
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
                
                {/* Image Previews */}
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
                <button type="submit" disabled={uploading || images.length === 0}>
                  {uploading ? `Uploading ${uploadProgress}%...` : `Share ${images.length} Image${images.length !== 1 ? 's' : ''}`}
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