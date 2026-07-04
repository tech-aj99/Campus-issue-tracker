import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = '📭', title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {message && <p className="text-sm text-gray-500 max-w-xs">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
