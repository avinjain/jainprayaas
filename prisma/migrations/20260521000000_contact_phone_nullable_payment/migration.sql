-- Allow biodata submission without an upfront payment screenshot
ALTER TABLE "submissions" ALTER COLUMN "payment_screenshot_key" DROP NOT NULL;

-- Admin-configurable contact phone shown on submission success
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;
