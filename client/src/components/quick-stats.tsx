import { useQuery } from '@tanstack/react-query';
import { Calendar, TrendingUp } from 'lucide-react';
import { formatKES } from '@/lib/currency';

interface Stats {
  total: number;
  today: number;
  week: number;
  contributors: number;
}

export default function QuickStats() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/contributions/stats'],
  });

  return (
    <div className="px-4 py-4 bg-surface dark:bg-gray-800">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Today</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatKES(stats?.today || 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center">
              <Calendar className="text-secondary w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">This Week</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatKES(stats?.week || 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-accent bg-opacity-10 rounded-full flex items-center justify-center">
              <TrendingUp className="text-accent w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
