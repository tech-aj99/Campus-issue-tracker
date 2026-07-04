import prisma from '../config/db';
import { Role } from '@prisma/client';

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const createUser = (data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}) => prisma.user.create({ data });

export const findAllStaff = () =>
  prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, name: true, email: true, role: true },
  });
