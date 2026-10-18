import React, { useState } from 'react';
import { X, Lock, User, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onLoginSuccess(username, password);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoUser) => {
    setUsername(demoUser);
    setPassword('password123');
    onLoginSuccess(demoUser, 'password123').then(() => onClose()).catch(() => {});
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-small animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="login-modal-logo">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="modal-title">Recruiter Portal Login</h2>
              <p className="modal-subtitle">Access hiring pipeline, manage candidates & jobs</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="form-error-banner">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Username / Email</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or recruiter"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="form-input"
              />
            </div>
          </div>

          <div className="quick-demo-pills">
            <span className="demo-label">Instant Demo Login:</span>
            <button 
              type="button" 
              className="demo-pill-btn" 
              onClick={() => handleQuickDemo('admin')}
            >
              <Sparkles size={12} />
              <span>Lead Recruiter (Admin)</span>
            </button>
            <button 
              type="button" 
              className="demo-pill-btn" 
              onClick={() => handleQuickDemo('recruiter')}
            >
              <span>Technical Recruiter</span>
            </button>
          </div>

          <div className="modal-actions-footer">
            <button type="button" onClick={onClose} className="btn-secondary-custom">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-custom">
              <LogIn size={16} />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
