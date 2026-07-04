import api from './axiosInstance';

export interface CommentAuthor {
  id: string;
  name: string;
  role: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  author: CommentAuthor;
  text: string;
  createdAt: string;
}

export interface IssueLog {
  id: string;
  issueId: string;
  action: string;
  performedBy: string;
  performedByUser: { id: string; name: string; role: string };
  note: string | null;
  createdAt: string;
}

export const getComments = async (issueId: string): Promise<Comment[]> => {
  const { data } = await api.get(`/issues/${issueId}/comments`);
  return data.data;
};

export const addComment = async (issueId: string, text: string): Promise<Comment> => {
  const { data } = await api.post(`/issues/${issueId}/comments`, { text });
  return data.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

export const getIssueLogs = async (issueId: string): Promise<IssueLog[]> => {
  const { data } = await api.get(`/issues/${issueId}/logs`);
  return data.data;
};
