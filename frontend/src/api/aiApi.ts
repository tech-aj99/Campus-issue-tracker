import api from './axiosInstance';
import { AIAnalysisResult, DuplicateCheckResult } from '../types/issue';

export const analyzeIssue = async (description: string): Promise<AIAnalysisResult> => {
  const { data } = await api.post('/ai/analyze-issue', { description });
  return data.data;
};

export const checkDuplicate = async (
  description: string,
  roomId: string
): Promise<DuplicateCheckResult> => {
  const { data } = await api.post('/ai/check-duplicate', { description, roomId });
  return data.data;
};

export interface ImageAnalysisResult extends AIAnalysisResult {
  descriptionHint: string;
}

export const analyzeImage = async (file: File): Promise<ImageAnalysisResult> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};
