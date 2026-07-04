import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { getStats } from '../../api/issueApi';
import { useSocket } from '../../hooks/useSocket';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

type EventType = 'issue:created' | 'issue:status_changed' | 'issue:assigned';

interface LiveEvent {
  id: string;
  event: EventType;
  issueId: string;
  title: string;
  status?: string;
  raisedBy?: string;
  assignedTo?: string;
  building?: string;
  priority?: string;
  timestamp: string;
}

const EVENT_META: Record<EventType, { icon: string; label: string; color: string; bg: string }> = {
  'issue:created': { icon: '🆕', label: 'New Issue', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
  'issue:status_changed': { icon: '🔄', label: 'Status Changed', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
  'issue:assigned': { icon: '👤', label: 'Assigned', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-100' },
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, loading, refetch } = useFetch(getStats);
  const [liveStats, setLiveStats] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [newEventFlash, setNewEventFlash] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Merge API stats into liveStats on first load
  useEffect(() => {
    if (stats) {
      const map: Record<string, number> = {};
      stats.statusData.forEach((s) => { map[s.name] = s.count; });
      setLiveStats(map);
    }
  }, [stats]);

  const handleIssueEvent = useCallback((event: EventType) => (data: Omit<LiveEvent, 'id' | 'event'>) => {
    const newEvent: LiveEvent = {
      ...data,
      id: `${Date.now()}-${Math.random()}`,
      event,
    };

    setIsLive(true);
    setNewEventFlash(true);
    setTimeout(() => setNewEventFlash(false), 800);

    setEvents((prev) => [newEvent, ...prev].slice(0, 50));

    // Optimistically update stat counters
    if (event === 'issue:created') {
      setLiveStats((prev) => ({
        ...prev,
        OPEN: (prev['OPEN'] || 0) + 1,
      }));
      // Re-fetch for accurate total
      setTimeout(() => refetch(), 500);
    }
    if (event === 'issue:status_changed' && data.status) {
      setLiveStats((prev) => {
        const updated = { ...prev };
        // Decrement old status (we refetch to recalculate accurately)
        if (data.status === 'IN_PROGRESS') {
          updated['OPEN'] = Math.max(0, (updated['OPEN'] || 0) - 1);
          updated['IN_PROGRESS'] = (updated['IN_PROGRESS'] || 0) + 1;
        } else if (data.status === 'RESOLVED') {
          updated['IN_PROGRESS'] = Math.max(0, (updated['IN_PROGRESS'] || 0) - 1);
          updated['RESOLVED'] = (updated['RESOLVED'] || 0) + 1;
        }
        return updated;
      });
    }

    // Scroll feed to top
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [refetch]);

  useSocket<Omit<LiveEvent, 'id' | 'event'>>('issue:created', handleIssueEvent('issue:created'));
  useSocket<Omit<LiveEvent, 'id' | 'event'>>('issue:status_changed', handleIssueEvent('issue:status_changed'));
  useSocket<Omit<LiveEvent, 'id' | 'event'>>('issue:assigned', handleIssueEvent('issue:assigned'));

  // Compute total from liveStats or fallback to API
  const total = stats?.total !== undefined
    ? stats.total + (events.filter(e => e.event === 'issue:created').length)
    : 0;

  const statCards = [
    {
      label: 'Total Issues',
      value: loading ? '—' : total,
      icon: '📋',
      border: 'border-l-4 border-l-slate-400',
      bg: 'bg-white',
      text: 'text-slate-800',
    },
    {
      label: 'Open',
      value: loading ? '—' : (liveStats['OPEN'] ?? 0),
      icon: '🔓',
      border: 'border-l-4 border-l-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      label: 'In Progress',
      value: loading ? '—' : (liveStats['IN_PROGRESS'] ?? 0),
      icon: '⚙️',
      border: 'border-l-4 border-l-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      label: 'Resolved',
      value: loading ? '—' : (liveStats['RESOLVED'] ?? 0),
      icon: '✅',
      border: 'border-l-4 border-l-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
          </div>
          {/* Live indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
            isLive
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'Live' : 'Connecting...'}
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} ${stat.border} rounded-xl p-3 md:p-4 shadow-sm transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base md:text-lg">{stat.icon}</span>
                </div>
                <p className={`text-xl md:text-2xl font-bold ${stat.text} transition-all duration-300 ${newEventFlash ? 'scale-110' : 'scale-100'}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main grid: quick actions + live feed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="md:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/all-issues" className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
                <span className="text-xl">📋</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">All Issues</p>
                  <p className="text-xs text-gray-400">View and manage</p>
                </div>
              </Link>
              <Link to="/analytics" className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition-all group">
                <span className="text-xl">📊</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-violet-700">Analytics</p>
                  <p className="text-xs text-gray-400">Charts & insights</p>
                </div>
              </Link>
            </div>

            {/* Category breakdown mini */}
            {stats?.categoryData && stats.categoryData.length > 0 && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">By Category</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                  {stats.categoryData.slice(0, 5).map((c) => {
                    const pct = stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0;
                    return (
                      <div key={c.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize text-gray-600 font-medium">{c.name}</span>
                          <span className="text-gray-400">{c.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Live Activity Feed */}
          <div className="md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Live Activity Feed
              </h2>
              {events.length > 0 && (
                <button
                  onClick={() => setEvents([])}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              ref={feedRef}
              className="flex-1 min-h-[300px] max-h-[420px] overflow-y-auto space-y-2 pr-1"
            >
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <span className="text-3xl mb-2">📡</span>
                  <p className="text-sm font-medium text-gray-500">Waiting for events...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Events appear here when students raise issues or staff update status
                  </p>
                </div>
              ) : (
                events.map((ev, idx) => {
                  const meta = EVENT_META[ev.event];
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-start gap-3 p-3 border rounded-xl ${meta.bg} transition-all duration-300 ${idx === 0 ? 'animate-[slideIn_0.3s_ease-out]' : ''}`}
                      style={{ animationFillMode: 'both' }}
                    >
                      <span className="text-lg mt-0.5 shrink-0">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                          {ev.priority && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[ev.priority] || 'bg-gray-100 text-gray-600'}`}>
                              {ev.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
                          {ev.title || ev.issueId}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ev.event === 'issue:created' && ev.raisedBy && `Raised by ${ev.raisedBy}`}
                          {ev.event === 'issue:status_changed' && ev.status && `→ ${ev.status.replace('_', ' ')}`}
                          {ev.event === 'issue:assigned' && 'Staff assigned'}
                          {ev.building && ` · ${ev.building}`}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 mt-1">{timeAgo(ev.timestamp)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Bottom CTA row */}
        <div className="flex gap-3 flex-wrap pt-2 border-t border-gray-100">
          <Link to="/all-issues"><Button size="lg">📋 All Issues</Button></Link>
          <Link to="/analytics"><Button variant="secondary" size="lg">📊 Analytics</Button></Link>
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
