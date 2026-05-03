CREATE TABLE "recipe_folders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_folders_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "saved_recipes" ADD COLUMN "folder_id" uuid;--> statement-breakpoint
ALTER TABLE "recipe_folders" ADD CONSTRAINT "recipe_folders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_folder_id_recipe_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."recipe_folders"("id") ON DELETE set null ON UPDATE no action;