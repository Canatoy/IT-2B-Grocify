CREATE TABLE "grocery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"purchased" boolean DEFAULT false NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"updated_at" bigint NOT NULL,
	"estimated_price" real,
	"total_price" real
);
