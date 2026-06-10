// HTML email templates — HarvestAI brand (amber #f59e0b)

const B = {
  name: 'HarvestAI',
  color1: '#f59e0b',
  color2: '#d97706',
  site: 'harvestai.com.ng',
  dash: 'https://harvestai.com.ng',
  support: 'support@harvestai.com.ng',
};

function wrap(preview: string, title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preview)}&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb;min-height:100vh;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(245,158,11,.1);">
  <tr><td style="background:linear-gradient(135deg,${B.color1} 0%,${B.color2} 100%);padding:28px 36px 24px;">
    <span style="display:inline-block;background:rgba(255,255,255,.2);border-radius:9px;padding:5px 10px;font-size:18px;font-weight:800;color:#1c1917;letter-spacing:-.2px;">H</span>
    <span style="margin-left:8px;font-size:16px;font-weight:700;color:#1c1917;">${B.name}</span>
  </td></tr>
  <tr><td style="padding:36px 36px 28px;">${body}</td></tr>
  <tr><td style="padding:20px 36px 28px;border-top:1px solid #fef3c7;">
    <p style="margin:0 0 6px;font-size:11.5px;color:#6b7280;line-height:1.6;">You have an account with ${B.name}. Questions? <a href="mailto:${B.support}" style="color:${B.color2};text-decoration:none;">${B.support}</a></p>
    <p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 TrueWeb Solutions Ltd · ${B.name} · Lagos, Nigeria</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function h1(t: string) { return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-.4px;line-height:1.3;">${t}</h1>`; }
function p(t: string, muted?: boolean) { return `<p style="margin:0 0 16px;font-size:15px;color:${muted ? '#6b7280' : '#374151'};line-height:1.7;">${t}</p>`; }
function btn(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border-radius:9px;background:linear-gradient(135deg,${B.color1},${B.color2});"><a href="${href}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#1c1917;text-decoration:none;border-radius:9px;">${label}</a></td></tr></table>`;
}
function divider() { return `<hr style="border:none;border-top:1px solid #fef3c7;margin:24px 0;">`; }

export function welcomeTemplate(name: string | undefined, dashboardUrl: string): string {
  return wrap(`Welcome to HarvestAI${name ? `, ${name}` : ''}!`, 'Welcome to HarvestAI',
    h1(`Welcome${name ? `, ${name}` : ''}! 🎉`) +
    p(`Your HarvestAI account is live. Extract B2B contacts, supplier details, and market data from any Nigerian website in seconds.`) +
    btn(dashboardUrl, 'Start harvesting →') +
    p(`Questions? Visit <a href="https://${B.site}/docs" style="color:${B.color2};">${B.site}/docs</a> or reply to this email.`, true)
  );
}

export function verifyEmailTemplate(name: string | undefined, otp: string): string {
  return wrap(`Your HarvestAI code: ${otp}`, 'Verify your email',
    h1('Verify your email') +
    p(`${name ? `Hi ${name}. ` : ''}Your verification code — valid for 10 minutes:`) +
    `<div style="margin:24px 0;text-align:center;"><span style="display:inline-block;background:#fffbeb;border:2px solid ${B.color1};border-radius:12px;padding:18px 36px;font-size:34px;font-weight:800;letter-spacing:10px;color:${B.color2};">${esc(otp)}</span></div>` +
    p(`Didn't create an account? Ignore this email.`, true)
  );
}

export function passwordResetTemplate(name: string | undefined, resetUrl: string): string {
  return wrap('Reset your HarvestAI password', 'Password reset',
    h1('Reset your password') +
    p(`${name ? `Hi ${name}. ` : ''}This link expires in 30 minutes.`) +
    btn(resetUrl, 'Reset password →') +
    p(`Didn't request a reset? No action needed.`, true)
  );
}

export function paymentSuccessTemplate(opts: { name?: string; credits?: number; pack?: string; amountNgn: number; txRef: string }): string {
  const amount = (opts.amountNgn / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  return wrap(`Payment confirmed — ₦${amount}`, 'Payment confirmed',
    h1('Payment confirmed ✅') +
    p(`${opts.name ? `Hi ${opts.name}. ` : ''}Your payment of <strong>₦${amount}</strong> was successful${opts.credits ? ` and <strong>${opts.credits} harvests</strong> have been added` : ''}.`) +
    `<div style="margin:20px 0;padding:14px 18px;background:#fffbeb;border-radius:10px;border-left:3px solid ${B.color1};"><p style="margin:0 0 3px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Transaction ref</p><p style="margin:0;font-size:13px;font-weight:600;color:#111827;font-family:monospace;">${esc(opts.txRef)}</p></div>` +
    btn(B.dash, 'Start harvesting →')
  );
}

export function paymentFailedTemplate(opts: { name?: string; retryUrl: string }): string {
  return wrap('Payment failed — action needed', 'Payment failed',
    h1('Payment failed ⚠️') +
    p(`${opts.name ? `Hi ${opts.name}. ` : ''}We couldn't process your payment. Check your card details and try again.`) +
    btn(opts.retryUrl, 'Try again →')
  );
}

export function subscriptionRenewedTemplate(opts: { name?: string; pack: string; amountNgn: number; nextDate: string }): string {
  const amount = (opts.amountNgn / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  return wrap('Your HarvestAI plan renewed', 'Plan renewed',
    h1('Plan renewed ✅') +
    p(`Your <strong>${esc(opts.pack)}</strong> pack renewed for ₦${amount}. Next renewal: <strong>${esc(opts.nextDate)}</strong>.`) +
    btn(B.dash, 'View account →')
  );
}

export function subscriptionCancelledTemplate(opts: { name?: string; accessUntil: string; reactivateUrl: string }): string {
  return wrap('Your HarvestAI subscription cancelled', 'Subscription cancelled',
    h1('Subscription cancelled') +
    p(`Your subscription was cancelled. You'll keep access until <strong>${esc(opts.accessUntil)}</strong>.`) +
    btn(opts.reactivateUrl, 'Reactivate →')
  );
}

export function refundIssuedTemplate(opts: { name?: string; amountNgn: number; txRef: string; arrivalDays?: number }): string {
  const amount = (opts.amountNgn / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  const days = opts.arrivalDays ?? 7;
  return wrap(`Refund of ₦${amount} on its way`, 'Refund issued',
    h1('Refund issued 🟡') +
    p(`A refund of <strong>₦${amount}</strong> has been processed. Expect it within ${days} business days.`) +
    `<div style="margin:16px 0;padding:14px 18px;background:#fffbeb;border-radius:10px;border-left:3px solid ${B.color1};"><p style="margin:0 0 3px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">Original transaction ref</p><p style="margin:0;font-size:13px;font-weight:600;font-family:monospace;color:#111827;">${esc(opts.txRef)}</p></div>` +
    p(`Contact <a href="mailto:${B.support}" style="color:${B.color2};">${B.support}</a> if you don't receive it after ${days} days.`, true)
  );
}

export function accountDeletedTemplate(opts: { name?: string; graceDays?: number }): string {
  const days = opts.graceDays ?? 30;
  return wrap('Your HarvestAI account has been deleted', 'Account deleted',
    h1('Account deleted') +
    p(`Your account data is scheduled for permanent deletion in <strong>${days} days</strong>.`) +
    p(`Email <a href="mailto:${B.support}" style="color:${B.color2};">${B.support}</a> within ${days} days to recover your account.`, true)
  );
}

export function weeklyDigestTemplate(opts: { name?: string; stats: { harvests: number; contactsFound: number; exportsRun: number }; weekEnding: string }): string {
  return wrap(`HarvestAI weekly summary — ${opts.weekEnding}`, 'Weekly digest',
    h1(`Week of ${esc(opts.weekEnding)}`) +
    p(`${opts.name ? `Hi ${opts.name}. ` : ''}Your HarvestAI stats for the week:`) +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
      <tr>
        <td style="width:30%;padding:12px 14px;background:#fffbeb;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${B.color2};">${opts.stats.harvests}</div>
          <div style="font-size:11.5px;color:#6b7280;margin-top:3px;">Harvests run</div>
        </td>
        <td style="width:4%;"></td>
        <td style="width:30%;padding:12px 14px;background:#fffbeb;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${B.color2};">${opts.stats.contactsFound}</div>
          <div style="font-size:11.5px;color:#6b7280;margin-top:3px;">Contacts found</div>
        </td>
        <td style="width:4%;"></td>
        <td style="width:30%;padding:12px 14px;background:#fffbeb;border-radius:8px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${B.color2};">${opts.stats.exportsRun}</div>
          <div style="font-size:11.5px;color:#6b7280;margin-top:3px;">CSV exports</div>
        </td>
      </tr>
    </table>` +
    btn(B.dash, 'View full analytics →')
  );
}

export function lowCreditTemplate(opts: { name?: string; remaining: number; upgradeUrl: string }): string {
  return wrap('Your HarvestAI credits are running low', 'Low credits',
    h1('Credits running low ⚠️') +
    p(`${opts.name ? `Hi ${opts.name}. ` : ''}Only <strong>${opts.remaining} harvests</strong> remaining. Top up to keep extracting leads.`) +
    btn(opts.upgradeUrl, 'Top up now →') +
    p(`Starter: 100 harvests for ₦3,500. Pro: 300 for ₦8,500.`, true)
  );
}

export function onboardingDay1Template(name: string | undefined): string {
  return wrap('Your first harvest in 2 minutes', 'Get started with HarvestAI',
    h1('Harvest your first leads in 2 minutes') +
    p(`${name ? `Hi ${name}. ` : ''}Paste any Nigerian business directory URL and HarvestAI extracts names, emails, phones, and addresses automatically.`) +
    `<ol style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
      <li>Open the Harvest tab in your dashboard</li>
      <li>Paste a URL (try <strong>vconnect.com</strong> or <strong>google.com/maps</strong>)</li>
      <li>Click "Harvest" — results in under 60 seconds</li>
      <li>Export to CSV or push to your CRM</li>
    </ol>` +
    btn(`${B.dash}/harvest`, 'Start my first harvest →')
  );
}

export function onboardingDay3Template(name: string | undefined): string {
  return wrap('Did you know? HarvestAI exports to CSV + CRM', 'Export to anywhere',
    h1('Export to CSV, CRM, or Zapier') +
    p(`${name ? `Hi ${name}. ` : ''}HarvestAI doesn't just extract — it connects:`) +
    `<ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
      <li><strong>CSV download</strong> — import into Excel, Google Sheets</li>
      <li><strong>Zapier</strong> — push directly to HubSpot, Pipedrive, Salesforce</li>
      <li><strong>API</strong> — pull results into your own system</li>
    </ul>` +
    btn(B.dash, 'Connect my CRM →')
  );
}

export function onboardingDay5Template(name: string | undefined): string {
  return wrap('How Emeka found 200 restaurant buyers in one afternoon', 'Customer story',
    h1('"200 restaurant buyers in one afternoon"') +
    p(`${name ? `Hi ${name}. ` : ''}Emeka runs a Lagos-based food distributor. His sales team used to spend 2 weeks manually researching restaurant contacts.`) +
    divider() +
    p(`<em>"HarvestAI found 200 verified contacts in VConnect in one afternoon. We hit our monthly target in 3 days."</em>`) +
    p(`— Emeka O., Sales Director`, true) +
    divider() +
    btn(B.dash, 'Start harvesting →')
  );
}

export function onboardingDay7Template(name: string | undefined): string {
  return wrap("Let's do a quick harvest together", 'Quick demo?',
    h1('Want a live demo of HarvestAI?') +
    p(`${name ? `Hi ${name}. ` : ''}Book 15 minutes and we'll run a harvest on a URL of your choice — live, together.`) +
    btn('https://calendly.com/trueweb-solutions/harvestai-onboarding', 'Book 15 minutes →') +
    p(`Can't find a slot? Reply to this email.`, true)
  );
}

export function reengageDay14Template(name: string | undefined, lastFeature?: string): string {
  return wrap('We miss you — come back to HarvestAI', 'Miss you',
    h1(`${name ? `${name}, your` : 'Your'} leads are waiting 👋`) +
    p(`It's been 2 weeks since you last harvested. Your competitors are already building their lists.`) +
    (lastFeature ? p(`Last time you were using: <strong>${esc(lastFeature)}</strong>`) : '') +
    btn(B.dash, 'Start harvesting →')
  );
}

export function reengageDay21Template(name: string | undefined): string {
  return wrap("Here's what's new in HarvestAI", "What's new",
    h1("Here's what we've shipped") +
    `<ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
      <li><strong>Google Maps extraction</strong> — harvest from local search results</li>
      <li><strong>Email verification</strong> — check if addresses are valid before export</li>
      <li><strong>Scheduled harvests</strong> — run automatically on a schedule</li>
    </ul>` +
    btn(B.dash, 'Try the new features →')
  );
}

export function reengageDay28Template(name: string | undefined, unsubUrl: string): string {
  return wrap('Stay or go — your call', 'Stay connected?',
    h1('No pressure') +
    p(`${name ? `Hi ${name}. ` : ''}If HarvestAI isn't right for you right now, that's okay.`) +
    btn(B.dash, "I'm still here →") +
    p(`Or <a href="${unsubUrl}" style="color:#9ca3af;">unsubscribe from marketing emails</a>.`, true)
  );
}

export function newsletterConfirmTemplate(confirmUrl: string): string {
  return wrap('Confirm your HarvestAI newsletter', 'Confirm subscription',
    h1('One click to confirm') +
    p(`You signed up for the HarvestAI newsletter — B2B lead generation tips and Nigerian market insights.`) +
    btn(confirmUrl, 'Confirm subscription →') +
    p(`Didn't sign up? Ignore this email.`, true)
  );
}

export function newsletterWelcomeTemplate(): string {
  return wrap("You're subscribed to HarvestAI updates", 'Newsletter welcome',
    h1("You're in! 📬") +
    p(`Expect weekly B2B lead generation tactics, Nigerian market data tips, and HarvestAI product updates.`)
  );
}
