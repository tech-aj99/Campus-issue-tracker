import { Request, Response, NextFunction } from 'express';
import * as issueService from '../services/issueService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const createIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // When submitted as multipart/form-data, tags may arrive as a JSON string
    const body = { ...req.body };
    if (typeof body.tags === 'string') {
      try { body.tags = JSON.parse(body.tags); } catch { body.tags = []; }
    }

    // Build imageUrl if a file was uploaded
    if (req.file) {
      body.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const result = await issueService.createIssue(body, req.user!.userId);
    const status = (result as { isDuplicate: boolean }).isDuplicate ? 200 : 201;
    successResponse(res, result, status);
  } catch (err) {
    next(err);
  }
};

export const getMyIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issues = await issueService.getMyIssues(req.user!.userId);
    successResponse(res, issues);
  } catch (err) {
    next(err);
  }
};

export const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issues = await issueService.getAllIssues();
    successResponse(res, issues);
  } catch (err) {
    next(err);
  }
};

export const getAssignedIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issues = await issueService.getAssignedIssues(req.user!.userId);
    successResponse(res, issues);
  } catch (err) {
    next(err);
  }
};

export const getIssueById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await issueService.getIssueById(req.params.id, req.user!.userId, req.user!.role);
    if (!issue) return errorResponse(res, 'Issue not found', 404);
    successResponse(res, issue);
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 403);
    else next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issue = await issueService.updateStatus(req.params.id, req.body.status, req.user!.userId);
    successResponse(res, issue);
  } catch (err) {
    if (err instanceof Error) errorResponse(res, err.message, 403);
    else next(err);
  }
};

export const assignStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await issueService.assignStaff(req.params.id, req.body.staffId);
    successResponse(res, assignment);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await issueService.getStats();
    successResponse(res, stats);
  } catch (err) {
    next(err);
  }
};
