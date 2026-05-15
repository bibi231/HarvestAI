import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function Cookies() {
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="legal-inner">
          <div className="legal-header">
            <span className="legal-eyebrow">Legal</span>
            <h1 className="legal-title">Cookie Policy</h1>
            <p className="legal-meta">Last updated: May 2025 · Effective immediately</p>
          </div>

          <div className="legal-body">
            <section className="legal-section">
              <h2>1. What Are Cookies</h2>
              <p>Cookies are small text files stored in your browser when you visit a website. They allow the site to remember your preferences and improve your experience.</p>
            </section>

            <section className="legal-section">
              <h2>2. Cookies We Use</h2>

              <h3>Essential Cookies</h3>
              <p>Required for the service to function. Cannot be disabled.</p>
              <table className="legal-table">
                <thead>
                  <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
                </thead>
                <tbody>
                  <tr><td>Firebase Auth token</td><td>Keeps you signed in</td><td>Session / 1 year</td></tr>
                  <tr><td>__session</td><td>Server-side session identifier</td><td>Session</td></tr>
                </tbody>
              </table>

              <h3>Analytics Cookies</h3>
              <p>Help us understand how users interact with HarvestAI so we can improve the product.</p>
              <table className="legal-table">
                <thead>
                  <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
                </thead>
                <tbody>
                  <tr><td>_ga, _ga_*</td><td>Google Analytics — page views and events</td><td>2 years</td></tr>
                  <tr><td>_gid</td><td>Google Analytics — session distinction</td><td>24 hours</td></tr>
                </tbody>
              </table>

              <h3>Payment Cookies</h3>
              <p>Set by Paystack and Flutterwave when you interact with the payment checkout.</p>
              <table className="legal-table">
                <thead>
                  <tr><th>Provider</th><th>Purpose</th><th>Duration</th></tr>
                </thead>
                <tbody>
                  <tr><td>Paystack</td><td>Fraud prevention, checkout state</td><td>Session</td></tr>
                  <tr><td>Flutterwave</td><td>Fraud prevention, checkout state</td><td>Session</td></tr>
                </tbody>
              </table>
            </section>

            <section className="legal-section">
              <h2>3. Managing Cookies</h2>
              <p>You can control cookies through your browser settings:</p>
              <ul>
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
              <p>Blocking essential cookies will prevent sign-in and most features from working. Analytics cookies can be disabled without affecting functionality.</p>
            </section>

            <section className="legal-section">
              <h2>4. Opt Out of Analytics</h2>
              <p>To opt out of Google Analytics across all sites, install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>
            </section>

            <section className="legal-section">
              <h2>5. Third-Party Cookies</h2>
              <p>Some cookies on our site are set by third-party services (Google, Paystack, Flutterwave). We do not control these cookies — refer to each provider's privacy policy for details.</p>
            </section>

            <section className="legal-section">
              <h2>6. Changes</h2>
              <p>We may update this policy as we add or remove services. For questions, email <a href="mailto:support@harvestai.ng">support@harvestai.ng</a>.</p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/privacy">Privacy Policy →</Link>
            <Link to="/terms">Terms of Service →</Link>
            <Link to="/refund">Refund Policy →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
