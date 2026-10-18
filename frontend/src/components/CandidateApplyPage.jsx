import React, { useState } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  UploadCloud, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink, 
  Sun, 
  Moon, 
  LogIn, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Award
} from 'lucide-react';
import { createCandidate } from '../api';

export default function CandidateApplyPage({ 
  onSwitchToLogin, 
  theme = 'dark', 
  onToggleTheme, 
  jobs = [], 
  onApplicationSubmitted,
  isRecruiterPreview = false
}) {
  // Default jobs if none provided
  const availableJobs = jobs.length > 0 ? jobs : [
    { id: 1, title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Remote / US', job_type: 'Full-time' },
    { id: 2, title: 'Product Strategy Lead', department: 'Product', location: 'New York, NY', job_type: 'Full-time' },
    { id: 3, title: 'Staff UI/UX Designer', department: 'Design', location: 'Remote / Global', job_type: 'Full-time' },
    { id: 4, title: 'DevOps & Cloud Architect', department: 'Infrastructure', location: 'San Francisco, CA', job_type: 'Full-time' },
    { id: 5, title: 'Data Scientist & ML Engineer', department: 'AI Lab', location: 'Remote / EU', job_type: 'Full-time' }
  ];

  const [selectedJob, setSelectedJob] = useState(availableJobs[0] || null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    applied_role: availableJobs[0]?.title || 'Software Engineer',
    resume_url: '',
    portfolio_url: '',
    experience_level: '3-5 years',
    skills: '',
    notes_summary: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setFormData(prev => ({
      ...prev,
      applied_role: job.title
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Field validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMsg('Please enter both your first and last name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Please enter a contact phone number.');
      return;
    }
    if (!formData.applied_role.trim()) {
      setErrorMsg('Please select or specify the role you are applying for.');
      return;
    }

    let cleanResumeUrl = formData.resume_url.trim();
    if (cleanResumeUrl && !cleanResumeUrl.startsWith('http://') && !cleanResumeUrl.startsWith('https://')) {
      cleanResumeUrl = `https://${cleanResumeUrl}`;
    }
    if (!cleanResumeUrl) {
      cleanResumeUrl = 'https://talentflow.io/resumes/applicant-profile.pdf';
    }

    setIsSubmitting(true);

    try {
      const summaryText = [
        `Experience: ${formData.experience_level}`,
        formData.skills ? `Skills: ${formData.skills}` : null,
        formData.portfolio_url ? `Portfolio: ${formData.portfolio_url}` : null,
        formData.notes_summary ? `Note: ${formData.notes_summary}` : null
      ].filter(Boolean).join(' | ');

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        job: selectedJob?.id ? Number(selectedJob.id) : null,
        applied_role: formData.applied_role.trim(),
        resume_url: cleanResumeUrl,
        current_stage: 'applied',
        ats_score: Math.floor(Math.random() * 15) + 82, // realistic initial ATS score 82-96
        rating: 4,
        notes_summary: summaryText,
      };

      const result = await createCandidate(payload);

      setSubmissionSuccess({
        id: result.id,
        name: `${formData.first_name} ${formData.last_name}`,
        role: formData.applied_role,
        email: formData.email,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.email) {
          setErrorMsg('An application with this email address already exists. Our team will review your existing profile.');
        } else {
          const firstKey = Object.keys(parsed)[0];
          setErrorMsg(`${firstKey}: ${parsed[firstKey]}`);
        }
      } catch {
        setErrorMsg(err.message || 'Failed to submit application. Please verify your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionSuccess(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      applied_role: selectedJob?.title || 'Software Engineer',
      resume_url: '',
      portfolio_url: '',
      experience_level: '3-5 years',
      skills: '',
      notes_summary: '',
    });
    setErrorMsg('');
  };

  return (
    <div className={`candidate-apply-page theme-${theme}`} data-theme={theme}>
      {/* Top Careers Navigation Bar */}
      <header className="apply-navbar">
        <div className="apply-nav-container">
          <div className="apply-brand">
            <div className="brand-logo-icon">
              <Sparkles size={20} className="text-purple" />
            </div>
            <div className="apply-brand-text">
              <span className="apply-brand-title">TalentFlow</span>
              <span className="apply-brand-badge">CAREERS & TALENT</span>
            </div>
          </div>

          <div className="apply-nav-actions">
            {onToggleTheme && (
              <button 
                onClick={onToggleTheme} 
                className="topbar-icon-btn" 
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={17} className="text-amber" /> : <Moon size={17} />}
              </button>
            )}

            <button 
              onClick={onSwitchToLogin} 
              className="btn-switch-login"
              title="Access recruiter management portal"
            >
              <LogIn size={15} />
              <span>{isRecruiterPreview ? 'Back to ATS Workspace' : 'Recruiter Sign In'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="apply-hero-section">
        <div className="apply-hero-content">
          <div className="apply-hero-pill">
            <span className="pulse-dot"></span>
            <span>We are actively hiring across all departments</span>
          </div>
          <h1 className="apply-hero-title">
            Shape the future of innovation with us
          </h1>
          <p className="apply-hero-subtitle">
            Explore open opportunities, submit your candidate application, and join our world-class team. 
            All applications enter our direct review pipeline within 24 hours.
          </p>

          <div className="apply-highlights-row">
            <div className="apply-highlight-card">
              <CheckCircle2 size={16} className="text-success" />
              <span>Direct ATS Ingestion</span>
            </div>
            <div className="apply-highlight-card">
              <Clock size={16} className="text-purple" />
              <span>48-Hour Review SLA</span>
            </div>
            <div className="apply-highlight-card">
              <ShieldCheck size={16} className="text-cyan" />
              <span>Private & Secure Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="apply-main-container">
        {submissionSuccess ? (
          /* Success Confirmation State */
          <div className="apply-success-card animate-fade-in">
            <div className="success-icon-badge">
              <Award size={36} />
            </div>
            <h2 className="success-heading">Application Submitted!</h2>
            <p className="success-subtext">
              Thank you, <strong>{submissionSuccess.name}</strong>. Your application for <strong>{submissionSuccess.role}</strong> has been received and entered into our hiring pipeline.
            </p>

            <div className="application-id-box">
              <div className="app-id-label">Application Tracking Reference</div>
              <div className="app-id-code">TF-2026-CAND-#{submissionSuccess.id}</div>
              <div className="app-stage-pill">
                <span className="stage-dot" />
                <span>Current Stage: Applied (Stage 1 of 6)</span>
              </div>
            </div>

            <div className="apply-next-steps">
              <h4>What happens next?</h4>
              <div className="next-steps-list">
                <div className="next-step-item">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <strong>Automated Ingestion & Scoring</strong>
                    <p>Our ATS algorithm extracts profile highlights and computes profile match score.</p>
                  </div>
                </div>
                <div className="next-step-item">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <strong>Recruiter Screening</strong>
                    <p>A Lead Recruiter reviews your background and contacts you at {submissionSuccess.email}.</p>
                  </div>
                </div>
                <div className="next-step-item">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <strong>Team Interviews</strong>
                    <p>Technical & collaborative interviews with hiring managers and peer engineers.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="success-actions-row">
              <button 
                onClick={handleResetForm} 
                className="btn-apply-secondary"
              >
                <RefreshCw size={15} />
                <span>Submit Another Application</span>
              </button>
              <button 
                onClick={onSwitchToLogin} 
                className="btn-apply-primary"
              >
                <span>{isRecruiterPreview ? 'Return to Workspace' : 'Go to Recruiter Login'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Application Form & Requisition Selector */
          <div className="apply-layout-grid">
            {/* Left Column: Select Open Requisition */}
            <aside className="apply-jobs-sidebar">
              <div className="jobs-sidebar-header">
                <h3>Open Requisitions</h3>
                <span className="jobs-count-tag">{availableJobs.length} active</span>
              </div>
              <p className="jobs-sidebar-sub">
                Select a position to pre-fill your application:
              </p>

              <div className="jobs-card-list">
                {availableJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <div 
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      className={`job-select-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="job-card-top">
                        <span className="job-card-title">{job.title}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-purple flex-shrink-0" />}
                      </div>
                      <div className="job-card-meta">
                        <span className="job-meta-tag">{job.department}</span>
                        <span className="job-meta-item">
                          <MapPin size={12} />
                          {job.location}
                        </span>
                        <span className="job-meta-item">
                          <Clock size={12} />
                          {job.job_type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Recruiter Tip */}
              <div className="apply-sidebar-info">
                <Building2 size={18} className="text-purple mb-2" />
                <h4>Don't see your specific role?</h4>
                <p>
                  Select any opening and type your desired title in the <strong>Target Role</strong> field below.
                </p>
              </div>
            </aside>

            {/* Right Column: Application Form */}
            <section className="apply-form-container">
              <div className="apply-form-header">
                <h2>Candidate Application</h2>
                <p>Applying for: <strong className="text-purple">{formData.applied_role}</strong></p>
              </div>

              {errorMsg && (
                <div className="apply-error-banner animate-fade-in">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="candidate-direct-form">
                {/* Name Grid */}
                <div className="form-grid-2">
                  <div className="apply-field-group">
                    <label htmlFor="first_name">First Name *</label>
                    <div className="apply-input-wrap">
                      <User size={16} className="field-icon" />
                      <input 
                        id="first_name"
                        type="text" 
                        required
                        placeholder="e.g. Liam"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>

                  <div className="apply-field-group">
                    <label htmlFor="last_name">Last Name *</label>
                    <div className="apply-input-wrap">
                      <User size={16} className="field-icon" />
                      <input 
                        id="last_name"
                        type="text" 
                        required
                        placeholder="e.g. Vance"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Grid */}
                <div className="form-grid-2">
                  <div className="apply-field-group">
                    <label htmlFor="email">Email Address *</label>
                    <div className="apply-input-wrap">
                      <Mail size={16} className="field-icon" />
                      <input 
                        id="email"
                        type="email" 
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>

                  <div className="apply-field-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <div className="apply-input-wrap">
                      <Phone size={16} className="field-icon" />
                      <input 
                        id="phone"
                        type="tel" 
                        required
                        placeholder="+1 (555) 012-3456"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Experience Grid */}
                <div className="form-grid-2">
                  <div className="apply-field-group">
                    <label htmlFor="applied_role">Target Role Title *</label>
                    <div className="apply-input-wrap">
                      <Briefcase size={16} className="field-icon" />
                      <input 
                        id="applied_role"
                        type="text" 
                        required
                        placeholder="Role title"
                        value={formData.applied_role}
                        onChange={(e) => setFormData({ ...formData, applied_role: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>

                  <div className="apply-field-group">
                    <label htmlFor="experience_level">Years of Experience</label>
                    <select 
                      id="experience_level"
                      value={formData.experience_level}
                      onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                      className="apply-select-input"
                    >
                      <option value="Entry / 0-1 years">Entry / 0-1 years</option>
                      <option value="1-3 years">1-3 years (Junior / Mid)</option>
                      <option value="3-5 years">3-5 years (Mid / Senior)</option>
                      <option value="5-8 years">5-8 years (Senior / Staff)</option>
                      <option value="8+ years">8+ years (Lead / Principal)</option>
                    </select>
                  </div>
                </div>

                {/* Resume URL & Portfolio */}
                <div className="form-grid-2">
                  <div className="apply-field-group">
                    <label htmlFor="resume_url">Resume URL (Google Drive / Dropbox / Cloud link)</label>
                    <div className="apply-input-wrap">
                      <UploadCloud size={16} className="field-icon" />
                      <input 
                        id="resume_url"
                        type="url" 
                        placeholder="https://drive.google.com/your-resume.pdf"
                        value={formData.resume_url}
                        onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>

                  <div className="apply-field-group">
                    <label htmlFor="portfolio_url">LinkedIn / Portfolio URL (Optional)</label>
                    <div className="apply-input-wrap">
                      <ExternalLink size={16} className="field-icon" />
                      <input 
                        id="portfolio_url"
                        type="url" 
                        placeholder="https://linkedin.com/in/username"
                        value={formData.portfolio_url}
                        onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                        className="apply-text-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="apply-field-group">
                  <label htmlFor="skills">Core Skills & Expertise</label>
                  <div className="apply-input-wrap">
                    <FileText size={16} className="field-icon" />
                    <input 
                      id="skills"
                      type="text" 
                      placeholder="e.g. React, TypeScript, Python, Django, AWS, Docker"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="apply-text-input"
                    />
                  </div>
                </div>

                {/* Cover Note */}
                <div className="apply-field-group">
                  <label htmlFor="notes_summary">Short Introduction / Cover Note</label>
                  <textarea 
                    id="notes_summary"
                    rows={4}
                    placeholder="Briefly tell us about your background, achievements, and why you are interested in this position..."
                    value={formData.notes_summary}
                    onChange={(e) => setFormData({ ...formData, notes_summary: e.target.value })}
                    className="apply-textarea"
                  />
                </div>

                {/* SLA Footer & Submit */}
                <div className="apply-form-footer">
                  <div className="apply-footer-sla">
                    <span className="pulse-dot" />
                    <span>Instant Pipeline Sync • Applicant SLA: 99.8%</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-apply-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="spinner-icon" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>

      {/* Careers Page Footer */}
      <footer className="apply-page-footer">
        <div className="apply-footer-inner">
          <p>© 2026 TalentFlow ATS Recruitment Suite. All rights reserved.</p>
          <div className="apply-footer-links">
            <button onClick={onSwitchToLogin} className="footer-link-btn">
              Recruiter Sign In
            </button>
            <span className="dot-divider">•</span>
            <span>Equal Opportunity Employer</span>
            <span className="dot-divider">•</span>
            <span>GDPR & SOC-2 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
