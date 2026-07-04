import api from './axiosInstance';
import { Issue, CreateIssuePayload, IssueStatus } from '../types/issue';

export const createIssue = async (payload: CreateIssuePayload, imageFile?: File | null) => {
  if (imageFile) {
    // Send as multipart/form-data when an image is attached
    const form = new FormData();
    form.append('title', payload.title);
    form.append('description', payload.description);
    form.append('roomId', payload.roomId);
    if (payload.category) form.append('category', payload.category);
    if (payload.department) form.append('department', payload.department);
    if (payload.priority) form.append('priority', payload.priority);
    if (payload.tags?.length) form.append('tags', JSON.stringify(payload.tags));
    if (payload.forceCreate) form.append('forceCreate', 'true');
    form.append('image', imageFile);

    const { data } = await api.post('/issues', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  }

  // No image — send as regular JSON
  const { data } = await api.post('/issues', payload);
  return data.data;
};

export const getMyIssues = async (): Promise<Issue[]> => {
  const { data } = await api.get('/issues/mine');
  return data.data;
};

export const getAllIssues = async (): Promise<Issue[]> => {
  const { data } = await api.get('/issues');
  return data.data;
};

export const getAssignedIssues = async (): Promise<Issue[]> => {
  const { data } = await api.get('/issues/assigned');
  return data.data;
};

export const getIssueById = async (id: string): Promise<Issue> => {
  const { data } = await api.get(`/issues/${id}`);
  return data.data;
};

export const updateStatus = async (id: string, status: IssueStatus): Promise<Issue> => {
  const { data } = await api.patch(`/issues/${id}/status`, { status });
  return data.data;
};

export const assignStaff = async (issueId: string, staffId: string) => {
  const { data } = await api.patch(`/issues/${issueId}/assign`, { staffId });
  return data.data;
};

export const getStats = async () => {
  const { data } = await api.get('/issues/stats');
  return data.data;
};
