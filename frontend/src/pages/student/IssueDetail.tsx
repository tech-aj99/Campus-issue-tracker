import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById } from '../../api/issueApi';
import { getIssueLogs, IssueLog } from '../../api/commentApi';
import { useFetch } from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import IssueTimeline from '../../components/common/IssueTimeline';
import CommentsSection from '../../components/common/CommentsSection';
import { formatDateTime } from '../../utils/formatters';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: issue, loading, error } = useFetch(() => getIssueById(id!));

  const [logs, setLogs] = useState<IssueLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [imageExpanded, setImageExpanded] = useState(false);

  const fetchLogs = useCallback(() => {
    if (!id) return;
    setLogsLoading(true);
    getIssueLogs(id)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, [id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
          ← Back
        </Button>

        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {issue && (
          <>
            {/* ── Issue card ── */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Photo banner */}
              {issue.imageUrl && (
                <div className="relative">
                  <img
                    src={issue.imageUrl}
                    alt="Issue photo"
                    onClick={() => setImageExpanded(!imageExpanded)}
                    className={`w-full object-cover cursor-pointer transition-all duration-300 ${
                      imageExpanded ? 'max-h-[480px]' : 'max-h-52'
                    }`}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      📸 {imageExpanded ? 'Click to collapse' : 'Click to expand'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent" />
                </div>
              )}

              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-lg font-bold text-gray-900">{issue.title}</h1>
                  <div className="flex gap-2 shrink-0">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">{issue.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-gray-700">
                      {issue.room.floor.building.name} › Floor {issue.room.floor.number} › Room{' '}
                      {issue.room.number}
                    </p>
                  </div>
                  {issue.category && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Category</p>
                      <p className="text-gray-700 capitalize">{issue.category}</p>
                    </div>
                  )}
                  {issue.department && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Department</p>
                      <p className="text-gray-700 capitalize">{issue.department}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Raised On</p>
                    <p className="text-gray-700">{formatDateTime(issue.createdAt)}</p>
                  </div>
                </div>

                {issue.tags?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {issue.assignment ? (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Assigned To</p>
                    <p className="text-sm font-medium text-gray-800">{issue.assignment.staff.name}</p>
                    <p className="text-xs text-gray-500">{issue.assignment.staff.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Assigned on {formatDateTime(issue.assignment.assignedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-500">⏳ Not yet assigned to a staff member</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
                <span>📋</span> Activity Timeline
              </h2>
              {logsLoading ? (
                <div className="text-sm text-gray-400 py-4 flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Loading timeline…
                </div>
              ) : (
                <IssueTimeline logs={logs} />
              )}
            </div>

            {/* ── Comments ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <CommentsSection issueId={issue.id} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
