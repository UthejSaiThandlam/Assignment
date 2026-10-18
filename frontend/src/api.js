export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

export function getAuthHeaders() {
  const token = localStorage.getItem('ats_jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Authentication failed');
  }
  const data = await res.json();
  if (data.token || data.access) {
    localStorage.setItem('ats_jwt_token', data.access || data.token);
  }
  return data;
}

export async function fetchCandidates({ search = '', stage = '', job = '', ordering = '-created_at', page = 1 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (stage) params.append('current_stage', stage);
  if (job) params.append('job', job);
  if (ordering) params.append('ordering', ordering);
  if (page) params.append('page', page);

  const res = await fetch(`${API_BASE}/candidates/?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

export async function fetchCandidateById(id) {
  const res = await fetch(`${API_BASE}/candidates/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch candidate details');
  return res.json();
}

export async function createCandidate(candidateData) {
  const res = await fetch(`${API_BASE}/candidates/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(candidateData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(errorData) || 'Failed to create candidate');
  }
  return res.json();
}

export async function updateCandidate(id, candidateData) {
  const res = await fetch(`${API_BASE}/candidates/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(candidateData),
  });
  if (!res.ok) throw new Error('Failed to update candidate');
  return res.json();
}

export async function deleteCandidate(id) {
  const res = await fetch(`${API_BASE}/candidates/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete candidate');
  return true;
}

export async function updateCandidateStage(id, { to_stage, notes = '', rejection_reason = '', changed_by = 'Hiring Manager' }) {
  const res = await fetch(`${API_BASE}/candidates/${id}/update-stage/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ to_stage, notes, rejection_reason, changed_by }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err) || 'Failed to update candidate stage');
  }
  return res.json();
}

export async function addCandidateNote(id, { author, content }) {
  const res = await fetch(`${API_BASE}/candidates/${id}/add-note/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ author, content }),
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  const data = await res.json();
  return data.results ? data.results : data;
}

export async function createJob(jobData) {
  const res = await fetch(`${API_BASE}/jobs/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error('Failed to create job opening');
  return res.json();
}

export async function fetchDashboardAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/dashboard/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}
