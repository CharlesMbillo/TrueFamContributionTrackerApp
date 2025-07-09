import { useQuery } from '@tanstack/react-query';
import { Smartphone, Mail, CreditCard } from 'lucide-react';
import { formatKES } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface Contribution {
  id: number;
  senderName: string;
  amount: string;
  memberId: string;
  date: string;
  source: string;
  platform: string;
  createdAt: string;
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'm-pesa':
    case 'airtel':
      return <Smartphone className="text-primary w-4 h-4" />;
    case 'venmo':
    case 'zelle':
      return <Mail className="text-secondary w-4 h-4" />;
    case 'cash app':
      return <CreditCard className="text-accent w-4 h-4" />;
    default:
      return <Smartphone className="text-primary w-4 h-4" />;
  }
};

const getPlatformBgColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'm-pesa':
    case 'airtel':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'venmo':
    case 'zelle':
      return 'bg-green-100 dark:bg-green-900';
    case 'cash app':
      return 'bg-orange-100 dark:bg-orange-900';
    default:
      return 'bg-blue-100 dark:bg-blue-900';
  }
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export default function RecentTransactions() {
  const [, setLocation] = useLocation();
  
  const { data: contributions = [] } = useQuery<Contribution[]>({
    queryKey: ['/api/contributions'],
  });

  const recentContributions = contributions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="px-4 pb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg card-shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-medium text-gray-900 dark:text-white">Recent Contributions</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/transactions')}
            className="text-primary hover:text-primary"
          >
            View All
          </Button>
        </div>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {recentContributions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No contributions yet
            </div>
          ) : (
            recentContributions.map((contribution) => (
              <div key={contribution.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getPlatformBgColor(contribution.platform)} rounded-full flex items-center justify-center`}>
                      {getPlatformIcon(contribution.platform)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contribution.senderName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{contribution.platform}</span>
                        <span>•</span>
                        <span>ID: {contribution.memberId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary">
                      +{formatKES(contribution.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getTimeAgo(contribution.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
