import { pgTable, varchar, integer, timestamp, text, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

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
  totalCredits: integer('total_credits').default(0), // Total ever purchased
  totalJobs: integer('total_jobs').default(0),
  platformRole: varchar('platform_role', { length: 20 }), // 'super_admin' | 'admin' | 'editor' | null
  notificationsEmail: boolean('notifications_email').default(true),
  notificationsJobComplete: boolean('notifications_job_complete').default(true),
  defaultMode: varchar('default_mode', { length: 20 }).default('leads'),
  defaultMaxResults: integer('default_max_results').default(25),
  defaultSources: jsonb('default_sources').default(['vconnect', 'google_maps']),
  apiKey: varchar('api_key', { length: 64 }).unique(),
  apiKeyCreatedAt: timestamp('api_key_created_at'),
  timezone: varchar('timezone', { length: 60 }).default('Africa/Lagos'),
  webhookUrl: text('webhook_url'),
  webhookSecret: varchar('webhook_secret', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Harvest jobs — one record per user-initiated scrape job
export const harvestJobs = pgTable('harvest_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
  mode: varchar('mode', { length: 30 }).notNull(), // 'leads' | 'extract' | 'bulk_csv' | 'serp' | 'sitemap' | 'email_finder' | 'price_check' | 'enrich'

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
  shareToken: varchar('share_token', { length: 32 }).unique(),
  isShared: boolean('is_shared').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const jobTemplates = pgTable('job_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  mode: varchar('mode', { length: 20 }).notNull(),
  inputData: jsonb('input_data').notNull(),
  useCount: integer('use_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
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
  metadata: jsonb('metadata'),                          // Store plan details, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const scheduledJobs = pgTable('scheduled_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  mode: varchar('mode', { length: 30 }).notNull(),
  inputData: jsonb('input_data').notNull(),
  schedule: varchar('schedule', { length: 20 }).notNull(), // 'hourly' | 'daily' | 'weekly' | 'monthly'
  isActive: boolean('is_active').default(true),
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  runCount: integer('run_count').default(0),
  lastJobId: uuid('last_job_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const priceHistory = pgTable('price_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
  url: text('url').notNull(),
  productName: text('product_name'),
  price: varchar('price', { length: 100 }),
  currency: varchar('currency', { length: 10 }),
  availability: varchar('availability', { length: 50 }),
  scrapedAt: timestamp('scraped_at').defaultNow(),
});

export const blogComments = pgTable('blog_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postSlug: varchar('post_slug', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  content: text('content').notNull(),
  approved: boolean('approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailLog = pgTable('email_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 128 }),
  site: varchar('site', { length: 50 }).notNull(),
  flow: varchar('flow', { length: 50 }).notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
});

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  author: varchar('author', { length: 255 }).notNull().default('HarvestAI Team'),
  tags: jsonb('tags').$type<string[]>().default([]),
  readingTime: integer('reading_time').default(5),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
