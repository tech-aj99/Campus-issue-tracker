import prisma from '../config/db';

export const createLog = (
  issueId: string,
  action: string,
  performedBy: string,
  note?: string
) =>
  prisma.issueLog.create({
    data: { issueId, action, performedBy, note },
    include: {
      performedByUser: { select: { id: true, name: true, role: true } },
    },
  });

export const getLogsByIssue = (issueId: string) =>
  prisma.issueLog.findMany({
    where: { issueId },
    include: {
      performedByUser: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
