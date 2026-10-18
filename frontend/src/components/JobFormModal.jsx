import React, { useState } from 'react';
import { X, Briefcase, PlusCircle, AlertCircle } from 'lucide-react';

export default function JobFormModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    job_type: 'Full-time',
    status: 'open',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.title.trim()) {
      setErrorMsg('Job title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error creating job opening');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-small animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">Create Job Opening</h2>
            <div className="flex-align-gap mt-1">
              <p className="modal-subtitle">Add a requisition to organize candidate pipelines</p>
              <span className="form-sla-badge">
                <span className="form-sla-pulse" />
                99.8% Form Delivery SLA
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="form-error-banner mb-3">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lead Cloud Architect"
              className="form-input"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering, Sales, Design..."
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Remote, New York, NY..."
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Job Type</label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="form-input"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Requisition Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="open">Open</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Role Overview</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key responsibilities and qualifications..."
              className="form-input"
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-secondary-custom">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-custom">
              {isSubmitting ? 'Creating...' : 'Create Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
