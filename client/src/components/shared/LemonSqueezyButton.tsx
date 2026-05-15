import React from 'react';
import { PackId, CREDIT_PACKS } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface LemonSqueezyButtonProps {
  packId: PackId;
  className?: string;
}

// Replace with actual LemonSqueezy checkout links
const LEMON_LINKS: Record<string, string> = {
  starter: 'https://harvestai.lemonsqueezy.com/checkout/buy/STARTER_ID',
  pro:     'https://harvestai.lemonsqueezy.com/checkout/buy/PRO_ID',
  power:   'https://harvestai.lemonsqueezy.com/checkout/buy/POWER_ID',
};

export function LemonSqueezyButton({ packId, className }: LemonSqueezyButtonProps) {
  const user = useAuthStore(s => s.user);
  const pack = CREDIT_PACKS.find(p => p.id === packId);

  const handleClick = () => {
    if (!pack) return;
    const base = LEMON_LINKS[packId];
    if (!base) return;
    
    // Pass user email to LemonSqueezy to auto-fill
    const url = new URL(base);
    if (user?.email) {
      url.searchParams.set('checkout[email]', user.email);
    }
    window.open(url.toString(), '_blank', 'noopener');
  };

  return (
    <button 
      onClick={handleClick} 
      className={`btn btn-secondary w-full ${className || ''}`}
      style={{ height: 52, fontSize: 14, fontWeight: 700, background: '#FFC233', color: '#000' }}
    >
      🍋 Pay with LemonSqueezy
    </button>
  );
}
