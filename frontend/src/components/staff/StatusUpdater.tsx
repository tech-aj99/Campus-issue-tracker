import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateStatus } from '../../api/issueApi';
import { IssueStatus } from '../../types/issue';
import Button from '../common/Button';

interface Props {
  issueId: string;
  currentStatus: IssueStatus;
  onUpdate: () => void;
}

const nextStatus: Partial<Record<IssueStatus, IssueStatus>> = {
  OPEN: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
};

const labels: Partial<Record<IssueStatus, string>> = {
  OPEN: 'Start Working',
  IN_PROGRESS: 'Mark Resolved',
};

export default function StatusUpdater({ issueId, currentStatus, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const next = nextStatus[currentStatus];

  if (!next) return <span className="text-xs text-green-600 font-medium">✅ Resolved</span>;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateStatus(issueId, next);
      toast.success(`Status updated to ${next.replace('_', ' ')}`);
      onUpdate();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={next === 'RESOLVED' ? 'secondary' : 'primary'}
      loading={loading}
      onClick={handleUpdate}
    >
      {labels[currentStatus]}
    </Button>
  );
}
