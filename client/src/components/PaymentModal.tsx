import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface PaymentModalProps {
  plan: any;
  onClose: () => void;
  currency: 'NGN' | 'USD';
}

type Status = 'idle' | 'loading' | 'error';

declare global { interface Window { Squad: any; LemonSqueezy: any; } }

export function PaymentModal({ plan, onClose, currency: initialCurrency }: PaymentModalProps) {
  const { user } = useAuthStore();
  const email = user?.email || '';
  const [status, setStatus]   = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>(initialCurrency);
  const [provider, setProvider] = useState<'gtsquad' | 'lemonsqueezy'>('gtsquad');

  // Auto-pick provider: NGN → Squad; USD → Squad (primary) or Lemon if LS configured
  useEffect(() => { setProvider('gtsquad'); }, [currency]);

  if (!plan) return null;

  const price = currency === 'NGN'
    ? `₦${Number(plan.priceNGN ?? plan.price).toLocaleString()}`
    : `$${plan.priceUSD}`;

  const reloadCredits = () => {
    window.dispatchEvent(new Event('credits:refresh'));
    onClose();
  };

  const checkout = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      if (provider === 'lemonsqueezy') {
        const { data } = await api.post('/api/credits/lemonsqueezy-checkout', { packId: plan.id });
        if (window.LemonSqueezy && window.LemonSqueezy.Url) {
          window.LemonSqueezy.Url.Open(data.checkoutUrl);
        } else {
          window.open(data.checkoutUrl, '_blank', 'noopener');
        }
        setStatus('idle');
        return;
      }

      // Default: Squad inline popup
      const { data } = await api.post('/api/credits/gtsquad-checkout', { packId: plan.id, currency });
      if (!window.Squad) {
        setStatus('error');
        setErrorMsg('Payment widget failed to load. Please refresh the page.');
        return;
      }
      const squad = new window.Squad({
        key: data.publicKey,
        email: data.email,
        amount: data.amount,
        currency_code: data.currency,
        transaction_ref: data.transactionRef,
        customer_name: data.customerName,
        metadata: data.metadata,
        onClose: () => setStatus('idle'),
        onSuccess: () => { reloadCredits(); },
      });
      squad.setup();
      squad.open();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Could not start checkout. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && status !== 'loading' && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 6 }}>
              Complete Purchase
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>
              {plan.name} Pack
            </div>
          </div>
          <button onClick={onClose} className="modal-x">{String.fromCharCode(0x2715)}</button>
        </div>

        {/* Currency toggle */}
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--bg-3)',
                      border: '1px solid var(--border-1)', borderRadius: 12, marginBottom: 16 }}>
          {(['NGN', 'USD'] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)}
              style={{ flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none',
                       background: currency === c ? 'var(--amber)' : 'transparent',
                       color: currency === c ? '#000' : 'var(--text-3)',
                       cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
              {c === 'NGN' ? '🇳🇬 NGN (Naira)' : '💳 USD (Dollar)'}
            </button>
          ))}
        </div>

        {/* Provider toggle — only show if Lemon Squeezy is an option for USD */}
        {currency === 'USD' && (
          <div style={{ display:'flex', gap:6, padding:4, background:'var(--bg-3)',
                        border:'1px solid var(--border-1)', borderRadius:12, marginBottom:16 }}>
            {(['gtsquad','lemonsqueezy'] as const).map(p => (
              <button key={p} onClick={() => setProvider(p)}
                style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none',
                         background: provider === p ? 'var(--amber)' : 'transparent',
                         color: provider === p ? '#000' : 'var(--text-3)',
                         cursor:'pointer', textAlign:'center', fontWeight:700, fontSize:12 }}>
                {p === 'gtsquad' ? 'GTSquad (Card)' : 'Lemon Squeezy'}
              </button>
            ))}
          </div>
        )}

        {/* Order summary */}
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border-1)',
                      borderRadius: 'var(--r-l)', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: 'var(--text-3)' }}>Item</span>
            <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{plan.credits?.toLocaleString()} Credits</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>{price}</span>
          </div>
        </div>

        {status === 'error' && errorMsg && (
          <div style={{ marginBottom:16, padding:12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, color:'#f87171', fontSize:13 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button
            className="btn btn-primary"
            onClick={checkout}
            disabled={status === 'loading'}
            style={{ height:52, fontSize:14, fontWeight:700 }}>
            {status === 'loading' ? 'Opening checkout...' : `Pay ${price} →`}
          </button>
          <div style={{ textAlign:'center', opacity:0.4, fontSize:11 }}>
            🔒 SECURE CHECKOUT — Credits added automatically after payment
          </div>
        </div>
      </div>
    </div>
  );
}
