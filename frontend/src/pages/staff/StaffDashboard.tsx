import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { getAssignedIssues } from '../../api/issueApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { data: issues, loading } = useFetch(getAssignedIssues);

  const open = issues?.filter((i) => i.status === 'OPEN').length ?? 0;
  const inProgress = issues?.filter((i) => i.status === 'IN_PROGRESS').length ?? 0;
  const resolved = issues?.filter((i) => i.status === 'RESOLVED').length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and resolve campus maintenance issues</p>
        </div>

        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Pending', count: open, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
              { label: 'In Progress', count: inProgress, color: 'border-yellow-200 bg-yellow-50', text: 'text-yellow-700' },
              { label: 'Resolved', count: resolved, color: 'border-green-200 bg-green-50', text: 'text-green-700' },
            ].map((stat) => (
              <div key={stat.label} className={`border rounded-xl p-4 ${stat.color}`}>
                <p className={`text-2xl font-bold ${stat.text}`}>{stat.count}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <Link to="/assigned">
          <Button size="lg">🔧 View Assigned Issues</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
