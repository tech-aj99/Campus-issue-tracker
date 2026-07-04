import prisma from '../config/db';
import { Role } from '@prisma/client';

export const createInvite = (email: string, name: string, createdById: string, role: Role = 'STAFF') => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  return prisma.inviteToken.create({
    data: { email, name, role, createdById, expiresAt },
  });
};

export const findByToken = (token: string) =>
  prisma.inviteToken.findUnique({ where: { token } });

export const markUsed = (id: string) =>
  prisma.inviteToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });

export const findAllByAdmin = (adminId: string) =>
  prisma.inviteToken.findMany({
    where: { createdById: adminId },
    orderBy: { createdAt: 'desc' },
  });

export const deleteInvite = (id: string) =>
  prisma.inviteToken.delete({ where: { id } });
