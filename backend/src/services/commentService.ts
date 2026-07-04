import * as commentRepo from '../repositories/commentRepository';
import * as issueLogRepo from '../repositories/issueLogRepository';
import { notifyCommentAdded } from './notificationService';
import { getIO } from '../utils/socketServer';
import * as issueRepo from '../repositories/issueRepository';

export const addComment = async (
  issueId: string,
  authorId: string,
  text: string
) => {
  const comment = await commentRepo.createComment(issueId, authorId, text);

  // Audit log
  await issueLogRepo.createLog(issueId, 'COMMENT_ADDED', authorId, text.substring(0, 120));

  // Fetch the issue for the notification title
  const issue = await issueRepo.findIssueById(issueId);

  if (issue) {
    // Notify anyone watching the specific issue room in real-time
    try {
      getIO().to(`issue:${issueId}`).emit('comment:new', comment);
    } catch {
      // Socket not ready
    }

    // Targeted notification for issue owner (if different from commenter)
    if (issue.raisedById !== authorId) {
      notifyCommentAdded(issueId, { id: issue.id, title: issue.title });
    }
  }

  return comment;
};

export const getComments = (issueId: string) =>
  commentRepo.getCommentsByIssue(issueId);

export const deleteComment = async (commentId: string, requestingUserId: string) => {
  const comment = await commentRepo.findCommentById(commentId);
  if (!comment) throw new Error('Comment not found');
  if (comment.authorId !== requestingUserId)
    throw new Error('You can only delete your own comments');
  return commentRepo.deleteComment(commentId);
};
