import { gemini } from '../utils/geminiClient';
import { findOpenIssuesByRoom } from '../repositories/issueRepository';
import { DuplicateCheckResult } from '../types/dto';

export const checkDuplicate = async (
  description: string,
  roomId: string
): Promise<DuplicateCheckResult> => {
  const existingIssues = await findOpenIssuesByRoom(roomId);

  if (existingIssues.length === 0) {
    return { duplicate: false, matchedIssueId: null, confidence: 0, reason: 'No open issues in this room' };
  }

  const candidates = existingIssues
    .map((i) => `ID: ${i.id} | Title: ${i.title} | Description: ${i.description.substring(0, 150)}`)
    .join('\n');

  const prompt = `You are a duplicate issue detector for a campus maintenance system. Determine if the new issue is a duplicate of any existing open issue.

New issue description: "${description}"

Existing open issues in the same room:
${candidates}

Return ONLY a valid JSON object with no markdown, no explanation, no code fences:
{
  "duplicate": true or false,
  "matchedIssueId": "the matching issue ID or null",
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation in one sentence"
}

Consider duplicate if: same physical problem, same location, same root cause. Different symptoms of the same problem count as duplicate. Confidence > 0.75 means strong duplicate.`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Duplicate check failed:', err);
    return { duplicate: false, matchedIssueId: null, confidence: 0, reason: 'Check failed' };
  }
};
