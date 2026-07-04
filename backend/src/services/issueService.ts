import * as issueRepo from '../repositories/issueRepository';
import * as issueLogRepo from '../repositories/issueLogRepository';
import { checkDuplicate } from './duplicateDetectionService';
import { CreateIssueDto } from '../types/dto';
import { IssueStatus } from '@prisma/client';
import { emitIssueEvent } from '../utils/socketServer';
import {
  notifyAdminNewIssue,
  notifyStaffAssigned,
  notifyStudentStatusUpdate,
} from './notificationService';
import prisma from '../config/db';

export const createIssue = async (data: CreateIssueDto, userId: string) => {
  if (!data.forceCreate) {
    const dupResult = await checkDuplicate(data.description, data.roomId);
    if (dupResult.duplicate && dupResult.confidence > 0.75) {
      return { isDuplicate: true, ...dupResult };
    }
  }

  const issue = await issueRepo.createIssue({
    title: data.title,
    description: data.description,
    roomId: data.roomId,
    raisedById: userId,
    category: data.category,
    department: data.department,
    tags: data.tags || [],
    priority: data.priority || 'MEDIUM',
    imageUrl: data.imageUrl,
  });

  // Audit log
  await issueLogRepo.createLog(issue.id, 'ISSUE_RAISED', userId);

  // Real-time broadcast to all admins
  emitIssueEvent('issue:created', {
    issueId: issue.id,
    title: issue.title,
    status: issue.status,
    raisedBy: issue.raisedBy?.name || 'Unknown',
    building: issue.room?.floor?.building?.name || 'Unknown',
    priority: issue.priority,
  });
  notifyAdminNewIssue({ id: issue.id, title: issue.title });

  return { isDuplicate: false, issue };
};

export const getMyIssues = (userId: string) =>
  issueRepo.findIssuesByUser(userId);

export const getAllIssues = () =>
  issueRepo.findAllIssues();

export const getAssignedIssues = (staffId: string) =>
  issueRepo.findAssignedIssues(staffId);

export const getIssueById = (id: string, userId: string, role: string) => {
  const issue = issueRepo.findIssueById(id);
  // Students can only fetch their own
  if (role === 'STUDENT') {
    return issueRepo.findIssuesByUser(userId).then((issues) => {
      const found = issues.find((i) => i.id === id);
      if (!found) throw new Error('Issue not found or access denied');
      return found;
    });
  }
  return issue;
};

export const updateStatus = async (id: string, status: IssueStatus, staffId: string) => {
  const assigned = await issueRepo.findAssignedIssues(staffId);
  const isAssigned = assigned.some((i) => i.id === id);
  if (!isAssigned) throw new Error('You are not assigned to this issue');

  const updated = await issueRepo.updateIssueStatus(id, status);

  // Audit log
  await issueLogRepo.createLog(id, 'STATUS_UPDATED', staffId, status);

  // Notify the student who raised it
  if (updated.raisedById) {
    notifyStudentStatusUpdate(updated.raisedById, {
      id: updated.id,
      title: updated.title,
      status: updated.status,
    });
  }

  // Emit real-time status change event
  emitIssueEvent('issue:status_changed', {
    issueId: updated.id,
    title: updated.title,
    status: updated.status,
    building: updated.room?.floor?.building?.name || 'Unknown',
    priority: updated.priority,
  });

  return updated;
};

export const assignStaff = async (issueId: string, staffId: string) => {
  const assignment = await issueRepo.assignStaffToIssue(issueId, staffId);

  // Fetch the issue so we have the title for the log and notification
  const issue = await issueRepo.findIssueById(issueId);

  // Fetch staff name
  const staffUser = await prisma.user.findUnique({ where: { id: staffId }, select: { name: true } });
  const staffName = staffUser?.name || staffId;

  // Audit log (performed by admin — we log staffId as the "note" target)
  await issueLogRepo.createLog(issueId, 'STAFF_ASSIGNED', staffId, `Assigned to ${staffName}`);

  // Notify the staff member
  if (issue) {
    notifyStaffAssigned(staffId, { id: issue.id, title: issue.title });
  }

  // Emit real-time assignment event
  emitIssueEvent('issue:assigned', {
    issueId,
    title: issue?.title || issueId,
    assignedTo: staffId,
  });

  return assignment;
};

export const getStats = async () => {
  const { byStatus, byCategory, rawIssues } = await issueRepo.getIssueStats();

  const statusData = byStatus.map((s) => ({
    name: s.status,
    count: s._count.id,
  }));

  const categoryData = byCategory
    .filter((c) => c.category)
    .map((c) => ({ name: c.category!, count: c._count.id }));

  const buildingMap: Record<string, number> = {};
  rawIssues.forEach((issue) => {
    const bName = issue.room?.floor?.building?.name || 'Unknown';
    buildingMap[bName] = (buildingMap[bName] || 0) + 1;
  });
  const buildingData = Object.entries(buildingMap).map(([name, count]) => ({ name, count }));

  return { statusData, categoryData, buildingData, total: rawIssues.length };
};
