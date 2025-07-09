import { useQuery } from '@tanstack/react-query';
import { formatKES } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: number;
  name: string;
  isActive: boolean;
}

interface Stats {
  total: number;
  contributors: number;
}

export default function AppHeader() {
  const { data: campaign } = useQuery<Campaign>({
    queryKey: ['/api/campaigns/active'],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/contributions/stats'],
  });

  return (
    <div className="bg-primary text-white px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Contribution Tracker</h1>
          <p className="text-blue-200 text-sm">Real-time monitoring active</p>
        </div>
        <div className="relative">
          <div className="status-indicator w-3 h-3 bg-secondary rounded-full"></div>
        </div>
      </div>
      
      {campaign && (
        <div className="bg-white bg-opacity-10 rounded-lg p-3 mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Current Campaign</span>
            <Badge variant="secondary" className="text-xs">
              {campaign.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm">{campaign.name}</p>
          <div className="flex justify-between mt-2 text-sm">
            <span>
              Total: <span className="font-medium">{formatKES(stats?.total || 0)}</span>
            </span>
            <span>
              Contributors: <span className="font-medium">{stats?.contributors || 0}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
