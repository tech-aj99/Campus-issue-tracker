import api from './axiosInstance';
import { User } from '../types/user';

export const getStaffList = async (): Promise<User[]> => {
  const { data } = await api.get('/users/staff');
  return data.data;
};
