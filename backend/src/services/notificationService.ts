import { getIO } from '../utils/socketServer';

export interface NotificationPayload {
  type: 'NEW_ISSUE' | 'STAFF_ASSIGNED' | 'STATUS_UPDATED' | 'COMMENT_ADDED';
  message: string;
  issueId: string;
  issueTitle: string;
}

const safeEmit = (room: string, payload: NotificationPayload) => {
  try {
    getIO().to(room).emit('notification', payload);
  } catch {
    // Socket not initialized — silently skip (e.g. during startup)
  }
};

/** Notify all admins when a new issue is raised */
export const notifyAdminNewIssue = (issue: { id: string; title: string }) => {
  safeEmit('admin', {
    type: 'NEW_ISSUE',
    message: `New issue raised: "${issue.title}"`,
    issueId: issue.id,
    issueTitle: issue.title,
  });
};

/** Notify a specific staff member when an issue is assigned to them */
export const notifyStaffAssigned = (
  staffId: string,
  issue: { id: string; title: string }
) => {
  safeEmit(staffId, {
    type: 'STAFF_ASSIGNED',
    message: `You have been assigned to: "${issue.title}"`,
    issueId: issue.id,
    issueTitle: issue.title,
  });
};

/** Notify the student who raised an issue when its status changes */
export const notifyStudentStatusUpdate = (
  studentId: string,
  issue: { id: string; title: string; status: string }
) => {
  safeEmit(studentId, {
    type: 'STATUS_UPDATED',
    message: `Your issue "${issue.title}" is now ${issue.status.replace('_', ' ')}`,
    issueId: issue.id,
    issueTitle: issue.title,
  });
};

/** Notify all viewers of an issue page when a comment is added */
export const notifyCommentAdded = (
  issueId: string,
  issue: { id: string; title: string }
) => {
  safeEmit(`issue:${issueId}`, {
    type: 'COMMENT_ADDED',
    message: `New comment on "${issue.title}"`,
    issueId: issue.id,
    issueTitle: issue.title,
  });
};
