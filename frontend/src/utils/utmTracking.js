/**
 * UTM Parameter Tracking Utility
 * Automatically parses UTM query parameters from the window location
 * and stores them in sessionStorage/localStorage for recruiter attribution.
 */

export function captureUtmParameters() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const captured = {};

    let hasUtm = false;
    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) {
        captured[key] = val;
        hasUtm = true;
      }
    });

    if (hasUtm) {
      sessionStorage.setItem('ats_utm_data', JSON.stringify(captured));
      localStorage.setItem('ats_last_utm_source', captured.utm_source || 'direct');
    }
    return captured;
  } catch (e) {
    return {};
  }
}

export function getStoredUtmParameters() {
  try {
    const raw = sessionStorage.getItem('ats_utm_data');
    if (raw) return JSON.parse(raw);
    const lastSource = localStorage.getItem('ats_last_utm_source');
    return lastSource ? { utm_source: lastSource } : { utm_source: 'Direct / Career Portal' };
  } catch {
    return { utm_source: 'Direct / Career Portal' };
  }
}
