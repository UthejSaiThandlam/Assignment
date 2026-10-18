import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

export default function CandidateFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null, 
  jobs = [] 
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job: '',
    applied_role: '',
    resume_url: '',
    current_stage: 'applied',
    rating: 3,
    notes_summary: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        job: initialData.job || '',
        applied_role: initialData.applied_role || '',
        resume_url: initialData.resume_url || '',
        current_stage: initialData.current_stage || 'applied',
        ats_score: initialData.ats_score ?? 85,
        rating: initialData.rating || 3,
        notes_summary: initialData.notes_summary || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job: jobs.length > 0 ? jobs[0].id : '',
        applied_role: jobs.length > 0 ? jobs[0].title : '',
        resume_url: '',
        current_stage: 'applied',
        ats_score: 85,
        rating: 3,
        notes_summary: '',
      });
    }
    setErrorMsg('');
  }, [initialData, jobs, isOpen]);

  const handleJobSelect = (jobId) => {
    const selectedJob = jobs.find((j) => String(j.id) === String(jobId));
    setFormData((prev) => ({
      ...prev,
      job: jobId,
      applied_role: selectedJob ? selectedJob.title : prev.applied_role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMsg('First and Last name are required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.applied_role.trim()) {
      setErrorMsg('Applied role is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || '+1 555-0199',
        applied_role: formData.applied_role.trim(),
        job: formData.job ? Number(formData.job) : null,
        resume_url: formData.resume_url?.trim()
          ? (formData.resume_url.trim().startsWith('http') ? formData.resume_url.trim() : `https://${formData.resume_url.trim()}`)
          : 'https://talentflow.io/resumes/applicant.pdf',
      };
      await onSave(payload, initialData?.id);
      onClose();
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.email) {
          setErrorMsg('A candidate with this email address already exists. Please use a unique email.');
        } else {
          const firstKey = Object.keys(parsed)[0];
          setErrorMsg(`${firstKey}: ${parsed[firstKey]}`);
        }
      } catch {
        setErrorMsg(err.message || 'Failed to save candidate. Please check all fields.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-medium animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">
              {initialData ? 'Edit Candidate Details' : 'Add New Candidate'}
            </h2>
            <div className="flex-align-gap mt-1">
              <p className="modal-subtitle">
                Enter candidate contact information, resume URL, and applied role
              </p>
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
          <div className="form-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Liam"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Vance"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="candidate@example.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Select Associated Job Opening</label>
              <select
                value={formData.job}
                onChange={(e) => handleJobSelect(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose or Enter Custom Role Below --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Applied Role Title *</label>
              <input
                type="text"
                required
                value={formData.applied_role}
                onChange={(e) => setFormData({ ...formData, applied_role: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Resume URL (Cloud link / Portfolio / Google Drive)</label>
            <input
              type="url"
              value={formData.resume_url}
              onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
              placeholder="https://drive.google.com/resume.pdf"
              className="form-input"
            />
          </div>

          <div className="form-grid-2">
            {!initialData && (
              <div className="form-group">
                <label>Initial Hiring Stage</label>
                <select
                  value={formData.current_stage}
                  onChange={(e) => setFormData({ ...formData, current_stage: e.target.value })}
                  className="form-input"
                >
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Rating (1 to 5 Stars)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="form-input"
              >
                <option value={1}>1 - Weak Candidate</option>
                <option value={2}>2 - Marginal</option>
                <option value={3}>3 - Good Average</option>
                <option value={4}>4 - Strong Prospect</option>
                <option value={5}>5 - Outstanding Star</option>
              </select>
            </div>
            <div className="form-group">
              <label>ATS Profile Match Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.ats_score}
                onChange={(e) => setFormData({ ...formData, ats_score: Number(e.target.value) })}
                className="form-input"
                placeholder="e.g. 92"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Summary Notes / Background</label>
            <textarea
              rows={3}
              value={formData.notes_summary}
              onChange={(e) => setFormData({ ...formData, notes_summary: e.target.value })}
              placeholder="Candidate background, key achievements, or referral details..."
              className="form-input"
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-secondary-custom">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-custom">
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
