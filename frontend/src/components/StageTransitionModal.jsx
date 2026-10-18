import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, ArrowRight } from 'lucide-react';

export default function StageTransitionModal({ 
  isOpen, 
  onClose, 
  candidate, 
  defaultToStage, 
  onUpdateStage 
}) {
  if (!isOpen || !candidate) return null;

  const [toStage, setToStage] = useState(defaultToStage || candidate.current_stage);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changedBy, setChangedBy] = useState('Hiring Manager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultToStage) {
      setToStage(defaultToStage);
    } else {
      setToStage(candidate.current_stage);
    }
    setNotes('');
    setRejectionReason(candidate.rejection_reason || '');
  }, [defaultToStage, candidate, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateStage(candidate.id, {
        to_stage: toStage,
        notes: notes.trim(),
        rejection_reason: toStage === 'rejected' ? rejectionReason.trim() : '',
        changed_by: changedBy.trim() || 'Hiring Manager',
      });
      onClose();
    } catch (err) {
      alert('Failed to update stage: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const STAGES = [
    { id: 'applied', label: 'Applied' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'hired', label: 'Hired' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-small animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">Update Hiring Stage</h2>
            <p className="modal-subtitle">
              Move <strong>{candidate.full_name}</strong> to a new stage
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="stage-flow-indicator">
            <span className={`stage-pill stage-${candidate.current_stage}`}>
              {candidate.current_stage}
            </span>
            <ArrowRight size={16} className="text-muted" />
            <span className={`stage-pill stage-${toStage}`}>
              {toStage}
            </span>
          </div>

          <div className="form-group">
            <label>Target Stage</label>
            <select
              value={toStage}
              onChange={(e) => setToStage(e.target.value)}
              className="form-input"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {toStage === 'rejected' && (
            <div className="form-group">
              <label className="text-rose">Rejection Reason *</label>
              <textarea
                rows={2}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specific reason for rejection (e.g. Salary expectation mismatch, experience gap)..."
                className="form-input border-rose"
              />
            </div>
          )}

          <div className="form-group">
            <label>Transition Note (Saved in Audit History)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared round 2 with praise from VP of Eng"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Decision Maker / Changed By</label>
            <input
              type="text"
              value={changedBy}
              onChange={(e) => setChangedBy(e.target.value)}
              className="form-input"
              placeholder="e.g. Hiring Manager"
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-secondary-custom">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-custom">
              {isSubmitting ? 'Updating...' : 'Confirm Stage Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
