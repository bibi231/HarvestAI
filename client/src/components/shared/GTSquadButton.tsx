import React from 'react';
import { PackId, CREDIT_PACKS } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface GTSquadButtonProps {
  packId: PackId;
  className?: string;
}

// Replace with actual GTSquad checkout links from app.gtsquad.co > Products
const GTSQUAD_LINKS: Record<string, string> = {
  starter: 'https://app.gtsquad.co/checkout/HARVESTAI_STARTER', 
  pro:     'https://app.gtsquad.co/checkout/HARVESTAI_PRO',
  power:   'https://app.gtsquad.co/checkout/HARVESTAI_POWER',
};

export function GTSquadButton({ packId, className }: GTSquadButtonProps) {
  const user = useAuthStore(s => s.user);
  const pack = CREDIT_PACKS.find(p => p.id === packId);

  const handleClick = () => {
    if (!pack) return;
    const base = GTSQUAD_LINKS[packId];
    if (!base) return;
    const url = user?.email ? `${base}?email=${encodeURIComponent(user.email)}` : base;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <button 
      onClick={handleClick} 
      className={`btn btn-primary w-full ${className || ''}`}
      style={{ height: 52, fontSize: 14, fontWeight: 700 }}
    >
      💳 Pay with GTSquad
    </button>
  );
}
