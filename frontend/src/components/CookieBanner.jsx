import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Shield } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('talentflow_cookie_consent');
      if (!consent) {
        // Small delay to appear smoothly
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('talentflow_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('talentflow_cookie_consent', 'declined');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-wrap animate-fade-in">
      <div className="cookie-banner-content card-box">
        <div className="cookie-banner-left">
          <div className="cookie-icon-box">
            <Cookie size={20} className="text-purple" />
          </div>
          <div className="cookie-text-group">
            <strong className="cookie-title">Recruiter Privacy & Cookies</strong>
            <p className="cookie-desc">
              TalentFlow uses session cookies and UTM tracking to maintain authentication, save your pipeline preferences, and monitor ATS form success rates.
            </p>
          </div>
        </div>
        <div className="cookie-banner-actions">
          <button onClick={handleDecline} className="btn-cookie-decline">
            <span>Decline</span>
          </button>
          <button onClick={handleAccept} className="btn-cookie-accept">
            <Check size={14} />
            <span>Accept Cookies</span>
          </button>
          <button onClick={() => setIsVisible(false)} className="cookie-close-btn" title="Dismiss">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
