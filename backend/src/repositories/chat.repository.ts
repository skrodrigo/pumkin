import { prisma } from './../common/prisma.js';
import { chatBranchRepository } from './chat-branch.repository.js';

export const chatRepository = {
  create(userId: string, title: string, model?: string) {
    return prisma.chat.create({
      data: { userId, title, model },
    });
  },

  async findByIdForUser(chatId: string, userId: string, branchId?: string) {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      select: {
        id: true,
        title: true,
        pinnedAt: true,
        sharePath: true,
        isPublic: true,
        updatedAt: true,
        model: true,
        activeBranchId: true,
      },
    });

    if (!chat) return null;

    const ensured = await chatBranchRepository.ensureDefaultBranch(chatId);
    const effectiveBranchId = branchId ?? chat.activeBranchId ?? ensured?.id ?? null;
    if (!effectiveBranchId) {
      return { ...chat, activeBranchId: null, messages: [] };
    }

    const messages = await chatBranchRepository.getResolvedMessagesForBranch(effectiveBranchId);
    return { ...chat, activeBranchId: effectiveBranchId, messages };
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
        pinnedAt: true,
        updatedAt: true,
      },
      orderBy: [
        { pinnedAt: { sort: 'desc', nulls: 'last' } },
        { updatedAt: 'desc' },
      ],
    });
  },

  findArchivedForUser(userId: string) {
    return prisma.chat.findMany({
      where: { userId, archivedAt: { not: null } },
      select: {
        id: true,
        title: true,
        pinnedAt: true,
        updatedAt: true,
        archivedAt: true,
      },
      orderBy: [
        { pinnedAt: { sort: 'desc', nulls: 'last' } },
        { updatedAt: 'desc' },
      ],
    });
  },

  pinForUser(chatId: string, userId: string) {
    return prisma.chat.updateMany({
      where: { id: chatId, userId },
      data: { pinnedAt: new Date() },
    });
  },

  unpinForUser(chatId: string, userId: string) {
    return prisma.chat.updateMany({
      where: { id: chatId, userId },
      data: { pinnedAt: null },
    });
  },

  renameForUser(chatId: string, userId: string, title: string) {
    return prisma.chat.updateMany({
      where: { id: chatId, userId },
      data: { title },
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
        model: true,
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

  updateModel(chatId: string, model: string) {
    return prisma.chat.update({
      where: { id: chatId },
      data: { model },
    });
  },
};
