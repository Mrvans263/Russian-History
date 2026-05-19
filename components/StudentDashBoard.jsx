// src/components/StudentDashBoard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './StudentDashBoard.css';

const StudentDashBoard = ({ canUpload = false }) => {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
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
      
      const { error } = await supabase.from('submissions').insert({
        student_name: studentName,
        photo_url: compressedPhoto,
        museum_name: museumName,
        description: description
      });

      if (error) {
        setUploading(false);
        alert('Error: ' + error.message);
      } else {
        alert('✅ Museum visit shared!');
        // Clear form
        setPhoto(null);
        setPhotoPreview(null);
        setMuseumName('');
        setDescription('');
        setShowForm(false);
        setUploading(false);
        // Reload data without page refresh
        await loadAllSubmissions();
      }
    } catch (err) {
      setUploading(false);
      alert('Error submitting. Please try again.');
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

      {/* Upload Button - Only for students */}
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

      {/* Upload Modal - Prevent accidental close while uploading */}
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
                <label>Upload Photo *</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} required disabled={uploading} />
                {photoPreview && <img src={photoPreview} alt="Preview" className="photo-preview" />}
              </div>
              
              <div className="form-group">
                <label>Museum Name *</label>
                <input type="text" value={museumName} onChange={(e) => setMuseumName(e.target.value)} required disabled={uploading} />
              </div>
              
              <div className="form-group">
                <label>What did you see?</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" disabled={uploading} />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => !uploading && setShowForm(false)} disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Submitting...' : 'Share'}
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