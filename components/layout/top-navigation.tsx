'use client';

import React, { useState } from 'react';
import {
  Bell,
  User,
  LogOut,
  Leaf,
  Settings,
  HelpCircle,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/format';

/**
 * TopNavigation
 *
 * A clean, focused header bar. Responsibilities:
 * - Brand identity (EcoCollect / MWMA)
 * - Sidebar toggle on admin layouts
 * - Live notifications drawer
 * - Profile menu with sign-out
 *
 * Intentionally does NOT include a role-switcher (that was confusing UX).
 * The user's role is determined server-side and shown in their profile badge.
 */
export function TopNavigation() {
  const { profile, logout, role } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(profile?.id);
  const { toggleOpen, isOpen } = useSidebarStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const roleLabel =
    role === 'admin' ? 'Admin' : role === 'driver' ? 'Collector' : 'Citizen';
  const roleBg =
    role === 'admin'
      ? 'bg-warning/10 text-warning'
      : role === 'driver'
      ? 'bg-info/10 text-info'
      : 'bg-primary/10 text-primary';

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-outline/10 bg-surface-container-lowest px-4 shadow-elevation-1 select-none">
      {/* Left: Brand + Sidebar toggle */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle — only visible in admin layout on desktop */}
        {role === 'admin' && (
          <button
            onClick={toggleOpen}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg text-on-surface/50 hover:bg-surface-container hover:text-on-surface transition-all duration-150 cursor-pointer focus:outline-none"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none text-on-surface">EcoCollect</span>
            <span className="text-[9px] text-on-surface/40 font-medium tracking-widest uppercase mt-0.5">
              Mbeya · MWMA
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-1.5">

        {/* ── Notifications ────────────────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-on-surface/60 hover:bg-surface-container hover:text-on-surface transition-all duration-150 cursor-pointer focus:outline-none"
            aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-error text-[8px] font-bold text-white ring-2 ring-surface-container-lowest">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications panel */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-outline/10 bg-surface-container-lowest shadow-floating animate-scale-in overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-outline/5">
                  <div>
                    <p className="font-bold text-sm text-on-surface">Notifications</p>
                    {unreadCount > 0 && (
                      <p className="text-[10px] text-on-surface/50 mt-0.5">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="h-6 w-6 flex items-center justify-center rounded-lg text-on-surface/40 hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                      aria-label="Close notifications"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-outline/5">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="h-10 w-10 rounded-full bg-surface-container flex items-center justify-center">
                        <Bell className="h-5 w-5 text-on-surface/30" />
                      </div>
                      <p className="text-xs text-on-surface/40 font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                        className={cn(
                          'w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-surface-container-low/50',
                          !n.isRead && 'bg-primary/4'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1 h-2 w-2 rounded-full shrink-0',
                            n.isRead ? 'bg-transparent' : 'bg-primary'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-on-surface leading-tight">
                              {n.title}
                            </p>
                            <span className="text-[9px] text-on-surface/40 shrink-0 mt-0.5">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface/60 leading-snug mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Profile ───────────────────────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 h-9 rounded-xl px-2 hover:bg-surface-container transition-all duration-150 cursor-pointer focus:outline-none"
            aria-label="Open profile menu"
          >
            <Avatar
              fallback={profile?.full_name?.substring(0, 2).toUpperCase() ?? 'EC'}
              className="h-7 w-7 text-[10px]"
            />
            <span
              className={cn(
                'hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                roleBg
              )}
            >
              {roleLabel}
            </span>
          </button>

          {/* Profile panel */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-outline/10 bg-surface-container-lowest shadow-floating animate-scale-in overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-outline/5">
                  <p className="font-semibold text-sm text-on-surface leading-none">
                    {profile?.full_name ?? 'Guest User'}
                  </p>
                  <p className="text-[10px] text-on-surface/50 mt-1 leading-none">
                    {profile?.email ?? '—'}
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                      roleBg
                    )}
                  >
                    {roleLabel}
                  </span>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer">
                    <User className="h-4 w-4 text-on-surface/50" />
                    Account Settings
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer">
                    <HelpCircle className="h-4 w-4 text-on-surface/50" />
                    Support Hub
                  </button>
                  <div className="h-px bg-outline/5 my-1.5" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-error hover:bg-error/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-error" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
