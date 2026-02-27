-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "activeBranchId" TEXT;

-- CreateTable
CREATE TABLE "chat_branches" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "parentBranchId" TEXT,
    "forkMessageId" TEXT,
    "forkVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_branch_messages" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "messageVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_branch_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_branches_chatId_idx" ON "chat_branches"("chatId");

-- CreateIndex
CREATE INDEX "chat_branches_parentBranchId_idx" ON "chat_branches"("parentBranchId");

-- CreateIndex
CREATE INDEX "chat_branches_forkMessageId_idx" ON "chat_branches"("forkMessageId");

-- CreateIndex
CREATE INDEX "chat_branch_messages_branchId_idx" ON "chat_branch_messages"("branchId");

-- CreateIndex
CREATE INDEX "chat_branch_messages_messageId_idx" ON "chat_branch_messages"("messageId");

-- CreateIndex
CREATE INDEX "chat_branch_messages_messageVersionId_idx" ON "chat_branch_messages"("messageVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_branch_messages_branchId_position_key" ON "chat_branch_messages"("branchId", "position");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_activeBranchId_fkey" FOREIGN KEY ("activeBranchId") REFERENCES "chat_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_branches" ADD CONSTRAINT "chat_branches_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_branches" ADD CONSTRAINT "chat_branches_parentBranchId_fkey" FOREIGN KEY ("parentBranchId") REFERENCES "chat_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_branch_messages" ADD CONSTRAINT "chat_branch_messages_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "chat_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_branch_messages" ADD CONSTRAINT "chat_branch_messages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_branch_messages" ADD CONSTRAINT "chat_branch_messages_messageVersionId_fkey" FOREIGN KEY ("messageVersionId") REFERENCES "message_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
