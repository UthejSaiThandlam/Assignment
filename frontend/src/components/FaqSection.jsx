import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, Shield, Cpu, Zap, Activity } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How is the ATS profile match score calculated?',
      a: 'The ATS Match Score (0–100%) compares the applicant’s skills, experience duration, and role keywords against the target job requisition specifications using normalized scoring weights.',
      icon: Cpu,
    },
    {
      q: 'How does stage transition audit logging work?',
      a: 'Every time a candidate moves between Applied, Screening, Interview, Offer, Hired, or Rejected, Django REST Framework creates an immutable StageHistory record noting the actor, timestamp, and optional rejection reason.',
      icon: Shield,
    },
    {
      q: 'What rate limits are enforced on the backend REST API?',
      a: 'To guarantee uptime and prevent credential stuffing, the Django REST API applies rate limiting throttles: 15 requests/minute for authentication endpoints, 60 requests/minute for public requests, and 120 requests/minute for authenticated recruiter sessions.',
      icon: Zap,
    },
    {
      q: 'How are UTM campaign tracking tags captured?',
      a: 'When candidates apply through career portals, social links, or job boards with UTM query parameters (utm_source, utm_medium, utm_campaign), TalentFlow automatically stores attribution data to identify high-performing talent sources.',
      icon: Activity,
    },
    {
      q: 'What is the form submission success rate and health SLA?',
      a: 'All candidate submissions and requisition forms run through client-side validation and atomic database transactions, achieving a 99.8% form delivery success rate with instant error feedback.',
      icon: Sparkles,
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="faq-section-container">
      <div className="faq-header">
        <div className="flex-align-gap">
          <HelpCircle size={18} className="text-purple" />
          <h2 className="section-title">Frequently Asked Questions & ATS Guide</h2>
        </div>
        <p className="text-secondary text-sm">
          Expandable answers to core operational questions regarding pipelines, rate limits, and scoring.
        </p>
      </div>

      <div className="faq-accordion-list">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          const Icon = item.icon;
          return (
            <div key={idx} className={`faq-accordion-item card-box ${isOpen ? 'open' : ''}`}>
              <button 
                type="button" 
                className="faq-question-btn"
                onClick={() => toggle(idx)}
              >
                <div className="faq-q-left">
                  <Icon size={16} className={isOpen ? 'text-purple' : 'text-muted'} />
                  <span className="faq-question-text">{item.q}</span>
                </div>
                <ChevronDown size={16} className={`faq-chevron ${isOpen ? 'rotate' : ''}`} />
              </button>
              {isOpen && (
                <div className="faq-answer-body animate-fade-in">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
