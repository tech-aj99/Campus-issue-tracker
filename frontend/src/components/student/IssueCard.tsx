import { Link } from 'react-router-dom';
import { Issue } from '../../types/issue';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate, truncate } from '../../utils/formatters';

export default function IssueCard({ issue }: { issue: Issue }) {
  const location = `${issue.room.floor.building.name} › Floor ${issue.room.floor.number} › Room ${issue.room.number}`;

  return (
    <Link
      to={`/issue/${issue.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug flex-1 min-w-0">{issue.title}</h3>
        <div className="flex gap-1.5 shrink-0">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-3">{truncate(issue.description, 100)}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 flex-wrap gap-1">
        <span className="truncate">📍 {location}</span>
        <span className="shrink-0">{formatDate(issue.createdAt)}</span>
      </div>
      {issue.category && (
        <div className="mt-2">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">
            {issue.category}
          </span>
        </div>
      )}
    </Link>
  );
}
