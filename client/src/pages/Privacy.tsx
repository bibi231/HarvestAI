import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function Privacy() {
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="legal-inner">
          <div className="legal-header">
            <span className="legal-eyebrow">Legal</span>
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-meta">Last updated: May 2025 · Effective immediately</p>
          </div>

          <div className="legal-body">
            <section className="legal-section">
              <h2>1. Who We Are</h2>
              <p>HarvestAI is operated by TrueWeb Solutions, a technology company based in Nigeria. We provide AI-powered web scraping, data extraction, and lead generation services at <strong>harvestai.com.ng</strong>.</p>
              <p>For privacy questions, contact us at: <a href="mailto:support@harvestai.ng">support@harvestai.ng</a></p>
            </section>

            <section className="legal-section">
              <h2>2. Data We Collect</h2>
              <p>We collect data to provide and improve our services:</p>
              <ul>
                <li><strong>Account data:</strong> Email address and display name via Google/Firebase Auth when you sign in.</li>
                <li><strong>Usage data:</strong> URLs you submit, harvest jobs you run, mode selections, and output results.</li>
                <li><strong>Payment data:</strong> Transaction references from Paystack and Flutterwave. We never store your card details — payment processors handle that.</li>
                <li><strong>Technical data:</strong> IP address, browser type, device type, and standard web logs.</li>
                <li><strong>Analytics:</strong> Aggregated usage metrics via Google Analytics (anonymised).</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. How We Use Your Data</h2>
              <ul>
                <li>To run harvest jobs and return results to you.</li>
                <li>To manage your credit balance and billing history.</li>
                <li>To send transactional emails (credit top-ups, job completion).</li>
                <li>To improve our AI models and service quality.</li>
                <li>To prevent abuse and enforce our Terms of Service.</li>
              </ul>
              <p>We do <strong>not</strong> sell your personal data to third parties.</p>
            </section>

            <section className="legal-section">
              <h2>4. Data Sharing</h2>
              <p>We share data only with service providers essential to our operation:</p>
              <ul>
                <li><strong>Firebase (Google)</strong> — authentication and cloud functions.</li>
                <li><strong>Neon / PostgreSQL</strong> — database hosting for job history and credits.</li>
                <li><strong>Paystack & Flutterwave</strong> — payment processing.</li>
                <li><strong>OpenAI / AI providers</strong> — processing your extraction requests.</li>
                <li><strong>Render / Vercel</strong> — infrastructure hosting.</li>
              </ul>
              <p>All providers are contractually bound to protect your data.</p>
            </section>

            <section className="legal-section">
              <h2>5. Data Retention</h2>
              <p>We retain your job history and account data for as long as your account is active. You may request deletion at any time. Payment records are retained for 7 years as required by Nigerian financial regulations.</p>
            </section>

            <section className="legal-section">
              <h2>6. Your Rights</h2>
              <p>Under applicable data protection laws (including NDPR), you have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and data.</li>
                <li>Withdraw consent for marketing emails at any time.</li>
              </ul>
              <p>Email <a href="mailto:support@harvestai.ng">support@harvestai.ng</a> to exercise these rights. We respond within 14 business days.</p>
            </section>

            <section className="legal-section">
              <h2>7. Cookies</h2>
              <p>We use essential cookies for authentication and session management, plus analytics cookies (Google Analytics). See our <Link to="/cookies">Cookie Policy</Link> for full details.</p>
            </section>

            <section className="legal-section">
              <h2>8. Security</h2>
              <p>We use HTTPS, Firebase Auth JWT tokens, and encrypted database connections. No security system is perfect — if you discover a vulnerability, please report it to <a href="mailto:support@harvestai.ng">support@harvestai.ng</a>.</p>
            </section>

            <section className="legal-section">
              <h2>9. Children</h2>
              <p>HarvestAI is not directed at children under 13. We do not knowingly collect data from minors.</p>
            </section>

            <section className="legal-section">
              <h2>10. Changes to This Policy</h2>
              <p>We may update this policy. Material changes will be notified via email or an in-app banner at least 14 days before taking effect.</p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/terms">Terms of Service →</Link>
            <Link to="/refund">Refund Policy →</Link>
            <Link to="/cookies">Cookie Policy →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
