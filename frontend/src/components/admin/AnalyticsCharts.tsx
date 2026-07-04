import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { IssueStats } from '../../types/issue';

const STATUS_PALETTE: Record<string, string> = {
  OPEN: '#6366f1',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
};

const PIE_COLORS = ['#6366f1','#f59e0b','#10b981','#f43f5e','#3b82f6','#a855f7','#14b8a6','#64748b'];

interface Props {
  stats: IssueStats;
}

export default function AnalyticsCharts({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Issues by Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Issues by Status</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.statusData} barSize={40}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickFormatter={(v) => v.replace('_', ' ')} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip formatter={(v, n) => [v, String(n).replace('_', ' ')]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {stats.statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_PALETTE[entry.name] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Issues by Category */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Issues by Category</h3>
        {stats.categoryData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No category data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.categoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.categoryData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconSize={10} iconType="circle" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Issues by Building */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Issues by Building</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.buildingData} barSize={50}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
