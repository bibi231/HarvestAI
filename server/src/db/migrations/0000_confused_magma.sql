CREATE TABLE IF NOT EXISTS "harvest_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128),
	"mode" varchar(30) NOT NULL,
	"input_data" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"progress_message" text,
	"result_data" jsonb,
	"result_count" integer DEFAULT 0,
	"credits_used" integer DEFAULT 0,
	"error_message" text,
	"share_token" varchar(32),
	"is_shared" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	CONSTRAINT "harvest_jobs_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128),
	"name" varchar(100) NOT NULL,
	"mode" varchar(20) NOT NULL,
	"input_data" jsonb NOT NULL,
	"use_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128),
	"provider" varchar(20) NOT NULL,
	"external_ref" varchar(255),
	"amount_minor" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"credits" integer NOT NULL,
	"pack" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_external_ref_unique" UNIQUE("external_ref")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128),
	"url" text NOT NULL,
	"product_name" text,
	"price" varchar(100),
	"currency" varchar(10),
	"availability" varchar(50),
	"scraped_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheduled_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128),
	"name" varchar(100) NOT NULL,
	"mode" varchar(30) NOT NULL,
	"input_data" jsonb NOT NULL,
	"schedule" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"run_count" integer DEFAULT 0,
	"last_job_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"photo_url" text,
	"currency" varchar(3) DEFAULT 'NGN',
	"free_credits_used" integer DEFAULT 0,
	"free_credits_reset_at" timestamp,
	"paid_credits" integer DEFAULT 0,
	"total_credits" integer DEFAULT 0,
	"total_jobs" integer DEFAULT 0,
	"notifications_email" boolean DEFAULT true,
	"notifications_job_complete" boolean DEFAULT true,
	"default_mode" varchar(20) DEFAULT 'leads',
	"default_max_results" integer DEFAULT 25,
	"default_sources" jsonb DEFAULT '["vconnect","google_maps"]'::jsonb,
	"api_key" varchar(64),
	"api_key_created_at" timestamp,
	"timezone" varchar(60) DEFAULT 'Africa/Lagos',
	"webhook_url" text,
	"webhook_secret" varchar(64),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "harvest_jobs" ADD CONSTRAINT "harvest_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_templates" ADD CONSTRAINT "job_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_history" ADD CONSTRAINT "price_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
