import { gemini } from '../utils/geminiClient';
import { AIAnalysisResult } from '../types/dto';

export const analyzeIssue = async (description: string): Promise<AIAnalysisResult> => {
  const prompt = `You are a campus maintenance assistant. Analyze the following issue description and return ONLY a valid JSON object with no markdown, no explanation, no code fences.

Issue description: "${description}"

Return exactly this JSON structure:
{
  "category": "one of: electrical, plumbing, hvac, cleaning, structural, it, security, other",
  "building": "extracted building name or null",
  "floor": "floor number as string or null",
  "room": "room number or null",
  "priority": "one of: LOW, MEDIUM, HIGH",
  "department": "one of: maintenance, it, housekeeping, security",
  "tags": ["array", "of", "relevant", "tags"]
}

Rules:
- priority HIGH = safety hazard, flooding, power outage, fire risk
- priority MEDIUM = broken equipment, leaks, moderate disruption
- priority LOW = cosmetic issues, minor inconveniences
- Extract location info only if clearly mentioned
- tags should be 2-5 short keywords`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('AI analysis failed:', err);
    return {
      category: 'other',
      building: null,
      floor: null,
      room: null,
      priority: 'MEDIUM',
      department: 'maintenance',
      tags: [],
    };
  }
};
