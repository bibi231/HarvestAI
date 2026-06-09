import React, { useState } from 'react';
import { PackId, CREDIT_PACKS } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface GTSquadButtonProps {
  packId: PackId;
  className?: string;
}

export function GTSquadButton({ packId, className }: GTSquadButtonProps) {
  const user = useAuthStore(s => s.user);
  const pack = CREDIT_PACKS.find(p => p.id === packId);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!pack || !user?.email) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/credits/squad-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packId, currency: 'NGN' }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Payment error: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn btn-primary w-full ${className || ''}`}
      style={{ height: 52, fontSize: 14, fontWeight: 700 }}
    >
      {loading ? 'Processing…' : '💳 Pay with Squad'}
    </button>
  );
}
