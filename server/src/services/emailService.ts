import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendJobCompleteEmail(
  to: string,
  jobId: string,
  mode: string,
  resultCount: number,
  shareUrl: string,
): Promise<void> {
  if (!process.env.SMTP_USER) return; // silently skip if not configured

  const modeLabel: Record<string, string> = {
    leads: 'Lead Finder',
    extract: 'Data Extractor',
    serp: 'Google Search',
    sitemap: 'Sitemap Crawler',
    email_finder: 'Email Finder',
    price_check: 'Price Monitor',
    bulk_csv: 'Bulk URL',
    enrich: 'Data Enrichment',
  };

  await transporter.sendMail({
    from: `HarvestAI <${process.env.SMTP_USER}>`,
    to,
    subject: `✅ Your ${modeLabel[mode] ?? mode} harvest is ready — ${resultCount} rows`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="margin:0 0 8px">Your harvest is complete 🌾</h2>
        <p style="color:#666">Your <strong>${modeLabel[mode] ?? mode}</strong> job returned <strong>${resultCount} rows</strong> of data.</p>
        <a href="${process.env.CLIENT_URL}/results/${jobId}" style="display:inline-block;background:#f5a623;color:#100800;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin:20px 0;">
          View & Download Results →
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">You're receiving this because job completion emails are enabled in your HarvestAI settings.</p>
      </div>
    `,
  });
}
