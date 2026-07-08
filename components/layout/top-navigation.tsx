'use client';

import React from 'react';
import { Bell, User, HelpCircle, LogOut, ChevronDown, Check, Shield, Truck } from 'lucide-react';
import { useAuthStore, UserRole } from '@/stores/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useSidebarStore } from '@/stores/sidebar.store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { toast } from '@/utils/toast';
import { formatRelativeTime } from '@/utils/format';

/**
 * Top Navigation bar composing notification drawers, quick info sheets, and portal role togglers.
 * Notifications are sourced live from the database via useNotifications hook.
 */
export function TopNavigation() {
  const { role, setRole } = useAuthStore();
  const { profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(profile?.id);
  const { toggleOpen, isOpen } = useSidebarStore();

  const handleRoleChange = (targetRole: UserRole) => {
    const roles = profile?.roles ?? [];
    if (roles.includes('admin') || roles.includes('supervisor') || roles.includes(targetRole)) {
      setRole(targetRole);
    } else {
      toast.error('Access Denied', `You do not have the ${targetRole} portal role assigned.`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline/10 bg-surface-container-lowest px-4 shadow-xs select-none">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        {/* Collapse Trigger for Sidebar in Admin layout */}
        {role === 'admin' && (
          <button
            onClick={toggleOpen}
            className="mr-2 rounded-lg p-1.5 hover:bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <svg
              className={cn('h-5 w-5 transform transition-transform', isOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm tracking-wider">
          TZ
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight text-text-primary">EcoCollect</span>
          <span className="text-[10px] text-text-secondary font-medium tracking-wider uppercase">Tanzania (TMWA)</span>
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Role Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 rounded-lg border border-outline/10 bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-all cursor-pointer focus:outline-none">
              <span className="capitalize">{role} Portal</span>
              <ChevronDown className="h-3 w-3 text-text-secondary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right">
            <DropdownMenuItem onClick={() => handleRoleChange('citizen')}>
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center"><User className="mr-2 h-4 w-4 text-primary" /> Citizen</span>
                {role === 'citizen' && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('driver')}>
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center"><Truck className="mr-2 h-4 w-4 text-tertiary" /> Driver</span>
                {role === 'driver' && <Check className="h-4 w-4 text-tertiary" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center"><Shield className="mr-2 h-4 w-4 text-yellow-600" /> Admin</span>
                {role === 'admin' && <Check className="h-4 w-4 text-yellow-600" />}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Bell — sourced from database */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-colors cursor-pointer focus:outline-none"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white ring-2 ring-surface-container-lowest">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-80 p-2">
            <div className="flex items-center justify-between border-b border-outline/5 px-2 pb-2 mb-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="flex flex-col max-h-72 overflow-y-auto divide-y divide-outline/5">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-xs text-text-secondary">
                  <Bell className="h-6 w-6 mx-auto mb-2 text-outline" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    className={cn(
                      'py-2.5 px-2 flex flex-col space-y-0.5 hover:bg-surface-container-low/50 rounded-md transition-colors text-left w-full',
                      !n.isRead && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-text-primary leading-tight">{n.title}</span>
                      <span className="text-[9px] text-text-secondary shrink-0 ml-2">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-normal">{n.message}</p>
                    {!n.isRead && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-0.5 self-end" />
                    )}
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Avatar Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-1.5 rounded-lg p-1 hover:bg-surface-container-low cursor-pointer focus:outline-none">
              <Avatar fallback={profile?.full_name?.substring(0, 2).toUpperCase() ?? 'EM'} className="h-8 w-8" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56 p-1">
            <div className="px-3 py-2 border-b border-outline/5 mb-1.5">
              <p className="font-semibold text-xs leading-none text-text-primary">{profile?.full_name ?? 'Guest User'}</p>
              <p className="text-[10px] leading-none text-text-secondary mt-1">{profile?.email ?? 'guest@example.com'}</p>
            </div>
            <DropdownMenuItem className="text-xs">
              <User className="mr-2 h-4 w-4 text-text-secondary" /> Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <HelpCircle className="mr-2 h-4 w-4 text-text-secondary" /> Support Hub
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-xs text-error hover:bg-error/5">
              <LogOut className="mr-2 h-4 w-4 text-error" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
