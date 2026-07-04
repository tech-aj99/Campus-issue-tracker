import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const gemini = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
