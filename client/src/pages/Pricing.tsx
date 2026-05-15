import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { PaymentModal } from '../components/PaymentModal';
import { CREDIT_PACKS } from '../types';
import { formatPrice } from '../lib/currency';

const ALL_FEATURES = [
  'All 8 harvest modes',
  'Lead Finder & Email Finder',
  'Data Extractor & Site Crawler',
  'Google Search (SERP)',
  'Bulk CSV & Data Enrichment',
  'Scheduled harvests',
  'CSV & JSON export',
  'Email support',
];

const PACK_FEATURES: Record<string, string[]> = {
  starter: [
    '100 credits — never expire',
    ...ALL_FEATURES,
  ],
  pro: [
    '300 credits — never expire',
    'Best value per credit',
    ...ALL_FEATURES,
  ],
  power: [
    '1,000 credits — never expire',
    'Lowest cost per credit',
    ...ALL_FEATURES,
  ],
};

const FAQ = [
  {
    q: 'What is a credit?',
    a: 'One credit powers one AI extraction action — finding a lead, extracting data from a page, or running a search. Credits are consumed only when a job completes successfully.',
  },
  {
    q: 'Do credits expire?',
    a: 'Free credits reset on the 1st of each month. Paid credits never expire — they stay in your account until you use them.',
  },
  {
    q: 'How do I pay?',
    a: 'NGN payments go through GTSquad (Visa, Mastercard, USSD, bank transfer). USD payments go through Lemon Squeezy (international cards, PayPal).',
  },
  {
    q: 'Can I get a refund?',
    a: 'Unused credit packs are refundable within 7 days of purchase.',
    link: { text: 'See full policy →', to: '/refund' },
  },
  {
    q: 'What if a job fails?',
    a: 'Credits are only deducted for completed jobs. If a job fails due to a platform issue, credits are restored automatically.',
  },
];

export default function Pricing() {
  const { user, currency, setCurrency } = useAuthStore();
  const { signInWithGoogle } = useAuth();
  const [selectedPackId, setSelectedPackId] = React.useState<string | null>(null);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const handlePurchase = (packId: string) => {
    if (!user) { signInWithGoogle(); return; }
    setSelectedPackId(packId);
  };

  const selectedPlan = CREDIT_PACKS.find(p => p.id === selectedPackId);

  return (
    <div className="pricing-page">
      <div className="ambient-grid" />
      <div className="ambient-glow" />
      <Navbar />

      <main className="pricing-main">
        {/* Header */}
        <div className="pricing-head">
          <div className="eyebrow">Pricing & Credits</div>
          <h1 className="hero-h1">Pay only for<br />what you harvest.</h1>
          <p className="hero-sub mx-auto">
            30 free credits every month. No credit card required. Buy credit packs when you need more — they never expire.
          </p>

          <div className="curr-toggle">
            <button className={`curr-btn ${currency === 'NGN' ? 'on' : ''}`} onClick={() => setCurrency('NGN')}>
              🇳🇬 NGN
            </button>
            <button className={`curr-btn ${currency === 'USD' ? 'on' : ''}`} onClick={() => setCurrency('USD')}>
              🇺🇸 USD
            </button>
          </div>
        </div>

        {/* Credit pack cards */}
        <div className="price-cards">
          {CREDIT_PACKS.map((pack, i) => (
            <motion.div
              key={pack.id}
              className={`price-card ${pack.popular ? 'pop' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              {pack.popular && <div className="pop-tag">Most Popular</div>}

              <div>
                <div className="price-name">{pack.name}</div>
                <div className="price-amount">
                  {formatPrice(currency === 'NGN' ? pack.priceNGN : pack.priceUSD, currency)}
                </div>
                <div className="price-credits"><strong>{pack.credits.toLocaleString()}</strong> credits</div>
                <div className="price-per">
                  {formatPrice((currency === 'NGN' ? pack.priceNGN : pack.priceUSD) / pack.credits, currency)} per credit
                </div>
              </div>

              <ul className="price-features">
                {(PACK_FEATURES[pack.id] ?? []).map(feat => (
                  <li key={feat} className="price-feat">
                    <span className="price-feat-check">✓</span> {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`btn btn-xl ${pack.popular ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePurchase(pack.id)}
              >
                {user ? `Buy ${pack.name}` : 'Sign in to buy'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Free tier callout */}
        <div className="price-free-note">
          <div className="price-free-icon">🎁</div>
          <div>
            <div className="text-[15px] font-bold text-text-1">Free tier — always included</div>
            <p className="text-[13px] text-text-2 mt-1">
              Every account gets 30 free credits per month. Resets on the 1st. No card required.
              <Link to="/app" className="text-amber hover:underline ml-2">Start harvesting →</Link>
            </p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="pricing-trust">
          <div className="pricing-trust-item">
            <span className="pricing-trust-icon">🔒</span>
            <span>AES-256 encrypted checkout</span>
          </div>
          <div className="pricing-trust-item">
            <span className="pricing-trust-icon">💳</span>
            <span>GTSquad · Lemon Squeezy</span>
          </div>
          <div className="pricing-trust-item">
            <span className="pricing-trust-icon">♻️</span>
            <span>Credits never expire</span>
          </div>
          <div className="pricing-trust-item">
            <span className="pricing-trust-icon">📧</span>
            <span>Refunds within 7 days</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="pricing-faq">
          <h2 className="pricing-faq-title">Frequently asked questions</h2>
          <div className="pricing-faq-list">
            {FAQ.map((item, i) => (
              <div key={i} className={`pricing-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button
                  className="pricing-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="pricing-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pricing-faq-a"
                  >
                    {item.a}
                    {item.link && (
                      <Link to={item.link.to} className="text-amber hover:underline ml-1">{item.link.text}</Link>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {selectedPlan && (
        <PaymentModal
          plan={{
            ...selectedPlan,
            price: currency === 'NGN' ? selectedPlan.priceNGN : selectedPlan.priceUSD,
            currency,
          }}
          currency={currency}
          onClose={() => setSelectedPackId(null)}
        />
      )}
    </div>
  );
}
