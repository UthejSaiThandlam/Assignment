import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import DashboardView from './components/DashboardView';
import PipelineKanbanView from './components/PipelineKanbanView';
import CandidatesTableView from './components/CandidatesTableView';
import JobsView from './components/JobsView';
import SettingsView from './components/SettingsView';
import CandidateDetailModal from './components/CandidateDetailModal';
import CandidateFormModal from './components/CandidateFormModal';
import StageTransitionModal from './components/StageTransitionModal';
import JobFormModal from './components/JobFormModal';
import LoginPage from './components/LoginPage';
import CandidateApplyPage from './components/CandidateApplyPage';
import SiteSearchModal from './components/SiteSearchModal';
import FloatingContactModal from './components/FloatingContactModal';
import { captureUtmParameters } from './utils/utmTracking';

import { 
  fetchCandidates, 
  fetchJobs, 
  fetchDashboardAnalytics, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate, 
  updateCandidateStage, 
  addCandidateNote, 
  createJob,
  fetchCandidateById,
  loginUser
} from './api';

export default function App() {
  const isCareersUrl = typeof window !== 'undefined' && (
    window.location.pathname.includes('/careers') || 
    window.location.hash.includes('careers') ||
    window.location.search.includes('careers')
  );

  const [activeTab, setActiveTab] = useState(isCareersUrl ? 'careers' : 'dashboard');
  const [publicView, setPublicView] = useState(isCareersUrl ? 'apply' : 'login');
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Theme State: 'dark' is default modern ATS theme
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ats_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('ats_theme', nextTheme);
    } catch {}
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Capture UTM parameters and sync /careers URL
  useEffect(() => {
    captureUtmParameters();
    fetchJobs().then(setJobs).catch(() => {});

    const handleUrlSync = () => {
      if (window.location.pathname.includes('/careers') || window.location.hash.includes('careers')) {
        setActiveTab('careers');
        setPublicView('apply');
      }
    };
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);

  // Recruiter Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ats_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Lead Recruiter' || !parsed.name) {
          parsed.name = 'Thandlam';
        }
        if (parsed.email === 'recruiter@talentflow.io' || !parsed.email) {
          parsed.email = 'uthejsaithandlam@gmail.com';
        }
        return parsed;
      }
      return {
        username: 'thandlam',
        name: 'Thandlam',
        role: 'Lead Recruiter',
        email: 'uthejsaithandlam@gmail.com',
      };
    } catch {
      return {
        username: 'thandlam',
        name: 'Thandlam',
        role: 'Lead Recruiter',
        email: 'uthejsaithandlam@gmail.com',
      };
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  // Modals state
  const [isCandidateFormOpen, setIsCandidateFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);

  const [stageModalState, setStageModalState] = useState({
    isOpen: false,
    candidate: null,
    defaultToStage: '',
  });

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Global Site Search Modal state
  const [isSiteSearchOpen, setIsSiteSearchOpen] = useState(false);

  // Mobile Menu drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sidebar collapsed state (persistent)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ats_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('ats_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  // Scroll Progress Bar percentage
  const [scrollProgress, setScrollProgress] = useState(0);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSiteSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewportScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight > el.clientHeight) {
      const prog = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(prog);
    } else {
      setScrollProgress(0);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadAllData = async () => {
    try {
      const [candRes, jobsRes, statsRes] = await Promise.all([
        fetchCandidates({ ordering: '-created_at' }),
        fetchJobs(),
        fetchDashboardAnalytics(),
      ]);

      const candidateList = candRes.results ? candRes.results : candRes;
      setCandidates(candidateList);
      setJobs(jobsRes);
      setAnalytics(statsRes);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // Load detailed profile when candidate clicked (instant local display + fetch full audit)
  useEffect(() => {
    if (selectedCandidateId) {
      const localCand = candidates.find(c => c.id === selectedCandidateId);
      if (localCand) {
        setSelectedCandidateDetail(localCand);
      }
      fetchCandidateById(selectedCandidateId)
        .then((data) => setSelectedCandidateDetail(data))
        .catch((err) => console.error(err));
    } else {
      setSelectedCandidateDetail(null);
    }
  }, [selectedCandidateId, candidates]);

  // Authentication Handlers
  const handleLogin = async (username, password) => {
    const res = await loginUser(username, password);
    setCurrentUser(res.user);
    try {
      localStorage.setItem('ats_user', JSON.stringify(res.user));
      if (res.token || res.access) {
        localStorage.setItem('ats_jwt_token', res.access || res.token);
      }
    } catch {}
    showToast(`Welcome back, ${res.user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ats_user');
      localStorage.removeItem('ats_jwt_token');
    } catch {}
    showToast('Signed out of recruiter portal.');
  };

  // Candidate Create/Edit
  const handleSaveCandidate = async (formData, id) => {
    if (id) {
      await updateCandidate(id, formData);
      showToast('Candidate profile updated successfully.');
    } else {
      await createCandidate(formData);
      showToast('New candidate added to hiring pipeline.');
    }
    await loadAllData();
    if (selectedCandidateId) {
      const updated = await fetchCandidateById(selectedCandidateId);
      setSelectedCandidateDetail(updated);
    }
  };

  // Candidate Delete
  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this candidate profile?')) {
      await deleteCandidate(id);
      showToast('Candidate profile deleted.');
      if (selectedCandidateId === id) {
        setSelectedCandidateId(null);
      }
      await loadAllData();
    }
  };

  // Stage Transition
  const handleUpdateStage = async (candidateId, { to_stage, notes, rejection_reason, changed_by }) => {
    const actor = changed_by || currentUser?.name || 'Recruiter';
    const updated = await updateCandidateStage(candidateId, {
      to_stage,
      notes,
      rejection_reason,
      changed_by: actor,
    });
    showToast(`Candidate moved to ${to_stage.toUpperCase()}`);
    await loadAllData();

    if (selectedCandidateId === candidateId) {
      setSelectedCandidateDetail(updated);
    }
  };

  // Add Note
  const handleAddNote = async (candidateId, { author, content }) => {
    const noteAuthor = author || currentUser?.name || 'Recruiter';
    await addCandidateNote(candidateId, { author: noteAuthor, content });
    showToast('Interviewer assessment note added.');
    if (selectedCandidateId === candidateId) {
      const updated = await fetchCandidateById(candidateId);
      setSelectedCandidateDetail(updated);
    }
  };

  // Create Job Opening
  const handleCreateJob = async (jobData) => {
    await createJob(jobData);
    showToast('New job opening created.');
    await loadAllData();
  };

  // Filter candidates by stage handler
  const handleFilterCandidatesByStage = (stage) => {
    setStageFilter(stage);
    setActiveTab('candidates');
  };

  // Global search enter handler
  const handleGlobalSearchEnter = () => {
    setActiveTab('candidates');
  };

  // If not logged in, display either the Recruiter Login Portal or the Candidate Application Page
  if (!currentUser) {
    return (
      <div className={`app-root theme-${theme}`} data-theme={theme}>
        {toastMessage && (
          <div className="toast-notification animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
        {publicView === 'apply' ? (
          <CandidateApplyPage
            onSwitchToLogin={() => setPublicView('login')}
            theme={theme}
            onToggleTheme={toggleTheme}
            jobs={jobs}
            onApplicationSubmitted={loadAllData}
          />
        ) : (
          <LoginPage 
            onLoginSuccess={handleLogin} 
            onSwitchToApply={() => setPublicView('apply')}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`app-workspace-layout theme-${theme}`} data-theme={theme}>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar (foldable with collapse toggle) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Workspace Frame */}
      <div className="workspace-main-column">
        {/* Compact Top Header (64px, Sticky, Top Right Profile and Logout) */}
        <TopHeader
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigateTab={setActiveTab}
          onOpenAddCandidate={() => {
            setEditingCandidate(null);
            setIsCandidateFormOpen(true);
          }}
          onOpenAddJob={() => setIsJobModalOpen(true)}
          globalSearch={searchQuery}
          setGlobalSearch={setSearchQuery}
          onSearchEnter={handleGlobalSearchEnter}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSiteSearch={() => setIsSiteSearchOpen(true)}
          onOpenCareersPage={() => setActiveTab('careers')}
        />

        {/* Sticky Scroll Progress Bar */}
        <div 
          className="top-scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Content View Container with Scroll Progress Tracking */}
        <main 
          onScroll={handleViewportScroll}
          className={`workspace-viewport ${activeTab === 'dashboard' ? 'viewport-dashboard-lock' : ''}`}
        >
          {isLoading && candidates.length === 0 ? (
            <div className="global-loading">
              <div className="spinner" />
              <p>Connecting to TalentFlow ATS REST API...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  analytics={analytics}
                  onSelectCandidate={(id) => setSelectedCandidateId(id)}
                  onNavigateToPipeline={() => setActiveTab('pipeline')}
                  onNavigateToCandidates={() => setActiveTab('candidates')}
                  onFilterCandidatesByStage={handleFilterCandidatesByStage}
                />
              )}

              {activeTab === 'pipeline' && (
                <PipelineKanbanView
                  candidates={candidates}
                  jobs={jobs}
                  onSelectCandidate={(id) => setSelectedCandidateId(id)}
                  onOpenAddCandidate={() => {
                    setEditingCandidate(null);
                    setIsCandidateFormOpen(true);
                  }}
                  onOpenStageModal={(cand, toStage) => {
                    setStageModalState({
                      isOpen: true,
                      candidate: cand,
                      defaultToStage: toStage,
                    });
                  }}
                />
              )}

              {activeTab === 'candidates' && (
                <CandidatesTableView
                  candidates={candidates}
                  jobs={jobs}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  stageFilter={stageFilter}
                  setStageFilter={setStageFilter}
                  jobFilter={jobFilter}
                  setJobFilter={setJobFilter}
                  ordering={ordering}
                  setOrdering={setOrdering}
                  onSelectCandidate={(id) => setSelectedCandidateId(id)}
                  onEditCandidate={(cand) => {
                    setEditingCandidate(cand);
                    setIsCandidateFormOpen(true);
                  }}
                  onDeleteCandidate={handleDeleteCandidate}
                  onOpenStageModal={(cand, toStage) => {
                    setStageModalState({
                      isOpen: true,
                      candidate: cand,
                      defaultToStage: toStage,
                    });
                  }}
                />
              )}

              {activeTab === 'jobs' && (
                <JobsView
                  jobs={jobs}
                  onOpenAddJob={() => setIsJobModalOpen(true)}
                  onFilterByJob={(jobId) => {
                    setJobFilter(jobId);
                    setActiveTab('candidates');
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  onSaveSettings={() => showToast('Account settings saved.')}
                />
              )}

              {activeTab === 'careers' && (
                <CandidateApplyPage
                  onSwitchToLogin={() => setActiveTab('dashboard')}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  jobs={jobs}
                  onApplicationSubmitted={loadAllData}
                  isRecruiterPreview={true}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Candidate Full Profile & Audit Modal / Drawer */}
      {selectedCandidateDetail && (
        <CandidateDetailModal
          candidate={selectedCandidateDetail}
          onClose={() => {
            setSelectedCandidateId(null);
            setSelectedCandidateDetail(null);
          }}
          onUpdateStage={handleUpdateStage}
          onAddNote={handleAddNote}
        />
      )}

      {/* Candidate Add / Edit Modal */}
      <CandidateFormModal
        isOpen={isCandidateFormOpen}
        onClose={() => {
          setIsCandidateFormOpen(false);
          setEditingCandidate(null);
        }}
        onSave={handleSaveCandidate}
        initialData={editingCandidate}
        jobs={jobs}
      />

      {/* Stage Transition Quick Dialog */}
      <StageTransitionModal
        isOpen={stageModalState.isOpen}
        candidate={stageModalState.candidate}
        defaultToStage={stageModalState.defaultToStage}
        onClose={() => setStageModalState({ isOpen: false, candidate: null, defaultToStage: '' })}
        onUpdateStage={handleUpdateStage}
      />

      {/* New Job Opening Modal */}
      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleCreateJob}
      />

      {/* Interactive Global Site Search (⌘K) Modal */}
      <SiteSearchModal
        isOpen={isSiteSearchOpen}
        onClose={() => setIsSiteSearchOpen(false)}
        candidates={candidates}
        jobs={jobs}
        onSelectCandidate={(id) => setSelectedCandidateId(id)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Floating Contact & Support Button with Help Desk Modal */}
      <FloatingContactModal />

    </div>
  );
}
