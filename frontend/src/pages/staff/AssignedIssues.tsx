import { getAssignedIssues } from '../../api/issueApi';
import { useFetch } from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AssignedIssueCard from '../../components/staff/AssignedIssueCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function AssignedIssues() {
  const { data: issues, loading, error, refetch } = useFetch(getAssignedIssues);

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Assigned Issues</h1>
          <p className="text-sm text-gray-500 mt-0.5">{issues?.length ?? 0} issues assigned to you</p>
        </div>

        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && issues && (
          issues.length === 0 ? (
            <EmptyState
              icon="🎉"
              title="No issues assigned"
              message="You have no issues assigned to you yet. Check back later."
            />
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <AssignedIssueCard key={issue.id} issue={issue} onUpdate={refetch} />
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
