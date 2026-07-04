import prisma from '../config/db';
import { IssueStatus, Priority } from '@prisma/client';

const issueInclude = {
  room: { include: { floor: { include: { building: true } } } },
  raisedBy: { select: { id: true, name: true, email: true, role: true } },
  assignment: {
    include: {
      staff: { select: { id: true, name: true, email: true } },
    },
  },
};

export const createIssue = (data: {
  title: string;
  description: string;
  roomId: string;
  raisedById: string;
  category?: string;
  department?: string;
  tags?: string[];
  priority?: Priority;
  imageUrl?: string;
}) => prisma.issue.create({ data, include: issueInclude });

export const findAllIssues = () =>
  prisma.issue.findMany({
    include: issueInclude,
    orderBy: { createdAt: 'desc' },
  });

export const findIssueById = (id: string) =>
  prisma.issue.findUnique({ where: { id }, include: issueInclude });

export const findIssuesByUser = (userId: string) =>
  prisma.issue.findMany({
    where: { raisedById: userId },
    include: issueInclude,
    orderBy: { createdAt: 'desc' },
  });

export const findAssignedIssues = (staffId: string) =>
  prisma.issue.findMany({
    where: { assignment: { staffId } },
    include: issueInclude,
    orderBy: { createdAt: 'desc' },
  });

export const findOpenIssuesByRoom = (roomId: string) =>
  prisma.issue.findMany({
    where: { roomId, status: { not: 'RESOLVED' } },
    select: { id: true, title: true, description: true, status: true },
  });

export const updateIssueStatus = (id: string, status: IssueStatus) =>
  prisma.issue.update({ where: { id }, data: { status }, include: issueInclude });

export const assignStaffToIssue = (issueId: string, staffId: string) =>
  prisma.issueAssignment.upsert({
    where: { issueId },
    create: { issueId, staffId },
    update: { staffId },
  });

export const getIssueStats = async () => {
  const [byStatus, byCategory, byBuilding] = await Promise.all([
    prisma.issue.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.issue.groupBy({ by: ['category'], _count: { id: true } }),
    prisma.issue.findMany({
      include: { room: { include: { floor: { include: { building: true } } } } },
    }),
  ]);
  return { byStatus, byCategory, rawIssues: byBuilding };
};
