import { gemini } from '../utils/geminiClient';
import prisma from '../config/db';
import { Role } from '@prisma/client';

const SYSTEM_PROMPT = `You are CampusBot, an AI assistant embedded inside a campus maintenance issue tracker.
Your job is to help students, staff, and admins understand the status of campus maintenance issues.

Guidelines:
- Be concise, friendly, and professional.
- Use the database context provided to answer the user's question accurately.
- If the answer is not in the context, say you don't have that information.
- For status values: OPEN means not started, IN_PROGRESS means being worked on, RESOLVED means done.
- For priority values: HIGH = urgent, MEDIUM = moderate, LOW = minor.
- Do NOT make up issue IDs, statuses, or names that are not in the context.
- Respond in 1–3 sentences unless a list is genuinely helpful.`;

const buildStudentContext = async (userId: string) => {
  const issues = await prisma.issue.findMany({
    where: { raisedById: userId },
    include: {
      room: { include: { floor: { include: { building: true } } } },
      assignment: { include: { staff: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (!issues.length) return 'The student has not raised any issues yet.';

  return issues
    .map(
      (i) =>
        `- "${i.title}" | Status: ${i.status} | Priority: ${i.priority}` +
        ` | Location: ${i.room.floor.building.name}, Floor ${i.room.floor.number}, Room ${i.room.number}` +
        (i.assignment ? ` | Assigned to: ${i.assignment.staff.name}` : ' | Not yet assigned') +
        ` | Raised: ${i.createdAt.toLocaleDateString()}`
    )
    .join('\n');
};

const buildStaffContext = async (userId: string) => {
  const issues = await prisma.issue.findMany({
    where: { assignment: { staffId: userId } },
    include: {
      room: { include: { floor: { include: { building: true } } } },
      raisedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (!issues.length) return 'No issues are currently assigned to this staff member.';

  return issues
    .map(
      (i) =>
        `- "${i.title}" | Status: ${i.status} | Priority: ${i.priority}` +
        ` | Location: ${i.room.floor.building.name}, Floor ${i.room.floor.number}, Room ${i.room.number}` +
        ` | Raised by: ${i.raisedBy.name}`
    )
    .join('\n');
};

const buildAdminContext = async () => {
  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      include: {
        room: { include: { floor: { include: { building: true } } } },
        raisedBy: { select: { name: true } },
        assignment: { include: { staff: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.issue.count(),
  ]);

  const open = issues.filter((i) => i.status === 'OPEN').length;
  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolved = issues.filter((i) => i.status === 'RESOLVED').length;
  const highPriority = issues.filter((i) => i.priority === 'HIGH' && i.status !== 'RESOLVED').length;

  const stats = `Total issues: ${total} | Open: ${open} | In Progress: ${inProgress} | Resolved: ${resolved} | Unresolved HIGH priority: ${highPriority}`;

  const issueLines = issues
    .slice(0, 30)
    .map(
      (i) =>
        `- "${i.title}" | Status: ${i.status} | Priority: ${i.priority}` +
        ` | Building: ${i.room.floor.building.name}` +
        (i.assignment ? ` | Staff: ${i.assignment.staff.name}` : ' | Unassigned')
    )
    .join('\n');

  return `${stats}\n\nRecent issues:\n${issueLines}`;
};

export const processMessage = async (
  userMessage: string,
  userId: string,
  userRole: Role
): Promise<string> => {
  let context = '';

  if (userRole === 'STUDENT') {
    context = await buildStudentContext(userId);
  } else if (userRole === 'STAFF') {
    context = await buildStaffContext(userId);
  } else {
    context = await buildAdminContext();
  }

  const prompt = `${SYSTEM_PROMPT}

--- DATABASE CONTEXT ---
${context}
--- END CONTEXT ---

User (${userRole}): ${userMessage}

CampusBot:`;

  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Chatbot Gemini error:', err);
    return "Sorry, I'm having trouble reaching the AI right now. Please try again in a moment.";
  }
};
