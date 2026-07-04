import { IssueLog } from '../../api/commentApi';

interface Props {
  logs: IssueLog[];
}

const ACTION_CONFIG: Record<
  string,
  { icon: string; label: string; color: string; bg: string }
> = {
  ISSUE_RAISED: {
    icon: '🆕',
    label: 'Issue Raised',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  STAFF_ASSIGNED: {
    icon: '👤',
    label: 'Staff Assigned',
    color: 'text-violet-700',
    bg: 'bg-violet-100',
  },
  STATUS_UPDATED: {
    icon: '🔄',
    label: 'Status Updated',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
  },
  COMMENT_ADDED: {
    icon: '💬',
    label: 'Comment Added',
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
};

const DEFAULT_CONFIG = {
  icon: '📋',
  label: 'Action',
  color: 'text-gray-700',
  bg: 'bg-gray-100',
};

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export default function IssueTimeline({ logs }: Props) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl mb-2">📋</p>
        <p className="text-sm text-gray-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200 rounded-full" />

      <div className="space-y-5">
        {logs.map((log, idx) => {
          const config = ACTION_CONFIG[log.action] ?? DEFAULT_CONFIG;
          const isLast = idx === logs.length - 1;

          return (
            <div key={log.id} className="relative flex gap-3 items-start">
              {/* Icon dot */}
              <div
                className={`relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base ${config.bg}`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div
                className={`flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm ${
                  isLast ? '' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(log.createdAt)}</span>
                </div>

                <p className="text-xs text-gray-500 mt-0.5">
                  By{' '}
                  <span className="font-medium text-gray-700">
                    {log.performedByUser?.name || 'Unknown'}
                  </span>
                  {' '}
                  <span className="text-[10px] uppercase tracking-wide opacity-60">
                    ({log.performedByUser?.role || ''})
                  </span>
                </p>

                {log.note && (
                  <p className="mt-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed border border-gray-100">
                    {log.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
