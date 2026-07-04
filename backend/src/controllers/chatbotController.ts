import { Request, Response, NextFunction } from 'express';
import { processMessage } from '../services/chatbotService';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { Role } from '@prisma/client';

export const chatbotMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return errorResponse(res, 'Message is required', 400);
    }

    const reply = await processMessage(
      message.trim(),
      req.user!.userId,
      req.user!.role as Role
    );

    successResponse(res, { reply });
  } catch (err) {
    next(err);
  }
};
