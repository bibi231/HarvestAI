import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function Refund() {
  return (
    <div className="legal-page">
      <Navbar />
      <main className="legal-main">
        <div className="legal-inner">
          <div className="legal-header">
            <span className="legal-eyebrow">Legal</span>
            <h1 className="legal-title">Refund Policy</h1>
            <p className="legal-meta">Last updated: May 2025 · Effective immediately</p>
          </div>

          <div className="legal-body">
            <section className="legal-section">
              <h2>1. Overview</h2>
              <p>We want you to be satisfied with HarvestAI. This policy explains when refunds are available for paid credit purchases.</p>
            </section>

            <section className="legal-section">
              <h2>2. Credit Purchases</h2>
              <p>Paid credits are digital goods delivered immediately upon successful payment. Because credits are consumed on use, our general policy is:</p>
              <ul>
                <li><strong>Unused credits:</strong> Refundable within 7 days of purchase if no credits have been used from that pack.</li>
                <li><strong>Partially used packs:</strong> No refund for credits already consumed. Refund may be considered for the unused portion at our discretion.</li>
                <li><strong>Duplicate purchases:</strong> If you accidentally purchased the same pack twice within 24 hours, contact us — we will refund the duplicate.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. Failed or Incorrect Charges</h2>
              <p>If you were charged but credits were not added to your account, or if you were charged the wrong amount, contact us within 14 days. We will investigate and either add the missing credits or issue a full refund.</p>
            </section>

            <section className="legal-section">
              <h2>4. Service Outages</h2>
              <p>If a confirmed platform-wide outage causes credits to be deducted for failed jobs (jobs that returned no results due to our system failure, not inaccessible target sites), we will restore those credits.</p>
            </section>

            <section className="legal-section">
              <h2>5. Non-Refundable Situations</h2>
              <p>Refunds are not available for:</p>
              <ul>
                <li>Credits spent on completed jobs, even if results were not what you expected.</li>
                <li>Jobs that failed because the target website blocked access (this is outside our control).</li>
                <li>Free credit usage (free credits have no monetary value).</li>
                <li>Accounts suspended for violating our <Link to="/terms">Terms of Service</Link>.</li>
                <li>Purchases older than 30 days.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>6. How to Request a Refund</h2>
              <p>Email <a href="mailto:support@harvestai.ng">support@harvestai.ng</a> with:</p>
              <ul>
                <li>Your account email address.</li>
                <li>The date and amount of the purchase.</li>
                <li>Payment reference number (from Paystack or Flutterwave).</li>
                <li>Reason for the refund request.</li>
              </ul>
              <p>We respond within 2 business days. Approved refunds are processed within 5–10 business days, depending on your bank.</p>
            </section>

            <section className="legal-section">
              <h2>7. Payment Disputes</h2>
              <p>Please contact us before raising a chargeback with your bank. Chargebacks for valid transactions may result in account suspension. We're happy to resolve billing issues directly and quickly.</p>
            </section>

            <section className="legal-section">
              <h2>8. Changes</h2>
              <p>We may update this policy. Current policy always applies to new purchases. For questions, email <a href="mailto:support@harvestai.ng">support@harvestai.ng</a>.</p>
            </section>
          </div>

          <div className="legal-footer-nav">
            <Link to="/privacy">Privacy Policy →</Link>
            <Link to="/terms">Terms of Service →</Link>
            <Link to="/cookies">Cookie Policy →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
