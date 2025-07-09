import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { formatKES } from '@/lib/currency';
import { useWebSocket } from '@/lib/websocket';

interface Notification {
  id: string;
  message: string;
  amount: string;
  sender: string;
  visible: boolean;
}

export default function LiveNotificationBanner() {
  const [notification, setNotification] = useState<Notification | null>(null);

  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'NEW_CONTRIBUTION') {
      const { data } = message;
      setNotification({
        id: data.id.toString(),
        message: 'New contribution received!',
        amount: data.amount,
        sender: data.senderName,
        visible: true
      });

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  });

  const dismissNotification = () => {
    setNotification(null);
  };

  if (!notification?.visible) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 bg-secondary text-white rounded-lg p-3 card-shadow notification-slide-in z-50">
      <div className="flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
          <p className="text-xs opacity-90">
            {formatKES(notification.amount)} from {notification.sender}
          </p>
        </div>
        <button
          onClick={dismissNotification}
          className="text-white opacity-75 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
