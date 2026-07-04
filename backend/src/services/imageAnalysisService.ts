import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { AIAnalysisResult } from '../types/dto';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
// Use the vision-capable model
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const analyzeImageIssue = async (
  imageBuffer: Buffer,
  mimeType: string
): Promise<AIAnalysisResult & { descriptionHint: string }> => {
  const prompt = `You are a campus maintenance assistant. Analyze this image of a campus maintenance issue and return ONLY a valid JSON object with no markdown, no explanation, no code fences.

Return exactly this JSON structure:
{
  "category": "one of: electrical, plumbing, hvac, cleaning, structural, it, security, other",
  "building": "building name if visible or null",
  "floor": "floor number as string if visible or null",
  "room": "room number if visible or null",
  "priority": "one of: LOW, MEDIUM, HIGH",
  "department": "one of: maintenance, it, housekeeping, security",
  "tags": ["array", "of", "relevant", "tags"],
  "descriptionHint": "A one-sentence description of what you see in the image"
}

Rules:
- priority HIGH = visible safety hazard, flooding, electrical sparks, fire damage, structural collapse
- priority MEDIUM = broken equipment, active leaks, mold, broken glass
- priority LOW = cosmetic damage, minor stains, peeling paint, dirty surfaces
- tags should be 2-5 short keywords describing what you see`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType,
      },
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error('Image AI analysis failed:', err);
    return {
      category: 'other',
      building: null,
      floor: null,
      room: null,
      priority: 'MEDIUM',
      department: 'maintenance',
      tags: [],
      descriptionHint: 'Campus maintenance issue detected in image.',
    };
  }
};
