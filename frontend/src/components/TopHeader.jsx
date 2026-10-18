import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Plus, 
  Briefcase,
  BriefcasePlus, 
  ChevronRight,
  ChevronDown,
  Command,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  KeyRound,
  Settings,
  Palette,
  Building2,
  HelpCircle,
  Check
} from 'lucide-react';

export default function TopHeader({
  activeTab,
  theme,
  onToggleTheme,
  onNavigateTab,
  onOpenAddCandidate,
  onOpenAddJob,
  globalSearch,
  setGlobalSearch,
  onSearchEnter,
  currentUser,
  onLogout,
  onOpenMobileMenu,
  onOpenSiteSearch,
  onOpenCareersPage
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const profileMenuRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2400);
  };

  const handleMenuItemClick = (label, action) => {
    if (action) {
      action();
    } else {
      showToast(label);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProfileMenu]);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return { section: 'Workspace', page: 'Overview' };
      case 'pipeline':
        return { section: 'Recruitment', page: 'Hiring Pipeline' };
      case 'candidates':
        return { section: 'Talent Pool', page: 'Candidates Directory' };
      case 'jobs':
        return { section: 'Requisitions', page: 'Job Openings' };
      case 'settings':
        return { section: 'Account', page: 'Settings' };
      default:
        return { section: 'Workspace', page: 'Overview' };
    }
  };

  const breadcrumb = getBreadcrumb();
  const userName = (currentUser?.name && currentUser.name !== 'Lead Recruiter') 
    ? currentUser.name 
    : 'Thandlam';
  const userRole = currentUser?.role || 'Lead Recruiter';
  const userEmail = (currentUser?.email && currentUser.email.includes('@gmail.com'))
    ? currentUser.email
    : 'uthejsaithandlam@gmail.com';

  return (
    <header className="app-topbar sticky-topbar">
      <div className="topbar-left-group">
        {/* Mobile Hamburger Menu Toggle */}
        <button 
          className="topbar-mobile-menu-btn" 
          onClick={onOpenMobileMenu}
          title="Open Mobile Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-section">{breadcrumb.section}</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Global Interactive Site Search Bar */}
      <div 
        className="topbar-search-wrap"
        onClick={() => onOpenSiteSearch && onOpenSiteSearch()}
      >
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search candidates, roles, skills (⌘K)..."
          value={globalSearch || ''}
          onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSearchEnter) {
              onSearchEnter();
            }
          }}
        />
        <div className="search-kbd-shortcut">
          <Command size={11} />
          <span>K</span>
        </div>
      </div>

      {/* Action Controls & Recruiter Quick Actions */}
      <div className="topbar-actions">
        {/* Quick Add Job (secondary) */}
        <button 
          onClick={onOpenAddJob} 
          className="btn-topbar-secondary"
          title="Create a new job opening"
        >
          <BriefcasePlus size={15} />
          <span>New Job</span>
        </button>

        {/* Primary Purple Action: Add Candidate */}
        <button 
          onClick={onOpenAddCandidate} 
          className="btn-topbar-primary"
          title="Add a new candidate application"
        >
          <Plus size={16} />
          <span>Add Candidate</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button className="topbar-icon-btn" title="Recent recruiter notifications">
          <Bell size={16} />
          <span className="notification-badge-dot"></span>
        </button>

        {/* Theme Toggle Button (Dark / Light) */}
        <button 
          onClick={onToggleTheme} 
          className="topbar-icon-btn" 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber" /> : <Moon size={16} />}
        </button>

        {/* Divider */}
        <div className="topbar-divider"></div>

        {/* Top Right Recruiter Profile */}
        <div className="topbar-profile-container">
          <div 
            className="profile-pill-wrapper" 
            ref={profileMenuRef}
          >
            <button 
              type="button"
              className="topbar-profile-pill"
              onClick={() => setShowProfileMenu(prev => !prev)}
              title="Recruiter Profile & Settings"
              aria-expanded={showProfileMenu}
            >
              <div className="topbar-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{userName}</span>
                <span className="topbar-user-role">{userRole}</span>
              </div>
              <ChevronDown size={14} className="topbar-chevron" />
            </button>

            {/* Shortened & Themed Recruiter Profile Dropdown */}
            {showProfileMenu && (
              <div className="themed-profile-dropdown animate-fade-in" role="dialog" aria-label="Profile Menu">
                {/* Compact Recruiter Info Header */}
                <div className="profile-mini-header">
                  <div className="profile-mini-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-mini-meta">
                    <div className="profile-mini-name-row">
                      <span className="profile-mini-name">{userName}</span>
                      <button 
                        type="button" 
                        className={`profile-status-badge ${isOnline ? 'online' : 'away'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = !isOnline;
                          setIsOnline(next);
                          showToast(next ? 'Status: Active Recruiter' : 'Status: Away');
                        }}
                        title="Toggle availability status"
                      >
                        <span className="status-indicator-dot" />
                        <span>{isOnline ? 'Active' : 'Away'}</span>
                      </button>
                    </div>
                    <span className="profile-mini-role">{userRole} • Talent Acquisition</span>
                    <span className="profile-mini-email">{userEmail}</span>
                  </div>
                </div>

                <div className="profile-menu-divider" />

                {/* Shortened, Focused Action List */}
                <div className="profile-menu-list">
                  <div 
                    className="profile-menu-row"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigateTab && onNavigateTab('settings');
                    }}
                  >
                    <Settings size={16} className="profile-row-icon" />
                    <span className="profile-row-label">Account & Workspace Settings</span>
                  </div>

                  <div 
                    className="profile-menu-row"
                    onClick={() => {
                      onToggleTheme && onToggleTheme();
                      showToast(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
                    }}
                  >
                    {theme === 'dark' ? (
                      <Sun size={16} className="profile-row-icon text-amber" />
                    ) : (
                      <Moon size={16} className="profile-row-icon" />
                    )}
                    <span className="profile-row-label">Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>

                  <div 
                    className="profile-menu-row"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenCareersPage) {
                        onOpenCareersPage();
                      } else if (onNavigateTab) {
                        onNavigateTab('careers');
                      }
                    }}
                  >
                    <Briefcase size={16} className="profile-row-icon text-purple" />
                    <span className="profile-row-label flex-1">Candidate Careers Portal</span>
                    <span className="profile-row-badge">Public</span>
                  </div>

                  <div 
                    className="profile-menu-row"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSiteSearch && onOpenSiteSearch();
                    }}
                  >
                    <HelpCircle size={16} className="profile-row-icon" />
                    <span className="profile-row-label flex-1">Shortcuts & Search</span>
                    <span className="profile-kbd-tag">⌘K</span>
                  </div>

                  <div className="profile-menu-divider" />

                  <div 
                    className="profile-menu-row text-danger-row"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout && onLogout();
                    }}
                  >
                    <LogOut size={16} className="profile-row-icon" />
                    <span className="profile-row-label">Sign out of TalentFlow</span>
                  </div>
                </div>

                {/* Interactive Toast Inside Dropdown */}
                {toastMessage && (
                  <div className="profile-menu-toast animate-fade-in">
                    <Check size={12} />
                    <span>{toastMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
