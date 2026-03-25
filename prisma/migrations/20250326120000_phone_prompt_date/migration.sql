-- Track when a legacy user dismissed the "add phone" dialog (once per calendar day reminder)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "last_phone_prompt_date" DATE;
