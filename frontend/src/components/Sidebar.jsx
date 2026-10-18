import React from 'react';
import { 
  LayoutDashboard, 
  Columns3, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  Layers,
  Sparkles,
  X,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Hiring Pipeline', icon: Columns3 },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'careers', label: 'Careers Portal', icon: ExternalLink },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayName = (currentUser?.name && currentUser.name !== 'Lead Recruiter') ? currentUser.name : 'Thandlam';
  const displayRole = currentUser?.role || 'Lead Recruiter';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Layers size={22} className="text-purple" />
          </div>
          {!isCollapsed && (
            <div className="brand-titles">
              <span className="brand-name">TalentFlow</span>
              <span className="brand-badge">ATS WORKSPACE</span>
            </div>
          )}
          {/* Mobile Close Button */}
          {isMobileOpen && onCloseMobile && (
            <button className="sidebar-mobile-close" onClick={onCloseMobile}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="nav-group-label">MAIN WORKSPACE</div>}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span className="nav-text">{item.label}</span>
                    {item.id === 'pipeline' && (
                      <span className="nav-counter-pill">6</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
