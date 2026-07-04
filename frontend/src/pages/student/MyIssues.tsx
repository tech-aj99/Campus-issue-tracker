import { Link } from 'react-router-dom';
import { getMyIssues } from '../../api/issueApi';
import { useFetch } from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import IssueCard from '../../components/student/IssueCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export default function MyIssues() {
  const { data: issues, loading, error } = useFetch(getMyIssues);

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Issues</h1>
            <p className="text-sm text-gray-500 mt-0.5">{issues?.length ?? 0} total issues</p>
          </div>
          <Link to="/raise-issue">
            <Button size="sm">➕ Raise Issue</Button>
          </Link>
        </div>

        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && issues && (
          issues.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No issues yet"
              message="You haven't raised any issues. Raise your first one now."
              action={<Link to="/raise-issue"><Button>Raise Issue</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
