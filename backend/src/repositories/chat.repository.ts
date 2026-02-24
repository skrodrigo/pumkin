import { prisma } from './../common/prisma.js';

export const chatRepository = {
  create(userId: string, title: string) {
    return prisma.chat.create({
      data: { userId, title },
    });
  },

  findByIdForUser(chatId: string, userId: string) {
    return prisma.chat.findFirst({
      where: { id: chatId, userId },
      select: {
        id: true,
        title: true,
        sharePath: true,
        isPublic: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  },

  findMetaForUser(chatId: string, userId: string) {
    return prisma.chat.findFirst({
      where: { id: chatId, userId },
      select: { id: true },
    });
  },

  findManyForUser(userId: string) {
    return prisma.chat.findMany({
      where: { userId, archivedAt: null },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  findArchivedForUser(userId: string) {
    return prisma.chat.findMany({
      where: { userId, archivedAt: { not: null } },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        archivedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  archiveForUser(chatId: string, userId: string) {
    return prisma.chat.updateMany({
      where: { id: chatId, userId, archivedAt: null },
      data: { archivedAt: new Date() },
    });
  },

  unarchiveForUser(chatId: string, userId: string) {
    return prisma.chat.updateMany({
      where: { id: chatId, userId, archivedAt: { not: null } },
      data: { archivedAt: null },
    });
  },

  deleteForUser(chatId: string, userId: string) {
    return prisma.chat.deleteMany({
      where: { id: chatId, userId },
    });
  },

  markPublic(chatId: string, userId: string, sharePath: string) {
    return prisma.chat.update({
      where: { id: chatId },
      data: { isPublic: true, sharePath },
    });
  },

  findShareInfoForUser(chatId: string, userId: string) {
    return prisma.chat.findFirst({
      where: { id: chatId, userId },
      select: {
        id: true,
        sharePath: true,
      },
    });
  },

  findPublicBySharePath(sharePath: string) {
    return prisma.chat.findUnique({
      where: { sharePath, isPublic: true },
      select: {
        id: true,
        title: true,
        sharePath: true,
        isPublic: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
  },
};
