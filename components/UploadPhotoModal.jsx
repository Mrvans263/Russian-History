// src/components/UploadPhotoModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './UploadPhotoModal.css';

const UploadPhotoModal = ({ task, onClose, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [museumName, setMuseumName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const uploadPhoto = async () => {
    if (!photo) {
      setError('Please select a photo');
      return null;
    }

    const fileExt = photo.name.split('.').pop();
    const fileName = `${user.id}/${task.id}/${Date.now()}.${fileExt}`;
    const filePath = `museum-submissions/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('submissions')
      .upload(filePath, photo);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setError('Failed to upload photo. Please try again.');
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      setError('Please select a photo');
      return;
    }

    if (!museumName.trim()) {
      setError('Please enter the museum name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload photo to Supabase Storage
      const photoUrl = await uploadPhoto();
      
      if (!photoUrl) {
        setLoading(false);
        return;
      }

      // Check if submission already exists
      const { data: existingSubmission } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('task_id', task.id)
        .eq('student_id', user.id)
        .single();

      let submissionError;
      
      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('task_submissions')
          .update({
            content: `Museum: ${museumName}\nCaption: ${caption}`,
            photo_url: photoUrl,
            status: 'pending',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id);
        
        submissionError = error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from('task_submissions')
          .insert({
            task_id: task.id,
            student_id: user.id,
            content: `Museum: ${museumName}\nCaption: ${caption}`,
            photo_url: photoUrl,
            status: 'pending',
          });
        
        submissionError = error;
      }

      if (submissionError) {
        throw submissionError;
      }

      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>
        
        <h2>📸 Upload Museum Visit</h2>
        <p className="task-title">Task: {task?.title}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Museum Name *</label>
            <input
              type="text"
              value={museumName}
              onChange={(e) => setMuseumName(e.target.value)}
              placeholder="e.g., State Historical Museum, Kremlin Armoury, etc."
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Photo *</label>
            <div className="photo-upload-area" onClick={() => document.getElementById('photo-input').click()}>
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button 
                    type="button" 
                    className="remove-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>Click to select a photo</p>
                  <small>JPG, PNG up to 5MB</small>
                </div>
              )}
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Your Experience (optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What did you see? What did you learn? Share your experience..."
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Museum Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoModal;