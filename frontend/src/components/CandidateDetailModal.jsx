import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Star, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Send,
  UserCheck
} from 'lucide-react';

export default function CandidateDetailModal({ 
  candidate, 
  onClose, 
  onUpdateStage, 
  onAddNote 
}) {
  if (!candidate) return null;

  const [targetStage, setTargetStage] = useState(candidate.current_stage || 'applied');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState(candidate.rejection_reason || '');
  const [actorName, setActorName] = useState('Hiring Manager');
  const [isSubmittingStage, setIsSubmittingStage] = useState(false);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Technical Interviewer');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const handleStageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingStage(true);
    try {
      await onUpdateStage(candidate.id, {
        to_stage: targetStage,
        notes: transitionNotes,
        rejection_reason: targetStage === 'rejected' ? rejectionReason : '',
        changed_by: actorName,
      });
      setTransitionNotes('');
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    } finally {
      setIsSubmittingStage(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      await onAddNote(candidate.id, {
        author: noteAuthor,
        content: newNoteContent.trim(),
      });
      setNewNoteContent('');
    } catch (err) {
      alert('Error adding note: ' + err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const stageOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected (Archive)' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-large animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-avatar-large">
              {candidate.first_name ? candidate.first_name.charAt(0) : 'C'}
            </div>
            <div>
              <div className="modal-title-row">
                <h2 className="modal-title">{candidate.full_name}</h2>
                <span className={`stage-pill stage-${candidate.current_stage}`}>
                  {candidate.current_stage?.toUpperCase()}
                </span>
                <span className={`ats-score-badge ${candidate.ats_score >= 90 ? 'score-high' : candidate.ats_score >= 75 ? 'score-med' : 'score-low'}`}>
                  ATS {candidate.ats_score || 85}% Match
                </span>
              </div>
              <p className="modal-subtitle">{candidate.applied_role}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scrollable">
          {/* Quick info strip */}
          <div className="candidate-info-strip">
            <div className="info-chip">
              <Mail size={15} className="text-indigo" />
              <span>{candidate.email}</span>
            </div>
            <div className="info-chip">
              <Phone size={15} className="text-cyan" />
              <span>{candidate.phone || 'No phone'}</span>
            </div>
            <div className="info-chip">
              <Calendar size={15} className="text-amber" />
              <span>Applied {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : '-'}</span>
            </div>
            <div className="info-chip" title="Last modified application date">
              <Clock size={15} className="text-cyan" />
              <span>Last Updated: {candidate.updated_at ? new Date(candidate.updated_at).toLocaleDateString() : 'Recent'}</span>
            </div>
            <div className="info-chip" title="UTM Acquisition Attribution">
              <span className="dot-source-indicator"></span>
              <span>Source: LinkedIn / Organic ATS</span>
            </div>
            {candidate.resume_url ? (
              <a 
                href={candidate.resume_url} 
                target="_blank" 
                rel="noreferrer" 
                className="info-chip resume-chip"
              >
                <ExternalLink size={15} />
                <span>View Candidate Resume</span>
              </a>
            ) : (
              <span className="info-chip text-muted">No Resume Link</span>
            )}
          </div>

          {candidate.notes_summary && (
            <div className="summary-box">
              <strong className="summary-title">Summary & Background:</strong>
              <p>{candidate.notes_summary}</p>
            </div>
          )}

          {/* Interactive Stage Transition Panel */}
          <div className="stage-transition-panel">
            <div className="panel-title-wrap">
              <UserCheck size={18} className="text-indigo" />
              <h3 className="panel-heading">Transition Pipeline Stage</h3>
            </div>

            <form onSubmit={handleStageSubmit} className="stage-form">
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Move to Stage</label>
                  <select 
                    value={targetStage} 
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="form-input"
                  >
                    {stageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Actor / Decision Maker</label>
                  <input
                    type="text"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Lead Recruiter"
                  />
                </div>

                <div className="form-group">
                  <label>Stage Transition Note</label>
                  <input
                    type="text"
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    className="form-input"
                    placeholder="Feedback, score, or round details..."
                  />
                </div>
              </div>

              {targetStage === 'rejected' && (
                <div className="form-group mt-2">
                  <label className="text-rose">Rejection Reason (Internal Record)</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Candidate lacked required system design depth for senior tier."
                    className="form-input border-rose"
                    required
                  />
                </div>
              )}

              <div className="stage-form-actions">
                <button 
                  type="submit" 
                  disabled={isSubmittingStage}
                  className="btn-primary-custom"
                >
                  {isSubmittingStage ? 'Recording Transition...' : 'Update & Record Stage History'}
                </button>
              </div>
            </form>
          </div>

          {/* Two Columns: Stage History Audit Trail & Internal Notes */}
          <div className="detail-split-grid">
            {/* Stage History Audit Trail */}
            <div className="history-column">
              <div className="sub-heading-wrap">
                <Clock size={16} className="text-indigo" />
                <h4 className="sub-heading">Stage History & Audit Log</h4>
              </div>

              <div className="timeline-container">
                {candidate.stage_history && candidate.stage_history.length > 0 ? (
                  candidate.stage_history.map((hist, idx) => (
                    <div key={hist.id || idx} className="timeline-node">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-transition">
                            {hist.from_stage ? (
                              <>
                                <span className="stage-pill pill-xs">{hist.from_stage}</span>
                                <ArrowRight size={11} className="text-muted" />
                              </>
                            ) : null}
                            <span className={`stage-pill pill-xs stage-${hist.to_stage}`}>
                              {hist.to_stage}
                            </span>
                          </span>
                          <span className="timeline-date">
                            {hist.created_at ? new Date(hist.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                        {hist.notes && <p className="timeline-notes">"{hist.notes}"</p>}
                        <span className="timeline-author">Logged by {hist.changed_by}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-subtext">No historical stage records found.</div>
                )}
              </div>
            </div>

            {/* Candidate Internal Notes */}
            <div className="notes-column">
              <div className="sub-heading-wrap">
                <MessageSquare size={16} className="text-cyan" />
                <h4 className="sub-heading">Interviewer Notes & Feedback</h4>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleNoteSubmit} className="add-note-box">
                <div className="form-group">
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Your Name / Role (e.g. Lead Engineer)"
                    className="form-input input-sm"
                  />
                </div>
                <div className="form-group mt-1">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add interview observation, assessment notes..."
                    className="form-input input-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteContent.trim()}
                  className="btn-secondary-custom btn-sm mt-1"
                >
                  <Send size={13} />
                  <span>Add Note</span>
                </button>
              </form>

              {/* Notes List */}
              <div className="notes-feed">
                {candidate.timeline_notes && candidate.timeline_notes.length > 0 ? (
                  candidate.timeline_notes.map((note) => (
                    <div key={note.id} className="note-card">
                      <div className="note-header">
                        <span className="note-author">{note.author}</span>
                        <span className="note-date">
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="note-text">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-subtext">No interviewer notes added yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
