import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck,
  Headphones
} from 'lucide-react';

export default function FloatingContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!message.trim() || message.length < 5) {
      setErrorMsg('Please write a message of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsOpen(false);
        setSubject('');
        setEmail('');
        setMessage('');
      }, 2500);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        className="floating-contact-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Contact Recruiter Support & Help Desk"
      >
        <MessageSquare size={18} />
        <span className="floating-tooltip">Help & Support</span>
      </button>

      {/* Floating Support Modal */}
      {isOpen && (
        <div className="floating-contact-card card-box animate-fade-in">
          <div className="contact-card-header">
            <div className="header-icon-title">
              <Headphones size={18} className="text-purple" />
              <div>
                <strong>Recruiter Help Desk</strong>
                <span className="contact-sla-badge">Form Delivery: 99.8% Success Rate</span>
              </div>
            </div>
            <button className="contact-close-btn" onClick={() => setIsOpen(false)}>
              <X size={15} />
            </button>
          </div>

          {submitSuccess ? (
            <div className="contact-success-state animate-fade-in">
              <CheckCircle2 size={36} className="text-emerald mb-2" />
              <strong>Ticket Submitted Successfully!</strong>
              <p>Our talent platform engineering team will respond within 1 business hour.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {errorMsg && (
                <div className="form-error-banner mb-3 animate-fade-in">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group mb-2">
                <label className="text-xs">Your Recruiter Email</label>
                <input
                  type="email"
                  required
                  placeholder="recruiter@company.com"
                  className={`form-control form-control-sm ${errorMsg && !email ? 'is-invalid' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group mb-2">
                <label className="text-xs">Subject</label>
                <input
                  type="text"
                  placeholder="Feature request, bug, or pipeline question"
                  className="form-control form-control-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group mb-3">
                <label className="text-xs">Message</label>
                <textarea
                  rows="3"
                  required
                  placeholder="How can we assist your hiring team today?"
                  className={`form-control form-control-sm ${errorMsg && !message ? 'is-invalid' : ''}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="contact-form-actions">
                <div className="contact-security-tip">
                  <ShieldCheck size={13} className="text-muted" />
                  <span>Encrypted REST API</span>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary-purple btn-sm">
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
