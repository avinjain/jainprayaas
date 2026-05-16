-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "submission_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "biodata_file_key" TEXT NOT NULL,
    "payment_screenshot_key" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL,
    "payment_qr_file_key" TEXT,
    "whatsapp_qr_file_key" TEXT,
    "upiId" TEXT,
    "registration_fee_inr" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submissions_submission_code_key" ON "submissions"("submission_code");

-- CreateIndex
CREATE INDEX "submissions_mobile_number_idx" ON "submissions"("mobile_number");

-- CreateIndex
CREATE INDEX "submissions_full_name_idx" ON "submissions"("full_name");

-- CreateIndex
CREATE INDEX "submissions_payment_status_idx" ON "submissions"("payment_status");

-- CreateIndex
CREATE INDEX "submissions_created_at_idx" ON "submissions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");
