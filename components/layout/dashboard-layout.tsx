'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { TopNavigation } from './top-navigation';
import { Sidebar } from './sidebar';
import { cn } from '@/utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Shell Layout composing headers, sidebars, and role boundaries dynamically.
 */
export function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const { role } = useAuthStore();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-text-primary">
      {/* Universal Top Header */}
      <TopNavigation />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Render Collapsible Sidebar only for Admin Portal */}
        {role === 'admin' && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Dynamic Page content */}
        <main className="flex-1 overflow-y-auto bg-surface/30">
          {children}
        </main>
      </div>
    </div>
  );
}
