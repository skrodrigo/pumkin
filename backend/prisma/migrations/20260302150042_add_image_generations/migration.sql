-- CreateTable
CREATE TABLE "image_generations" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_generations_chatId_idx" ON "image_generations"("chatId");

-- CreateIndex
CREATE INDEX "image_generations_userId_idx" ON "image_generations"("userId");

-- CreateIndex
CREATE INDEX "image_generations_status_idx" ON "image_generations"("status");
