import DashboardLayout from '../../components/layout/DashboardLayout';
import RaiseIssueForm from '../../components/student/RaiseIssueForm';

export default function RaiseIssue() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Raise an Issue</h1>
        <p className="text-sm text-gray-500 mb-6">
          Describe your issue and our AI will auto-fill the details. You can always edit before submitting.
        </p>
        <RaiseIssueForm />
      </div>
    </DashboardLayout>
  );
}
