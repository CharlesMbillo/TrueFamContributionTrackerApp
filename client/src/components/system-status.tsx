import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface ApiConfig {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

const getStatusColor = (isActive: boolean) => {
  return isActive ? 'bg-secondary' : 'bg-accent';
};

const getStatusText = (isActive: boolean) => {
  return isActive ? 'Active' : 'Pending';
};

export default function SystemStatus() {
  const { data: configs = [] } = useQuery<ApiConfig[]>({
    queryKey: ['/api/configs'],
  });

  const statusItems = [
    { name: 'SMS API Connection', type: 'SMS', isActive: true },
    { name: 'Gmail Integration', type: 'EMAIL', isActive: true },
    { name: 'Google Sheets Sync', type: 'SHEETS', isActive: true },
    { name: 'M-Pesa Webhook', type: 'MPESA', isActive: false },
  ];

  return (
    <div className="px-4 pb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg card-shadow p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">System Status</h3>
        
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(item.isActive)} rounded-full`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <Badge 
                variant={item.isActive ? "secondary" : "outline"}
                className={`text-xs ${item.isActive ? 'bg-secondary bg-opacity-10 text-secondary' : 'bg-accent bg-opacity-10 text-accent'}`}
              >
                {getStatusText(item.isActive)}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
