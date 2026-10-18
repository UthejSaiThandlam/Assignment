import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onSwitchToApply }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter your recruiter username.');
      return;
    }
    setIsLoading(true);
    try {
      await onLoginSuccess(username.trim(), password);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid recruiter credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername) => {
    setUsername(demoUsername);
    setPassword('password123');
    setErrorMsg('');
    setIsLoading(true);
    try {
      await onLoginSuccess(demoUsername, 'password123');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-layout">
        {/* Left Side: Candidate Opportunities & Application Portal */}
        <div className="login-showcase-panel">
          <div className="showcase-brand">
            <div className="brand-icon-box">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="brand-name">TalentFlow <span>CAREERS</span></div>
              <div className="brand-tagline">Candidate Application & Hiring Portal</div>
            </div>
          </div>

          <div className="showcase-body">
            <div className="candidate-portal-badge">
              <span className="pulse-dot" />
              <span>We Are Actively Hiring • 5 Active Requisitions</span>
            </div>

            <h1 className="showcase-heading">
              Looking to join our engineering and product team?
            </h1>
            <p className="showcase-description">
              Apply directly to our hiring team. Applications enter our transparent 6-stage review pipeline with automated scoring and 48-hour response SLA.
            </p>

            {/* Direct Open Job Cards List */}
            <div className="login-open-roles-list">
              <div className="login-role-pill" onClick={onSwitchToApply}>
                <div className="role-pill-info">
                  <strong>Senior Full Stack Engineer</strong>
                  <span>Engineering • Remote</span>
                </div>
                <ArrowRight size={14} className="text-purple" />
              </div>

              <div className="login-role-pill" onClick={onSwitchToApply}>
                <div className="role-pill-info">
                  <strong>Staff UI/UX Designer</strong>
                  <span>Design & Product • Remote</span>
                </div>
                <ArrowRight size={14} className="text-purple" />
              </div>

              <div className="login-role-pill" onClick={onSwitchToApply}>
                <div className="role-pill-info">
                  <strong>Data & Machine Learning Engineer</strong>
                  <span>AI Lab • Hybrid / Global</span>
                </div>
                <ArrowRight size={14} className="text-purple" />
              </div>
            </div>

            <button 
              type="button" 
              onClick={onSwitchToApply} 
              className="btn-apply-portal-direct"
              title="Open the complete candidate application page"
            >
              <Briefcase size={16} />
              <span>Browse All Positions & Apply Now</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="showcase-footer">
            <div className="badge-secure">
              <ShieldCheck size={16} />
              <span>Direct ATS Pipeline Ingestion • 100% Confidential</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="login-form-panel">
          {/* Top Switcher Tabs: Recruiter vs Candidate Apply */}
          <div className="auth-portal-switch">
            <button type="button" className="portal-switch-pill active">
              <ShieldCheck size={14} />
              <span>Recruiter Sign In</span>
            </button>
            <button 
              type="button" 
              className="portal-switch-pill" 
              onClick={onSwitchToApply}
              title="Switch to Candidate Application Page"
            >
              <Briefcase size={14} />
              <span>Apply for Jobs →</span>
            </button>
          </div>

          <div className="form-panel-header">
            <h2>Recruiter Sign In</h2>
            <p>Enter your credentials to access the talent pipeline workspace</p>
          </div>

          {errorMsg && (
            <div className="login-error-alert animate-fade-in">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="login-main-form">
            <div className="form-group">
              <label htmlFor="username">Recruiter Username / Email</label>
              <div className="input-field-wrap">
                <User size={18} className="field-prefix-icon" />
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="admin or recruiter"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-field-wrap">
                <Lock size={18} className="field-prefix-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-auth-submit"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="demo-credentials-section">
            <div className="demo-section-divider">
              <span>Or 1-Click Demo Login</span>
            </div>

            <div className="demo-buttons-grid">
              <button 
                type="button" 
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="demo-card-btn"
              >
                <div className="demo-btn-title">
                  <span className="demo-role-badge badge-lead">Admin</span>
                  <strong>Lead Recruiter</strong>
                </div>
                <span className="demo-btn-subtitle">Talent Acquisition Lead</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleDemoLogin('recruiter')}
                disabled={isLoading}
                className="demo-card-btn"
              >
                <div className="demo-btn-title">
                  <span className="demo-role-badge badge-recruiter">Staff</span>
                  <strong>Recruiter</strong>
                </div>
                <span className="demo-btn-subtitle">Technical Sourcing Partner</span>
              </button>
            </div>
          </div>

          {/* Dedicated Applicant CTA Banner */}
          <div className="applicant-portal-prompt">
            <button 
              type="button"
              className="applicant-prompt-btn"
              onClick={onSwitchToApply}
            >
              <div className="prompt-left">
                <Briefcase size={17} className="text-purple" />
                <div className="prompt-copy">
                  <span className="prompt-title">Are you an applicant looking for a job?</span>
                  <span className="prompt-desc">Browse open roles and submit your application directly</span>
                </div>
              </div>
              <ArrowRight size={15} className="prompt-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
