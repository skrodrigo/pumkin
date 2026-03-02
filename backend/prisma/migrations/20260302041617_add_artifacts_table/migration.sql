-- CreateTable
CREATE TABLE "artifacts" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "artifacts_chatId_idx" ON "artifacts"("chatId");

-- CreateIndex
CREATE INDEX "artifacts_messageId_idx" ON "artifacts"("messageId");

-- CreateIndex
CREATE INDEX "artifacts_status_idx" ON "artifacts"("status");

-- AddForeignKey
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
