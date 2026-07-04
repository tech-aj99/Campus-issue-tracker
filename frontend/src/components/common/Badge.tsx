import { IssueStatus, Priority } from '../../types/issue';
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '../../utils/constants';

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    STAFF: 'bg-teal-100 text-teal-700',
    STUDENT: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
}
