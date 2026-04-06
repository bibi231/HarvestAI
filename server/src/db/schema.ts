import { pgTable, varchar, integer, timestamp, text, uuid, jsonb } from 'drizzle-orm/pg-core';

// Users — synced from Firebase on first login
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),         // Firebase UID
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  photoUrl: text('photo_url'),
  currency: varchar('currency', { length: 3 }).default('NGN'), // 'NGN' | 'USD'
  freeCreditsUsed: integer('free_credits_used').default(0),
  freeCreditsResetAt: timestamp('free_credits_reset_at'),
  paidCredits: integer('paid_credits').default(0),
  totalJobs: integer('total_jobs').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Harvest jobs — one record per user-initiated scrape job
export const harvestJobs = pgTable('harvest_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
  mode: varchar('mode', { length: 20 }).notNull(), // 'leads' | 'extract'

  // Input data stored as JSON
  inputData: jsonb('input_data').notNull(),
  // For leads: { businessType, location, sources, maxResults }
  // For extract: { urls: string[], instruction: string }

  status: varchar('status', { length: 20 }).default('pending'),
  // 'pending' | 'running' | 'done' | 'failed'

  progress: integer('progress').default(0),            // 0-100
  progressMessage: text('progress_message'),           // e.g. "Scraping VConnect..."
  resultData: jsonb('result_data'),                    // array of extracted rows
  resultCount: integer('result_count').default(0),
  creditsUsed: integer('credits_used').default(0),
  errorMessage: text('error_message'),

  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Payments — Paystack (NGN) and Stripe (USD)
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
  provider: varchar('provider', { length: 20 }).notNull(), // 'paystack' | 'stripe'
  externalRef: varchar('external_ref', { length: 255 }).unique(), // Paystack ref or Stripe session ID
  amountMinor: integer('amount_minor').notNull(),       // kobo (NGN) or cents (USD)
  currency: varchar('currency', { length: 3 }).notNull(),
  credits: integer('credits').notNull(),
  pack: varchar('pack', { length: 20 }).notNull(),      // 'starter' | 'pro' | 'power'
  status: varchar('status', { length: 20 }).default('pending'), // 'pending' | 'success' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
});
