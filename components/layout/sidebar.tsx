'use client';

import React from 'react';
import { BarChart2, Shield, Users, Map, FileText, Settings, ChevronLeft, HelpCircle } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { cn } from '@/utils/cn';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors select-none cursor-pointer focus:outline-none',
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-text-secondary hover:bg-surface-container-low hover:text-text-primary',
        collapsed ? 'justify-center px-2' : 'justify-start space-x-3'
      )}
      title={label}
    >
      <div className={cn('h-5 w-5 shrink-0', active ? 'text-primary' : 'text-text-secondary')}>
        {icon}
      </div>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * Collapsible Administrative Navigation Sidebar.
 */
export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { isOpen, toggleOpen } = useSidebarStore();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <BarChart2 /> },
    { id: 'citizens', label: 'Citizens', icon: <Users /> },
    { id: 'tracking', label: 'Live Tracking', icon: <Map /> },
    { id: 'reports', label: 'Reports & Audits', icon: <FileText /> },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-outline/10 bg-surface-container-lowest transition-all duration-300 select-none shrink-0',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Menu Collection */}
      <div className="flex-1 space-y-1.5 p-3">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            collapsed={!isOpen}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>

      {/* Footer Settings Area */}
      <div className="border-t border-outline/5 p-3 space-y-1.5">
        <SidebarItem
          icon={<Settings />}
          label="Settings"
          active={activeTab === 'settings'}
          collapsed={!isOpen}
          onClick={() => setActiveTab('settings')}
        />
        
        {/* Collapse Button */}
        <button
          onClick={toggleOpen}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-colors cursor-pointer focus:outline-none',
            !isOpen ? 'justify-center px-2' : 'justify-start space-x-3'
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 transform transition-transform', !isOpen && 'rotate-180')} />
          {isOpen && <span>Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
}
