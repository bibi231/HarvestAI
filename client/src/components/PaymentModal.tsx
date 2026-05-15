import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface PaymentModalProps {
  plan: any;
  onClose: () => void;
  currency: 'NGN' | 'USD';
}

type Status = 'idle' | 'loading' | 'error';

export function PaymentModal({ plan, onClose, currency }: PaymentModalProps) {
  const { user } = useAuthStore();
  const email = user?.email || '';
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // NGN → Monnify, USD → GTSquad. User can switch.
  const [gateway, setGateway] = useState<'monnify' | 'gtsquad'>(
    currency === 'NGN' ? 'monnify' : 'gtsquad'
  );

  if (!plan) return null;

  const price = gateway === 'monnify'
    ? `₦${Number(plan.priceNGN ?? plan.price).toLocaleString()}`
    : `$${plan.priceUSD}`;

  const checkout = async (endpoint: string) => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const { data } = await api.post(endpoint, { packId: plan.id, email });
      window.open(data.checkoutUrl, '_blank', 'noopener');
      onClose();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Could not start checkout. Please try again.');
    } finally {
      if (status === 'loading') setStatus('idle');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && status !== 'loading' && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 6 }}>
              Complete Purchase
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>
              {plan.name} Pack
            </div>
          </div>
          <button onClick={onClose} className="modal-x">✕</button>
        </div>

        {/* Gateway Selector */}
        <div style={{
          display: 'flex', gap: 6, padding: 4, background: 'var(--bg-3)',
          border: '1px solid var(--border-1)', borderRadius: 12, marginBottom: 20
        }}>
          {[
            { id: 'monnify', label: '🇳🇬 Monnify', sub: 'NGN · Bank/Card' },
            { id: 'gtsquad', label: '💳 GTSquad', sub: 'USD · Intl Card' },
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setGateway(g.id as any)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none',
                background: gateway === g.id ? 'var(--amber)' : 'transparent',
                color: gateway === g.id ? '#000' : 'var(--text-3)',
                cursor: 'pointer', transition: 'all .2s', textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{g.sub}</div>
            </button>
          ))}
        </div>

        {/* Order summary */}
        <div style={{
          background: 'var(--bg-3)', border: '1px solid var(--border-1)',
          borderRadius: 'var(--r-l)', padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: 'var(--text-3)' }}>Item</span>
            <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{plan.credits?.toLocaleString()} Credits</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>{price}</span>
          </div>
        </div>

        {status === 'error' && errorMsg && (
          <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => checkout(gateway === 'monnify' ? '/api/credits/monnify-checkout' : '/api/credits/gtsquad-checkout')}
            disabled={status === 'loading'}
            style={{ height: 52, fontSize: 14, fontWeight: 700 }}
          >
            {status === 'loading'
              ? 'Opening checkout…'
              : gateway === 'monnify'
                ? '🇳🇬 Pay with Monnify (NGN)'
                : '💳 Pay with GTSquad (USD)'}
          </button>
          <div style={{ textAlign: 'center', opacity: 0.4, fontSize: 11 }}>
            🔒 SECURE CHECKOUT — Credits added automatically after payment
          </div>
        </div>
      </div>
    </div>
  );
}
