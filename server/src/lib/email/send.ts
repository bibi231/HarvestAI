import { randomUUID } from 'crypto';
import { getResend } from './client.js';
import { db } from '../../db/index.js';
import { emailLog } from '../../db/schema.js';
import { and, eq, gte } from 'drizzle-orm';

const SITE = 'harvestai';
const FROM = process.env.EMAIL_FROM || 'HarvestAI <hello@harvestai.com.ng>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@harvestai.com.ng';

type Flow =
  | 'welcome' | 'verify_email' | 'password_reset'
  | 'payment_success' | 'payment_failed'
  | 'subscription_renewed' | 'subscription_cancelled'
  | 'refund_issued' | 'account_deleted'
  | 'weekly_digest' | 'low_credit_warning'
  | 'onboarding_day1' | 'onboarding_day3' | 'onboarding_day5' | 'onboarding_day7'
  | 'reengage_day14' | 'reengage_day21' | 'reengage_day28'
  | 'newsletter_confirm' | 'newsletter_welcome';

async function sendEmail(opts: {
  userId?: string;
  flow: Flow;
  to: string;
  subject: string;
  html: string;
  skipDedup?: boolean;
}): Promise<void> {
  try {
    if (!opts.skipDedup && opts.userId) {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000);
      const [recent] = await db.select().from(emailLog)
        .where(and(eq(emailLog.userId, opts.userId), eq(emailLog.flow, opts.flow), gte(emailLog.sentAt, cutoff)))
        .limit(1);
      if (recent) return;
    }

    const resend = getResend();
    const sendId = randomUUID();

    const result = await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      headers: {
        'X-TrueWeb-Site': SITE,
        'X-TrueWeb-Flow': opts.flow,
        'X-TrueWeb-ID': sendId,
      },
    });

    if (result.error) {
      console.error(`[email] ${SITE}/${opts.flow} failed:`, result.error);
      return;
    }

    if (opts.userId) {
      await db.insert(emailLog).values({ userId: opts.userId, site: SITE, flow: opts.flow, sentAt: new Date() });
    }
  } catch (err) {
    console.error(`[email] ${SITE}/${opts.flow} error:`, err);
  }
}

export async function sendWelcomeEmail(userId: string, to: string, name: string | undefined, dashboardUrl: string) {
  const { welcomeTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'welcome', to, subject: 'Welcome to HarvestAI!', html: welcomeTemplate(name, dashboardUrl) });
}

export async function sendPaymentSuccessEmail(userId: string, to: string, opts: { name?: string; credits?: number; pack?: string; amountNgn: number; txRef: string }) {
  const { paymentSuccessTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'payment_success', to, subject: `Payment confirmed — ₦${(opts.amountNgn / 100).toLocaleString()}`, html: paymentSuccessTemplate(opts), skipDedup: true });
}

export async function sendPaymentFailedEmail(userId: string, to: string, opts: { name?: string; retryUrl: string }) {
  const { paymentFailedTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'payment_failed', to, subject: 'Payment failed — action needed', html: paymentFailedTemplate(opts) });
}

export async function sendPasswordResetEmail(userId: string, to: string, name: string | undefined, resetUrl: string) {
  const { passwordResetTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'password_reset', to, subject: 'Reset your HarvestAI password', html: passwordResetTemplate(name, resetUrl), skipDedup: true });
}

export async function sendVerifyEmail(userId: string, to: string, name: string | undefined, otp: string) {
  const { verifyEmailTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'verify_email', to, subject: `Your HarvestAI code: ${otp}`, html: verifyEmailTemplate(name, otp), skipDedup: true });
}

export async function sendLowCreditWarningEmail(userId: string, to: string, opts: { name?: string; remaining: number; upgradeUrl: string }) {
  const { lowCreditTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'low_credit_warning', to, subject: 'Your HarvestAI credits are running low', html: lowCreditTemplate(opts) });
}

export async function sendWeeklyDigestEmail(userId: string, to: string, opts: { name?: string; stats: { harvests: number; contactsFound: number; exportsRun: number }; weekEnding: string }) {
  const { weeklyDigestTemplate } = await import('./templates.js');
  return sendEmail({ userId, flow: 'weekly_digest', to, subject: `Your HarvestAI summary — ${opts.weekEnding}`, html: weeklyDigestTemplate(opts) });
}

export async function sendOnboardingEmail(userId: string, to: string, day: 1 | 3 | 5 | 7, name?: string) {
  const t = await import('./templates.js');
  const map = {
    1: { fn: () => t.onboardingDay1Template(name), subject: 'Your first harvest in 2 minutes', flow: 'onboarding_day1' as Flow },
    3: { fn: () => t.onboardingDay3Template(name), subject: 'Export to CSV, CRM, or Zapier', flow: 'onboarding_day3' as Flow },
    5: { fn: () => t.onboardingDay5Template(name), subject: '200 restaurant buyers in one afternoon', flow: 'onboarding_day5' as Flow },
    7: { fn: () => t.onboardingDay7Template(name), subject: "Let's do a quick harvest together", flow: 'onboarding_day7' as Flow },
  };
  const { fn, subject, flow } = map[day];
  return sendEmail({ userId, flow, to, subject, html: fn() });
}

export async function sendReengageEmail(userId: string, to: string, day: 14 | 21 | 28, opts: { name?: string; lastFeature?: string; unsubUrl?: string }) {
  const t = await import('./templates.js');
  const unsubUrl = opts.unsubUrl ?? `https://harvestai.com.ng/unsubscribe?uid=${userId}`;
  const map = {
    14: { fn: () => t.reengageDay14Template(opts.name, opts.lastFeature), subject: 'Your leads are waiting — come back to HarvestAI', flow: 'reengage_day14' as Flow },
    21: { fn: () => t.reengageDay21Template(opts.name), subject: "Here's what's new in HarvestAI", flow: 'reengage_day21' as Flow },
    28: { fn: () => t.reengageDay28Template(opts.name, unsubUrl), subject: "Stay or go — your call", flow: 'reengage_day28' as Flow },
  };
  const { fn, subject, flow } = map[day];
  return sendEmail({ userId, flow, to, subject, html: fn() });
}

export async function sendNewsletterConfirmEmail(to: string, confirmUrl: string) {
  const { newsletterConfirmTemplate } = await import('./templates.js');
  return sendEmail({ flow: 'newsletter_confirm', to, subject: 'Confirm your HarvestAI newsletter subscription', html: newsletterConfirmTemplate(confirmUrl), skipDedup: true });
}
