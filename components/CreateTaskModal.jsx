// src/components/CreateTaskModal.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './CreateTaskModal.css';

const CreateTaskModal = ({ classId, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('museum');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('tasks')
      .insert({
        class_id: classId,
        title: title.trim(),
        description: description.trim() || null,
        type: type,
        due_date: dueDate || null,
        points: points,
      });

    if (insertError) {
      console.error('Error creating task:', insertError);
      setError('Failed to create task. Please try again.');
    } else {
      onTaskCreated();
      onClose();
    }
    
    setLoading(false);
  };

  const taskTypes = [
    { value: 'museum', label: '🏛️ Museum Visit', description: 'Students upload photo from museum' },
    { value: 'quiz', label: '📝 Quiz', description: 'Students take a quiz on lecture material' },
    { value: 'essay', label: '✍️ Essay', description: 'Students write a short essay response' },
    { value: 'reading', label: '📖 Reading', description: 'Students read and mark as complete' },
    { value: 'other', label: '📌 Other', description: 'Custom task type' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-task-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>
        
        <h2>✨ Create New Task</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Visit the State Historical Museum"
              required
            />
          </div>

          <div className="form-group">
            <label>Task Type</label>
            <div className="task-types-grid">
              {taskTypes.map(taskType => (
                <div 
                  key={taskType.value}
                  className={`task-type-option ${type === taskType.value ? 'selected' : ''}`}
                  onClick={() => setType(taskType.value)}
                >
                  <div className="task-type-label">{taskType.label}</div>
                  <div className="task-type-desc">{taskType.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide instructions or additional details for students..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date (optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                min="0"
                max="1000"
                step="10"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;