import type { Currency } from '../types';

export function detectCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lang = navigator.language;
    const nigerianTimezones = ['Africa/Lagos', 'Africa/Abuja'];
    const nigerianLocales = ['en-NG', 'ha', 'yo', 'ig'];
    if (nigerianTimezones.includes(tz) || nigerianLocales.some(l => lang.startsWith(l))) {
      return 'NGN';
    }
    return 'USD';
  } catch {
    return 'NGN'; // default to NGN if detection fails
  }
}

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'NGN') return `₦${amount.toLocaleString('en-NG')}`;
  return `$${amount}`;
}
