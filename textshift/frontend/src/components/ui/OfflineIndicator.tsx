// Offline Indicator Component (Mobile Optimization #45)
// Shows network status to users

import { useNetworkStatus } from '@/lib/mobile';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowOnlineMessage(true);
      const timer = setTimeout(() => {
        setShowOnlineMessage(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showOnlineMessage) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] px-4 py-2 text-center text-sm font-medium transition-all duration-300',
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-red-500 text-white'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be unavailable.</span>
          </>
        )}
      </div>
    </div>
  );
}

export default OfflineIndicator;
