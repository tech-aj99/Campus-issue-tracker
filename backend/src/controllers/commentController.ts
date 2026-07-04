import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService';
import * as issueLogRepo from '../repositories/issueLogRepository';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: issueId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return errorResponse(res, 'Comment text is required', 400);

    const comment = await commentService.addComment(issueId, req.user!.userId, text.trim());
    successResponse(res, comment, 201);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await commentService.getComments(req.params.id);
    successResponse(res, comments);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await commentService.deleteComment(req.params.id, req.user!.userId);
    successResponse(res, { deleted: true });
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 403);
    else next(err);
  }
};

export const getIssueLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await issueLogRepo.getLogsByIssue(req.params.id);
    successResponse(res, logs);
  } catch (err) {
    next(err);
  }
};
