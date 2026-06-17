CREATE TYPE "subscription_status" AS ENUM('trialing', 'active', 'canceled');--> statement-breakpoint
CREATE TYPE "workspace_user_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"email" text UNIQUE,
	"password" text,
	"reset_password_token" text,
	"reset_password_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"color" text DEFAULT 'gray' NOT NULL,
	"client_id" uuid,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" text UNIQUE,
	"account_id" uuid,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "sessions_pkey" PRIMARY KEY("token","account_id")
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY,
	"description" text,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"project_id" uuid,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workspace_users" (
	"id" uuid NOT NULL,
	"account_id" uuid,
	"workspace_id" uuid,
	"role" "workspace_user_role" DEFAULT 'member'::"workspace_user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workspace_users_pkey" PRIMARY KEY("account_id","workspace_id")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"stripe_customer_id" text UNIQUE,
	"stripe_subscription_id" text UNIQUE,
	"subscription_status" "subscription_status" DEFAULT 'trialing'::"subscription_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");--> statement-breakpoint
ALTER TABLE "workspace_users" ADD CONSTRAINT "workspace_users_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");--> statement-breakpoint
ALTER TABLE "workspace_users" ADD CONSTRAINT "workspace_users_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id");