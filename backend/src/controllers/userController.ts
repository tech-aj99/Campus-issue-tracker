import { Request, Response, NextFunction } from 'express';
import { findAllStaff } from '../repositories/userRepository';
import { successResponse } from '../utils/apiResponse';

export const getStaffList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await findAllStaff();
    successResponse(res, staff);
  } catch (err) {
    next(err);
  }
};
