import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import * as inviteService from '../services/inviteService';
import * as inviteRepo from '../repositories/inviteRepository';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const createInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, role } = req.body;
    const adminId = req.user!.userId;
    const { invite, link } = await inviteService.generateInvite(email, name, adminId, (role as Role) || 'STAFF');
    successResponse(res, { invite, link }, 201, 'Invite created successfully');
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 400);
    else next(err);
  }
};

export const getInvites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.userId;
    const invites = await inviteService.getAllInvites(adminId);
    successResponse(res, invites, 200, 'Invites fetched');
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 400);
    else next(err);
  }
};

export const deleteInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await inviteRepo.deleteInvite(id);
    successResponse(res, null, 200, 'Invite deleted');
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 400);
    else next(err);
  }
};
