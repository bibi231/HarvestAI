import React, { useState, useEffect } from 'react';

const KEY = 'harvestai_cookie_consent';
const GA_ID = 'G-XXXXXXXXXX'; // TODO: Replace with your HarvestAI GA4 Measurement ID

function applyConsent(accepted: boolean) {
  const w = window as any;
  const consent = accepted
    ? { analytics_storage:'granted', ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' }
    : { analytics_storage:'denied',  ad_storage:'denied',  ad_user_data:'denied',  ad_personalization:'denied'  };
  if (w.gtag) {
    w.gtag('consent', 'update', consent);
    if (accepted) {
      w.gtag('config', GA_ID, { page_path: window.location.pathname });
    }
  }
  w[`ga-disable-${GA_ID}`] = !accepted;
  if (!accepted) {
    ['_ga','_gid','_gat'].forEach(name => {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${location.hostname}`;
    });
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      setTimeout(() => setVisible(true), 1200);
    } else {
      applyConsent(stored === 'accepted');
    }
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, 'accepted');
    applyConsent(true);
    setVisible(false);
  };
  const decline = () => {
    localStorage.setItem(KEY, 'declined');
    applyConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-inner">
        <div className="cookie-text">
          <p>
            <strong>We use cookies</strong> — essential ones keep HarvestAI running smoothly; optional analytics &amp; ad cookies
            help us improve the platform and show relevant ads.
          </p>
          {details && (
            <ul className="cookie-detail-list">
              <li><strong>Essential</strong> — login sessions, security. Always active.</li>
              <li><strong>Analytics</strong> — Google Analytics (page views). Off until accepted.</li>
              <li><strong>Advertising</strong> — Google AdSense (relevant ads). Off until accepted.</li>
            </ul>
          )}
          <button className="cookie-details-toggle" onClick={() => setDetails(d => !d)}>
            {details ? 'Hide details ▲' : 'Show details ▼'}
          </button>
        </div>
        <div className="cookie-actions">
          <button className="btn-secondary btn-sm cookie-btn-decline" onClick={decline}>Decline optional</button>
          <button className="btn-primary btn-sm cookie-btn-accept" onClick={accept}>Accept all</button>
        </div>
      </div>
    </div>
  );
}
