import * as inviteRepo from '../repositories/inviteRepository';
import * as userRepo from '../repositories/userRepository';
import { Role } from '@prisma/client';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const generateInvite = async (email: string, name: string, adminId: string, role: Role = 'STAFF') => {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) throw new Error('A user with this email is already registered');

  const invite = await inviteRepo.createInvite(email, name, adminId, role);
  const link = `${FRONTEND_URL}/register?token=${invite.token}`;
  return { invite, link };
};

export const validateToken = async (token: string) => {
  const record = await inviteRepo.findByToken(token);
  if (!record) throw new Error('Invite token not found');
  if (record.usedAt) throw new Error('This invite link has already been used');
  if (record.expiresAt < new Date()) throw new Error('This invite link has expired');
  return record;
};

export const getAllInvites = (adminId: string) =>
  inviteRepo.findAllByAdmin(adminId);

export const removeInvite = (id: string) =>
  inviteRepo.deleteInvite(id);
