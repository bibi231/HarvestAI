import crypto from 'crypto';

export async function deliverWebhook(
  webhookUrl: string,
  secret: string | null,
  jobId: string,
  mode: string,
  resultData: unknown[],
  resultCount: number,
): Promise<void> {
  const payload = JSON.stringify({
    event: 'harvest.complete',
    jobId,
    mode,
    resultCount,
    data: resultData,
    timestamp: new Date().toISOString(),
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'HarvestAI-Webhook/1.0',
  };

  // HMAC signature if secret provided
  if (secret) {
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    headers['X-HarvestAI-Signature'] = `sha256=${sig}`;
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: payload,
    signal: AbortSignal.timeout(15000),
  });
}
