import { prisma } from './../common/prisma.js';
import { Prisma } from './../generated/prisma/client.js';

export const messageRepository = {
  create(chatId: string, role: string, content: unknown) {
    return prisma.message.create({
      data: { chatId, role, content: content as Prisma.InputJsonValue },
    });
  },

  deleteManyAfter(chatId: string, messageId: string) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.findFirst({
        where: { id: messageId, chatId },
        select: { createdAt: true },
      });
      if (!message) return { count: 0 };
      return tx.message.deleteMany({
        where: {
          chatId,
          createdAt: { gt: message.createdAt },
        },
      });
    });
  },

  updateContent(messageId: string, content: unknown) {
    return prisma.message.update({
      where: { id: messageId },
      data: { content: content as Prisma.InputJsonValue },
    });
  },

  createVersion(messageId: string, content: unknown) {
    return prisma.messageVersion.create({
      data: {
        messageId,
        content: content as Prisma.InputJsonValue,
      },
    });
  },

  findVersions(messageId: string) {
    return prisma.messageVersion.findMany({
      where: { messageId },
      orderBy: { createdAt: 'asc' },
    });
  },
};
