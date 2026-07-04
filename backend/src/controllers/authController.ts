import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import * as authService from '../services/authService';
import * as inviteService from '../services/inviteService';
import * as userRepo from '../repositories/userRepository';
import * as inviteRepo from '../repositories/inviteRepository';
import { signToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    // Block self-registration for privileged roles
    if (role === 'ADMIN' || role === 'STAFF') {
      errorResponse(
        res,
        'Only students can self-register. Staff must use an invite link.',
        403
      );
      return;
    }

    const result = await authService.register(req.body);
    successResponse(res, result, 201, 'Registered successfully');
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 400);
    else next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    successResponse(res, result, 200, 'Login successful');
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 401);
    else next(err);
  }
};

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const record = await inviteService.validateToken(token);
    successResponse(res, { email: record.email, name: record.name, role: record.role }, 200, 'Token is valid');
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 400);
    else next(err);
  }
};

export const registerWithToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, name, password } = req.body;

    // Validate the invite token
    const invite = await inviteService.validateToken(token);

    // Check the email isn't already registered
    const existing = await userRepo.findUserByEmail(invite.email);
    if (existing) {
      errorResponse(res, 'Email already registered', 400);
      return;
    }

    // Create the user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepo.createUser({
      name: name || invite.name,
      email: invite.email,
      passwordHash,
      role: invite.role as Role,
    });

    // Mark token as used
    await inviteRepo.markUsed(invite.id);

    const jwtToken = signToken({ userId: user.id, role: user.role });
    successResponse(
      res,
      { token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      201,
      'Staff account created successfully'
    );
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 400);
    else next(err);
  }
};
