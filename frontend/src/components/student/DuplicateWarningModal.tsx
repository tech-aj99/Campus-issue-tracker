import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface Props {
  isOpen: boolean;
  matchedIssueId: string | null;
  confidence: number;
  reason: string;
  onCreateAnyway: () => void;
  onClose: () => void;
}

export default function DuplicateWarningModal({
  isOpen, matchedIssueId, confidence, reason, onCreateAnyway, onClose,
}: Props) {
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚠️ Possible Duplicate Issue">
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Similar issue already exists</p>
          <p className="text-sm text-amber-700">{reason}</p>
          <p className="text-xs text-amber-600 mt-2">
            Confidence: {Math.round(confidence * 100)}%
          </p>
        </div>
        <p className="text-sm text-gray-600">
          An open issue with a similar description was found. Would you like to follow that issue
          instead of creating a new one?
        </p>
        <div className="flex flex-col gap-2">
          {matchedIssueId && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/issue/${matchedIssueId}`)}
            >
              👁 View Existing Issue
            </Button>
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={onCreateAnyway}
          >
            Create New Anyway
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
