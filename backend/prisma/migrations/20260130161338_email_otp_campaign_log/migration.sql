-- CreateTable
CREATE TABLE "email_otp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaign_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_campaign_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_otp_email_idx" ON "email_otp"("email");

-- CreateIndex
CREATE INDEX "email_otp_expiresAt_idx" ON "email_otp"("expiresAt");

-- CreateIndex
CREATE INDEX "email_campaign_log_campaignKey_idx" ON "email_campaign_log"("campaignKey");

-- CreateIndex
CREATE UNIQUE INDEX "email_campaign_log_userId_campaignKey_key" ON "email_campaign_log"("userId", "campaignKey");

-- AddForeignKey
ALTER TABLE "email_campaign_log" ADD CONSTRAINT "email_campaign_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
