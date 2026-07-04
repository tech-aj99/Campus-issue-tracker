import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { getMyIssues } from '../../api/issueApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: issues, loading } = useFetch(getMyIssues);

  const open = issues?.filter((i) => i.status === 'OPEN').length ?? 0;
  const inProgress = issues?.filter((i) => i.status === 'IN_PROGRESS').length ?? 0;
  const resolved = issues?.filter((i) => i.status === 'RESOLVED').length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your campus maintenance issues</p>
        </div>

        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Open', count: open, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
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

        <div className="flex flex-wrap gap-3">
          <Link to="/raise-issue">
            <Button size="lg">➕ Raise New Issue</Button>
          </Link>
          <Link to="/my-issues">
            <Button variant="secondary" size="lg">📋 View My Issues</Button>
          </Link>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          <p className="font-medium mb-1">✨ AI-Powered Issue Analysis</p>
          <p>When you raise an issue, our AI automatically categorizes it, sets the priority, and checks for duplicates — saving you time.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
