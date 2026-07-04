import api from './axiosInstance';

export const sendChatMessage = async (message: string): Promise<string> => {
  const { data } = await api.post('/chatbot/message', { message });
  return data.data.reply as string;
};
