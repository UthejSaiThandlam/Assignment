import React from 'react';
import { 
  Users, 
  Briefcase, 
  GitBranch, 
  BarChart3, 
  UserPlus, 
  PlusCircle, 
  Sparkles,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAddCandidate, 
  onOpenAddJob,
  currentUser,
  onLogout,
  theme,
  onToggleTheme
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: BarChart3 },
    { id: 'pipeline', label: 'Hiring Pipeline', icon: GitBranch },
    { id: 'candidates', label: 'Candidates Directory', icon: Users },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            <Sparkles size={19} className="brand-icon" />
          </div>
          <div className="brand-title">
            <span>Talent</span>Flow
            <span className="brand-badge">Mini ATS</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-btn ${isActive ? 'nav-btn-active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button 
            onClick={onToggleTheme} 
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Quick Create Buttons */}
          <button onClick={onOpenAddJob} className="btn-secondary-custom">
            <PlusCircle size={16} />
            <span>New Job</span>
          </button>
          
          <button onClick={onOpenAddCandidate} className="btn-primary-custom">
            <UserPlus size={16} />
            <span>Add Candidate</span>
          </button>

          {/* Recruiter Profile / Logout */}
          {currentUser && (
            <div className="recruiter-badge-wrap">
              <div className="recruiter-avatar">
                {currentUser.name ? currentUser.name.charAt(0) : 'R'}
              </div>
              <div className="recruiter-meta">
                <span className="recruiter-name">{currentUser.name}</span>
                <span className="recruiter-role">{currentUser.role}</span>
              </div>
              <button 
                onClick={onLogout} 
                className="btn-logout" 
                title="Sign out of ATS"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
