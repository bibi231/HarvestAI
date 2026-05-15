import React from 'react';
import { 
  Search, 
  Zap, 
  Check, 
  Globe, 
  CreditCard, 
  Target, 
  Database, 
  ExternalLink, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  LayoutGrid,
  Settings,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const icons = {
  search: Search,
  zap: Zap,
  check: Check,
  globe: Globe,
  creditCard: CreditCard,
  target: Target,
  database: Database,
  externalLink: ExternalLink,
  loader: Loader2,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  chevronRight: ChevronRight,
  trendingUp: TrendingUp,
  shieldCheck: ShieldCheck,
  layoutGrid: LayoutGrid,
  settings: Settings,
  logOut: LogOut,
  moon: Moon,
  sun: Sun
};

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 20 }: IconProps) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  
  return <LucideIcon className={cn(className)} size={size} />;
}
