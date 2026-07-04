import api from './axiosInstance';

export interface InviteToken {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  createdById: string;
}

export interface InviteTokenInfo {
  email: string;
  name: string;
  role: string;
}

export const createInvite = async (
  email: string,
  name: string,
  role = 'STAFF'
): Promise<{ invite: InviteToken; link: string }> => {
  const { data } = await api.post('/invites', { email, name, role });
  return data.data;
};

export const getInvites = async (): Promise<InviteToken[]> => {
  const { data } = await api.get('/invites');
  return data.data;
};

export const deleteInvite = async (id: string): Promise<void> => {
  await api.delete(`/invites/${id}`);
};

export const validateInviteToken = async (token: string): Promise<InviteTokenInfo> => {
  const { data } = await api.get(`/auth/validate-token/${token}`);
  return data.data;
};

export const registerWithToken = async (
  token: string,
  name: string,
  password: string
) => {
  const { data } = await api.post('/auth/register-with-token', { token, name, password });
  return data.data;
};
