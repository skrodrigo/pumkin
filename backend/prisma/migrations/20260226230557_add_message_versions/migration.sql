-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "pinnedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "message_versions" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "message_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_versions_messageId_idx" ON "message_versions"("messageId");

-- AddForeignKey
ALTER TABLE "message_versions" ADD CONSTRAINT "message_versions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
