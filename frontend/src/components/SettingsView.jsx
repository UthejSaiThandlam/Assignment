import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Key, 
  Sliders, 
  Check, 
  Save, 
  ExternalLink,
  HelpCircle,
  Zap,
  Activity
} from 'lucide-react';
import FaqSection from './FaqSection';

export default function SettingsView({ currentUser, onSaveSettings }) {
  const [activeSubTab, setActiveSubTab] = useState('account');
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Lead Recruiter',
    email: currentUser?.email || 'recruiter@talentflow.io',
    role: currentUser?.role || 'Lead Recruiter',
    department: 'People Operations',
    timezone: 'UTC+05:30 (IST)',
    emailNotifications: true,
    candidateAlerts: true,
    autoScore: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    if (onSaveSettings) onSaveSettings(profileForm);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="settings-header">
        <div>
          <h1 className="page-title">Recruiter Account & ATS Configuration</h1>
          <p className="page-subtitle">
            Manage recruiter profiles, pipeline stage parameters, API throttles, and documentation.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sub-nav */}
        <div className="settings-nav card-box">
          <button 
            className={`settings-tab-btn ${activeSubTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('account')}
          >
            <User size={16} />
            <span>Recruiter Profile</span>
          </button>
          <button 
            className={`settings-tab-btn ${activeSubTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('pipeline')}
          >
            <Sliders size={16} />
            <span>Hiring Stages</span>
          </button>
          <button 
            className={`settings-tab-btn ${activeSubTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('faq')}
          >
            <HelpCircle size={16} />
            <span>ATS FAQ & Guide</span>
          </button>
          <button 
            className={`settings-tab-btn ${activeSubTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('notifications')}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </button>
          <button 
            className={`settings-tab-btn ${activeSubTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('system')}
          >
            <Database size={16} />
            <span>Database & Rate Limits</span>
          </button>
        </div>

        {/* Content area */}
        <div className="settings-content-card card-box">
          {activeSubTab === 'account' && (
            <form onSubmit={handleSubmit} className="settings-form">
              <h2 className="section-title">Recruiter Information</h2>
              <p className="text-secondary text-sm mb-4">
                Update your operational credentials and ATS role title.
              </p>

              {savedSuccess && (
                <div className="alert-success-banner mb-4">
                  <Check size={16} />
                  <span>Profile settings updated successfully!</span>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Title / Role Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Recruiter Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-actions-bar">
                <button type="submit" className="btn-primary-purple">
                  <Save size={16} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'pipeline' && (
            <div className="settings-pipeline-info">
              <h2 className="section-title">Hiring Pipeline Workflow</h2>
              <p className="text-secondary text-sm mb-4">
                Configured pipeline stages enforced by Django REST Framework validation.
              </p>

              <div className="pipeline-stages-list">
                {[
                  { name: 'Applied', color: '#38BDF8', desc: 'Initial candidate submission and resume parsing' },
                  { name: 'Screening', color: '#818CF8', desc: 'Recruiter phone screen & basic requirements evaluation' },
                  { name: 'Interview', color: '#FBBF24', desc: 'Technical assessments & hiring team interviews' },
                  { name: 'Offer', color: '#6C63FF', desc: 'Formal compensation package extended' },
                  { name: 'Hired', color: '#34D399', desc: 'Successful placement and onboarding' },
                  { name: 'Rejected', color: '#FB7185', desc: 'Candidate not selected; reason recorded for auditing' },
                ].map((s, idx) => (
                  <div key={idx} className="stage-config-row">
                    <span className="stage-dot" style={{ backgroundColor: s.color }} />
                    <div className="stage-meta">
                      <strong className="stage-name">{s.name}</strong>
                      <span className="stage-desc">{s.desc}</span>
                    </div>
                    <span className="stage-status-badge">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'faq' && (
            <FaqSection />
          )}

          {activeSubTab === 'notifications' && (
            <div className="settings-notifications-info">
              <h2 className="section-title">Notification Channels</h2>
              <p className="text-secondary text-sm mb-4">
                Configure candidate interview alerts and stage transition notifications.
              </p>

              <div className="toggle-option-row">
                <div>
                  <strong>Interview Reminders</strong>
                  <p className="text-secondary text-xs">Notify 24 hours prior to scheduled interviews</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={profileForm.candidateAlerts} 
                  onChange={(e) => setProfileForm({ ...profileForm, candidateAlerts: e.target.checked })} 
                />
              </div>

              <div className="toggle-option-row">
                <div>
                  <strong>New Applicant Email Alerts</strong>
                  <p className="text-secondary text-xs">Instant notification when a candidate applies</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={profileForm.emailNotifications} 
                  onChange={(e) => setProfileForm({ ...profileForm, emailNotifications: e.target.checked })} 
                />
              </div>
            </div>
          )}

          {activeSubTab === 'system' && (
            <div className="settings-system-info">
              <h2 className="section-title">System Health & API Rate Limiting</h2>
              <p className="text-secondary text-sm mb-4">
                Live backend health, database connections, and enforced REST API throttles.
              </p>

              <div className="system-status-grid">
                <div className="status-item">
                  <span className="status-label">Backend Engine</span>
                  <span className="status-val text-green">Django REST Framework (Active)</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Database</span>
                  <span className="status-val text-cyan">SQLite 3 (Normalized Schema)</span>
                </div>
                <div className="status-item">
                  <span className="status-label">API Root</span>
                  <span className="status-val text-purple">http://127.0.0.1:8000/api/</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Frontend Framework</span>
                  <span className="status-val text-blue">React 19 + Vite HMR</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Login Rate Limit</span>
                  <span className="status-val text-amber">15 requests / minute</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Recruiter API Rate Limit</span>
                  <span className="status-val text-green">120 requests / minute</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
