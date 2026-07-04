import { useState } from 'react';
import { Issue } from '../../types/issue';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate, truncate } from '../../utils/formatters';
import StatusUpdater from './StatusUpdater';

interface Props {
  issue: Issue;
  onUpdate: () => void;
}

export default function AssignedIssueCard({ issue, onUpdate }: Props) {
  const location = `${issue.room.floor.building.name} › Floor ${issue.room.floor.number} › Room ${issue.room.number}`;
  const [imageExpanded, setImageExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Issue image — shown if imageUrl exists */}
      {issue.imageUrl && (
        <div className="relative">
          <img
            src={issue.imageUrl}
            alt="Issue photo"
            onClick={() => setImageExpanded(!imageExpanded)}
            className={`w-full object-cover cursor-pointer transition-all duration-300 ${
              imageExpanded ? 'max-h-[320px]' : 'max-h-32'
            }`}
          />
          <div className="absolute top-2 right-2">
            <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              📸 {imageExpanded ? 'Collapse' : 'Expand'}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{issue.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">by {issue.raisedBy.name}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3">{truncate(issue.description, 120)}</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">📍 {location}</p>
            <p className="text-xs text-gray-400 mt-0.5">🗓 {formatDate(issue.createdAt)}</p>
          </div>
          <StatusUpdater issueId={issue.id} currentStatus={issue.status} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
}
