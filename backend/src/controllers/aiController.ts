import { Request, Response, NextFunction } from 'express';
import { analyzeIssue } from '../services/aiService';
import { checkDuplicate } from '../services/duplicateDetectionService';
import { analyzeImageIssue } from '../services/imageAnalysisService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const analyzeIssueHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description } = req.body;
    const result = await analyzeIssue(description);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
};

export const checkDuplicateHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, roomId } = req.body;
    const result = await checkDuplicate(description, roomId);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
};

export const analyzeImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return errorResponse(res, 'No image file provided', 400);
    }

    const mimeType = file.mimetype;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
      return errorResponse(res, 'Unsupported image format. Use JPEG, PNG, WEBP, or GIF.', 400);
    }

    const result = await analyzeImageIssue(file.buffer, mimeType);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
};
