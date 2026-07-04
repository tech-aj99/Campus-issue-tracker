import prisma from '../config/db';

export const createComment = (issueId: string, authorId: string, text: string) =>
  prisma.comment.create({
    data: { issueId, authorId, text },
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
  });

export const getCommentsByIssue = (issueId: string) =>
  prisma.comment.findMany({
    where: { issueId },
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

export const findCommentById = (id: string) =>
  prisma.comment.findUnique({ where: { id } });

export const deleteComment = (id: string) =>
  prisma.comment.delete({ where: { id } });
