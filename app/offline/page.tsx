'use client';

import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="h-16 w-16 bg-error-container rounded-full flex items-center justify-center text-error animate-pulse mb-6">
        <WifiOff className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-bold text-on-surface mb-2">Connection Lost</h1>
      <p className="text-sm text-on-surface/60 max-w-xs mb-6">
        EcoCollect cannot connect to the servers right now. Check your Tanzanian network signal (Airtel, Vodacom, Tigo, Halotel) and try again.
      </p>
      <Button onClick={handleRetry} className="flex items-center gap-2">
        <RotateCw className="h-4 w-4" />
        Retry Connection
      </Button>
    </div>
  );
}
