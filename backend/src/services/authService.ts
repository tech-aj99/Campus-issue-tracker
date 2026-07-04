import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import * as userRepo from '../repositories/userRepository';
import { signToken } from '../utils/jwt';

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) => {
  const existing = await userRepo.findUserByEmail(data.email);
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await userRepo.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
  });

  const token = signToken({ userId: user.id, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const login = async (email: string, password: string) => {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = signToken({ userId: user.id, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};
