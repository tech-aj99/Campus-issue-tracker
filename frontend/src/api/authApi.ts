import api from './axiosInstance';
import { AuthResponse } from '../types/user';
import { Role } from '../types/user';

export const register = async (
  name: string,
  email: string,
  password: string,
  role: Role
): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data.data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
};
