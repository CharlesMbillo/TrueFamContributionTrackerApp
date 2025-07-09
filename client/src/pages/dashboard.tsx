import AppHeader from '@/components/app-header';
import QuickStats from '@/components/quick-stats';
import RecentTransactions from '@/components/recent-transactions';
import SystemStatus from '@/components/system-status';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <QuickStats />
      <RecentTransactions />
      <SystemStatus />
    </div>
  );
}
