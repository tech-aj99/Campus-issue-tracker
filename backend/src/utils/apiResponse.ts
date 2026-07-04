import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: unknown,
  statusCode = 200,
  message = 'Success'
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500
) => {
  return res.status(statusCode).json({ success: false, message, data: null });
};
