import { useState } from 'react';
import { getAllIssues } from '../../api/issueApi';
import { useFetch } from '../../hooks/useFetch';
import { Issue, IssueStatus } from '../../types/issue';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import AssignStaffModal from '../../components/admin/AssignStaffModal';
import { formatDate, truncate } from '../../utils/formatters';

export default function AllIssues() {
  const { data: issues, loading, error, refetch } = useFetch(getAllIssues);
  const [filter, setFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const [assigningIssue, setAssigningIssue] = useState<Issue | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? issues : issues?.filter((i) => i.status === filter);

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Issues</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered?.length ?? 0} issues</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && filtered && (
          filtered.length === 0 ? (
            <EmptyState icon="📋" title="No issues found" message="Try changing the filter." />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Title', 'Image', 'Status', 'Priority', 'Location', 'Raised By', 'Assigned To', 'Date', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px]">
                        {truncate(issue.title, 40)}
                      </td>
                      <td className="px-4 py-3">
                        {issue.imageUrl ? (
                          <button
                            onClick={() => setImageModalUrl(issue.imageUrl!)}
                            className="group relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-all focus:outline-none"
                            title="View image"
                          >
                            <img
                              src={issue.imageUrl}
                              alt="Issue"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            />
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {issue.room.floor.building.name} / {issue.room.number}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{issue.raisedBy.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {issue.assignment ? issue.assignment.staff.name : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(issue.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="secondary" onClick={() => setAssigningIssue(issue)}>
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Assign staff modal */}
      {assigningIssue && (
        <AssignStaffModal
          isOpen={!!assigningIssue}
          issueId={assigningIssue.id}
          onClose={() => setAssigningIssue(null)}
          onAssigned={() => { refetch(); setAssigningIssue(null); }}
        />
      )}

      {/* Image lightbox modal */}
      {imageModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => setImageModalUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageModalUrl(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              ✕ Close
            </button>
            <img
              src={imageModalUrl}
              alt="Issue full view"
              className="w-full rounded-xl shadow-2xl max-h-[80vh] object-contain bg-black"
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
