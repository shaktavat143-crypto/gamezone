import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ConnectionStatus } from '../types.js';

interface ConnectionBannerProps {
  status: ConnectionStatus;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ status }) => {
  const [showRestored, setShowRestored] = useState(false);
  const [prevStatus, setPrevStatus] = useState<ConnectionStatus>(status);

  useEffect(() => {
    if (prevStatus === 'reconnecting' && status === 'connected') {
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    }
    setPrevStatus(status);
  }, [status, prevStatus]);

  if (status === 'connected' && !showRestored) {
    return null;
  }

  return (
    <aside aria-label="Connection Status Alerts" className="fixed bottom-4 left-4 z-50 max-w-sm transition-all duration-300">
      {status === 'reconnecting' && (
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-950/90 px-4 py-2.5 text-xs font-medium text-amber-200 shadow-xl border border-amber-600/50 backdrop-blur-md">
          <RefreshCw className="h-4 w-4 animate-spin text-amber-400 shrink-0" />
          <span>Connection lost. Reconnecting to party...</span>
        </div>
      )}

      {status === 'disconnected' && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-950/90 px-4 py-2.5 text-xs font-medium text-rose-200 shadow-xl border border-rose-600/50 backdrop-blur-md">
          <WifiOff className="h-4 w-4 text-rose-400 shrink-0" />
          <span>Disconnected from server. Check your network.</span>
        </div>
      )}

      {showRestored && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-950/90 px-4 py-2.5 text-xs font-medium text-emerald-200 shadow-xl border border-emerald-600/50 backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Connected again ✓</span>
        </div>
      )}
    </aside>
  );
};
