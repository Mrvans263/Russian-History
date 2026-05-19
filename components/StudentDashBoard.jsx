// src/components/StudentDashBoard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './StudentDashboard.css';

const StudentDashBoard = () => {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [museumName, setMuseumName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let name = localStorage.getItem('student_name');
    if (!name) {
      name = prompt('Enter your name:', 'Student') || 'Student';
      localStorage.setItem('student_name', name);
    }
    setStudentName(name);
    loadAllSubmissions();
  }, []);

  const loadAllSubmissions = async (retryCount = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllSubmissions(data || []);
    } catch (err) {
      console.error('Load error:', err);
      if (retryCount < 3) {
        console.log(`Retrying load... (${retryCount + 1}/3)`);
        setTimeout(() => loadAllSubmissions(retryCount + 1), 1000);
      }
    }
    setLoading(false);
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

  const submitWithRetry = async (data, retryCount = 0) => {
    try {
      const { error } = await supabase.from('submissions').insert(data);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      if (retryCount < 3) {
        console.log(`Retrying submit... (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return submitWithRetry(data, retryCount + 1);
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      alert('Please select a photo');
      return;
    }
    
    if (!museumName) {
      alert('Please enter the museum name');
      return;
    }

    setUploading(true);

    try {
      const compressedPhoto = await compressImage(photo);
      
      const result = await submitWithRetry({
        student_name: studentName,
        photo_url: compressedPhoto,
        museum_name: museumName,
        description: description
      });

      setUploading(false);
      
      if (result.success) {
        alert('✅ Museum visit shared!');
        setShowForm(false);
        setPhoto(null);
        setPhotoPreview(null);
        setMuseumName('');
        setDescription('');
        loadAllSubmissions();
      }
    } catch (err) {
      setUploading(false);
      alert('Error submitting. Please try again.');
      console.error('Submit error:', err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <div className="loading-spinner">Loading gallery...</div>;

  return (
    <div className="dashboard-container">
      <div className="class-header">
        <h1>🏛️ Museum Visit Gallery</h1>
        <p>Welcome, {studentName}!</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button onClick={() => setShowForm(true)} className="share-btn">
          + Share Your Museum Visit
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>📸 Share Your Museum Visit</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Upload Photo *</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} required />
                {photoPreview && <img src={photoPreview} alt="Preview" className="photo-preview" />}
              </div>
              
              <div className="form-group">
                <label>Museum Name *</label>
                <input type="text" value={museumName} onChange={(e) => setMuseumName(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>What did you see?</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" disabled={uploading}>{uploading ? 'Sharing...' : 'Share'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2>📷 Class Museum Visits ({allSubmissions.length})</h2>
      
      {allSubmissions.length === 0 ? (
        <div className="no-tasks">
          <p>No museum visits shared yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {allSubmissions.map(sub => (
            <div key={sub.id} className="submission-card">
              {sub.photo_url && <img src={sub.photo_url} alt={sub.museum_name} className="submission-photo" />}
              <div className="submission-info">
                <h3>{sub.museum_name}</h3>
                <p className="student-name">🧑‍🎓 {sub.student_name}</p>
                <p>{sub.description}</p>
                <small>📅 {new Date(sub.created_at).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashBoard;