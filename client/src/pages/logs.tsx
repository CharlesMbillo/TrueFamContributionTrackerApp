import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';

interface SystemLog {
  id: number;
  level: string;
  message: string;
  service: string;
  data?: string;
  timestamp: string;
}

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'ERROR':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'WARNING':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'INFO':
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'ERROR':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'INFO':
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
};

export default function Logs() {
  const [, setLocation] = useLocation();

  const { data: logs = [], isLoading } = useQuery<SystemLog[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-medium">System Logs</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Logs List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No logs available</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 card-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={`text-xs ${getLevelColor(log.level)}`}>
                        {log.level}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.service}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {log.message}
                    </p>
                    {log.data && (
                      <details className="text-xs text-gray-600 dark:text-gray-400">
                        <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                          Show details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.data), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
