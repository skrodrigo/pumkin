import { prisma } from './../common/prisma.js';
import { Prisma } from './../generated/prisma/client.js';

type BranchVersionOption = {
  branchId: string;
  versionId: string | null;
  content: Prisma.JsonValue;
};

export const chatBranchRepository = {
  async ensureDefaultBranch(chatId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        activeBranchId: true,
        messages: { orderBy: { createdAt: 'asc' }, select: { id: true } },
      },
    });

    if (!chat) return null;

    if (chat.activeBranchId) {
      return prisma.chatBranch.findUnique({ where: { id: chat.activeBranchId } });
    }

    return prisma.$transaction(async (tx) => {
      const createdBranch = await tx.chatBranch.create({
        data: { chatId },
        select: { id: true },
      });

      await tx.chat.update({
        where: { id: chatId },
        data: { activeBranchId: createdBranch.id },
        select: { id: true },
      });

      if (chat.messages.length) {
        await tx.chatBranchMessage.createMany({
          data: chat.messages.map((m: { id: string }, idx: number) => ({
            branchId: createdBranch.id,
            messageId: m.id,
            position: idx,
          })),
        });
      }

      return tx.chatBranch.findUnique({ where: { id: createdBranch.id } });
    });
  },

  async getResolvedMessagesForBranch(branchId: string) {
    const items = await prisma.chatBranchMessage.findMany({
      where: { branchId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        position: true,
        message: { select: { id: true, role: true, content: true, createdAt: true } },
        messageVersion: { select: { id: true, content: true, createdAt: true } },
      },
    });

    return items.map((it: {
      message: { id: string; role: string; content: Prisma.JsonValue; createdAt: Date };
      messageVersion: { content: Prisma.JsonValue } | null;
    }) => ({
      id: it.message.id,
      role: it.message.role,
      content: (it.messageVersion?.content ?? it.message.content) as Prisma.JsonValue,
      createdAt: it.message.createdAt,
    }));
  },

  async appendMessageToBranch(branchId: string, messageId: string) {
    return prisma.$transaction(async (tx) => {
      const last = await tx.chatBranchMessage.findFirst({
        where: { branchId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const nextPosition = (last?.position ?? -1) + 1;
      return tx.chatBranchMessage.create({
        data: { branchId, messageId, position: nextPosition },
      });
    });
  },

  async forkBranchFromEdit({
    chatId,
    parentBranchId,
    forkMessageId,
    forkVersionId,
  }: {
    chatId: string;
    parentBranchId: string;
    forkMessageId: string;
    forkVersionId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const forkItem = await tx.chatBranchMessage.findFirst({
        where: { branchId: parentBranchId, messageId: forkMessageId },
        select: { position: true },
      });

      if (!forkItem) {
        throw new Error('Fork message not found in branch');
      }

      const prefix = await tx.chatBranchMessage.findMany({
        where: { branchId: parentBranchId, position: { lte: forkItem.position } },
        orderBy: { position: 'asc' },
        select: { messageId: true, position: true, messageVersionId: true },
      });

      const newBranch = await tx.chatBranch.create({
        data: {
          chatId,
          parentBranchId,
          forkMessageId,
          forkVersionId,
        },
        select: { id: true },
      });

      await tx.chatBranchMessage.createMany({
        data: prefix.map((p: { messageId: string; position: number; messageVersionId: string | null }) => ({
          branchId: newBranch.id,
          messageId: p.messageId,
          position: p.position,
          messageVersionId: p.messageId === forkMessageId ? forkVersionId : p.messageVersionId,
        })),
      });

      await tx.chat.update({
        where: { id: chatId },
        data: { activeBranchId: newBranch.id },
      });

      return tx.chatBranch.findUnique({ where: { id: newBranch.id } });
    });
  },

  async setActiveBranch(chatId: string, branchId: string) {
    return prisma.chat.update({
      where: { id: chatId },
      data: { activeBranchId: branchId },
      select: { id: true, activeBranchId: true },
    });
  },

  async listVersionBranchesForMessage({
    chatId,
    messageId,
    currentBranchId,
  }: {
    chatId: string;
    messageId: string;
    currentBranchId: string;
  }): Promise<{ parentBranchId: string | null; currentScopeBranchId: string; options: BranchVersionOption[] }> {
    const currentBranch = await prisma.chatBranch.findFirst({
      where: { id: currentBranchId, chatId },
      select: { id: true, parentBranchId: true, forkMessageId: true },
    });
    if (!currentBranch) {
      throw new Error('Branch not found');
    }

    let scopeBranchId = currentBranch.id;
    let baseBranchId: string = currentBranch.id;

    if (currentBranch.forkMessageId === messageId) {
      baseBranchId = currentBranch.parentBranchId ?? currentBranch.id;
    } else {
      let cursorId: string | null = currentBranch.parentBranchId ?? null;
      while (cursorId) {
        const b = await prisma.chatBranch.findUnique({
          where: { id: cursorId },
          select: { id: true, chatId: true, parentBranchId: true, forkMessageId: true },
        });
        if (!b || b.chatId !== chatId) break;
        if (b.forkMessageId === messageId) {
          scopeBranchId = b.id;
          baseBranchId = b.parentBranchId ?? b.id;
          break;
        }
        cursorId = b.parentBranchId ?? null;
      }
    }

    const siblingParentId = baseBranchId;
    const siblingBranches = await prisma.chatBranch.findMany({
      where: { chatId, parentBranchId: siblingParentId, forkMessageId: messageId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, forkVersionId: true },
    });

    const baseItem = await prisma.chatBranchMessage.findFirst({
      where: { branchId: baseBranchId, messageId },
      select: {
        messageVersionId: true,
        message: { select: { content: true } },
        messageVersion: { select: { content: true } },
      },
    });

    const options: BranchVersionOption[] = [];
    if (baseItem) {
      options.push({
        branchId: baseBranchId,
        versionId: baseItem.messageVersionId ?? null,
        content: (baseItem.messageVersion?.content ?? baseItem.message.content) as Prisma.JsonValue,
      });
    }

    for (const br of siblingBranches) {
      const item = await prisma.chatBranchMessage.findFirst({
        where: { branchId: br.id, messageId },
        select: {
          messageVersionId: true,
          message: { select: { content: true } },
          messageVersion: { select: { content: true } },
        },
      });
      if (!item) continue;
      options.push({
        branchId: br.id,
        versionId: item.messageVersionId ?? br.forkVersionId ?? null,
        content: (item.messageVersion?.content ?? item.message.content) as Prisma.JsonValue,
      });
    }

    return {
      parentBranchId: siblingParentId,
      currentScopeBranchId: scopeBranchId,
      options,
    };
  },
};
