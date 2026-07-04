import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getStaffList } from '../../api/adminApi';
import { assignStaff } from '../../api/issueApi';
import { User } from '../../types/user';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';

interface Props {
  isOpen: boolean;
  issueId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignStaffModal({ isOpen, issueId, onClose, onAssigned }: Props) {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getStaffList()
      .then(setStaff)
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selected) { toast.error('Please select a staff member'); return; }
    setAssigning(true);
    try {
      await assignStaff(issueId, selected);
      toast.success('Staff assigned successfully');
      onAssigned();
      onClose();
    } catch {
      toast.error('Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Staff Member">
      {loading ? (
        <Loader text="Loading staff..." />
      ) : (
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2">
            {staff.map((member) => (
              <label
                key={member.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selected === member.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="staffMember"
                  value={member.id}
                  checked={selected === member.id}
                  onChange={(e) => setSelected(e.target.value)}
                  className="accent-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </label>
            ))}
            {staff.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No staff members found</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={assigning} onClick={handleAssign}>
              Assign
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
