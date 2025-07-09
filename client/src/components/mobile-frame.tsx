import { ReactNode } from 'react';
import StatusBar from './status-bar';
import BottomNavigation from './bottom-navigation';
import FloatingActionButton from './floating-action-button';
import LiveNotificationBanner from './live-notification-banner';

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="mobile-frame min-h-screen bg-white dark:bg-gray-900 relative">
      <StatusBar />
      <div className="pb-16"> {/* Bottom navigation spacing */}
        {children}
      </div>
      <BottomNavigation />
      <FloatingActionButton />
      <LiveNotificationBanner />
    </div>
  );
}
