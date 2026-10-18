import React from 'react';
import { Briefcase, MapPin, Users, Calendar, PlusCircle, CheckCircle2, Clock } from 'lucide-react';

export default function JobsView({ jobs, onOpenAddJob, onFilterByJob }) {
  return (
    <div className="jobs-page animate-fade-in">
      <div className="table-header-block">
        <div>
          <h1 className="page-title">Job Requisitions & Openings</h1>
          <p className="page-subtitle">
            Manage active roles, view applicants per role, and assign candidates
          </p>
        </div>
        <button onClick={onOpenAddJob} className="btn-primary-custom">
          <PlusCircle size={17} />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.id} className="job-card card-box">
            <div className="job-card-top">
              <span className={`status-pill pill-${job.status}`}>{job.status}</span>
              <span className="job-type-pill">{job.job_type}</span>
            </div>

            <h3 className="job-card-title">{job.title}</h3>
            <div className="job-meta-row">
              <span className="job-meta-item">
                <Briefcase size={14} className="text-indigo" />
                {job.department}
              </span>
              <span className="job-meta-item">
                <MapPin size={14} className="text-cyan" />
                {job.location}
              </span>
            </div>

            {job.description && (
              <p className="job-desc">{job.description}</p>
            )}

            <div className="job-card-footer">
              <div className="job-applicants-count">
                <Users size={16} className="text-indigo" />
                <span>
                  <strong>{job.candidate_count || 0}</strong> Candidates Applied
                </span>
              </div>
              <button
                className="btn-secondary-custom btn-sm"
                onClick={() => onFilterByJob(job.id)}
              >
                <span>View Candidates</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
