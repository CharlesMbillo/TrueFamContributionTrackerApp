import { useQuery } from '@tanstack/react-query';
import { Smartphone, Mail, CreditCard, Search } from 'lucide-react';
import { useState } from 'react';
import { formatKES } from '@/lib/currency';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

interface Contribution {
  id: number;
  senderName: string;
  amount: string;
  memberId: string;
  date: string;
  source: string;
  platform: string;
  processed: boolean;
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

export default function Transactions() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contributions = [], isLoading } = useQuery<Contribution[]>({
    queryKey: ['/api/contributions'],
  });

  const filteredContributions = contributions.filter(contribution =>
    contribution.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contribution.memberId.includes(searchTerm) ||
    contribution.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-xl font-medium">All Transactions</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, member ID, or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="text-center py-8">Loading transactions...</div>
        ) : filteredContributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No transactions found matching your search.' : 'No transactions yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 card-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
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
                        <span>•</span>
                        <Badge variant={contribution.source === 'MANUAL' ? 'outline' : 'secondary'}>
                          {contribution.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary">
                      {formatKES(contribution.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(contribution.date).toLocaleDateString()}
                    </p>
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
