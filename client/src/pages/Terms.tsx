import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function Terms() {
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="legal-inner">
          <div className="legal-header">
            <span className="legal-eyebrow">Legal</span>
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-meta">Last updated: May 2025 · Effective immediately</p>
          </div>

          <div className="legal-body">
            <section className="legal-section">
              <h2>1. Acceptance</h2>
              <p>By creating an account or using HarvestAI, you agree to these Terms. If you disagree, do not use the service. HarvestAI is operated by TrueWeb Solutions, Lagos, Nigeria.</p>
            </section>

            <section className="legal-section">
              <h2>2. The Service</h2>
              <p>HarvestAI provides AI-powered web data extraction, lead generation, and business intelligence tools. We offer free and paid tiers. Features, limits, and pricing may change with notice.</p>
            </section>

            <section className="legal-section">
              <h2>3. Accounts</h2>
              <ul>
                <li>You must be 13 or older and legally able to enter contracts in your jurisdiction.</li>
                <li>You are responsible for all activity under your account.</li>
                <li>Keep your credentials secure. Notify us immediately at <a href="mailto:support@harvestai.ng">support@harvestai.ng</a> if you suspect unauthorised access.</li>
                <li>One account per person. Creating multiple accounts to exploit free credits is prohibited.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Acceptable Use</h2>
              <p>You may use HarvestAI only for lawful purposes. You must not:</p>
              <ul>
                <li>Scrape websites that explicitly prohibit it in their robots.txt or Terms of Service.</li>
                <li>Extract personal data for spam, harassment, or unsolicited marketing.</li>
                <li>Use results to build databases for illegal discrimination.</li>
                <li>Attempt to reverse-engineer, overload, or attack our systems.</li>
                <li>Resell raw API access without our written permission.</li>
                <li>Extract data that infringes copyright or intellectual property rights.</li>
              </ul>
              <p>You are solely responsible for how you use extracted data and for compliance with applicable laws (including GDPR, NDPR, CAN-SPAM).</p>
            </section>

            <section className="legal-section">
              <h2>5. Credits and Payments</h2>
              <ul>
                <li>Free credits reset monthly. Unused free credits do not carry over.</li>
                <li>Paid credits do not expire while your account is active.</li>
                <li>All prices are in NGN unless stated otherwise. International card charges may include conversion fees.</li>
                <li>Payments are processed by Paystack and Flutterwave. See our <Link to="/refund">Refund Policy</Link> for disputes.</li>
                <li>We reserve the right to change pricing with 14 days' notice.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>6. Intellectual Property</h2>
              <p>HarvestAI and its underlying technology, design, and branding are owned by TrueWeb Solutions. You retain ownership of data you submit. You grant us a limited licence to process your data solely to provide the service.</p>
            </section>

            <section className="legal-section">
              <h2>7. Disclaimers</h2>
              <p>The service is provided "as is." We do not guarantee that extracted data is accurate, complete, or current — web pages change. We are not liable for decisions made based on extracted data.</p>
              <p>AI extraction may produce errors. Always verify critical business data from primary sources.</p>
            </section>

            <section className="legal-section">
              <h2>8. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, TrueWeb Solutions' total liability to you for any claim is limited to the amount you paid us in the 3 months before the claim arose. We are not liable for indirect, consequential, or incidental damages.</p>
            </section>

            <section className="legal-section">
              <h2>9. Termination</h2>
              <p>We may suspend or terminate accounts that violate these Terms. You may delete your account at any time from Settings. Unused paid credits are non-refundable on voluntary termination unless required by law.</p>
            </section>

            <section className="legal-section">
              <h2>10. Governing Law</h2>
              <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved in Nigerian courts, except where local mandatory consumer protection laws apply.</p>
            </section>

            <section className="legal-section">
              <h2>11. Changes</h2>
              <p>We may update these Terms. Continued use after the effective date constitutes acceptance. Material changes will be notified 14 days in advance.</p>
            </section>

            <section className="legal-section">
              <h2>12. Contact</h2>
              <p>Questions? Email <a href="mailto:support@harvestai.ng">support@harvestai.ng</a> or write to TrueWeb Solutions, Lagos, Nigeria.</p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/privacy">Privacy Policy →</Link>
            <Link to="/refund">Refund Policy →</Link>
            <Link to="/cookies">Cookie Policy →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
