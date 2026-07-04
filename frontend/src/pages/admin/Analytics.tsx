import { getStats } from '../../api/issueApi';
import { useFetch } from '../../hooks/useFetch';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
import Loader from '../../components/common/Loader';

export default function Analytics() {
  const { data: stats, loading, error } = useFetch(getStats);

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of all campus maintenance issues</p>
        </div>

        {loading && <Loader />}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {stats && <AnalyticsCharts stats={stats} />}
      </div>
    </DashboardLayout>
  );
}
