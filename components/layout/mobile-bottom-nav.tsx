'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  CalendarClock,
  CreditCard,
  AlertTriangle,
  User,
  Truck,
  MapPin,
  Navigation,
  FileText,
  BarChart2,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { UserRoleName } from '@/types/database';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  matchSegments?: string[];
}

const citizenNav: NavItem[] = [
  { label: 'Home', href: '/citizen', icon: <Home className="h-5 w-5" /> },
  { label: 'Schedule', href: '/citizen/schedule', icon: <CalendarClock className="h-5 w-5" /> },
  { label: 'Payments', href: '/citizen/payments', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Complaints', href: '/citizen/complaints', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Profile', href: '/citizen/profile', icon: <User className="h-5 w-5" /> },
];

const driverNav: NavItem[] = [
  { label: 'Dashboard', href: '/driver', icon: <Truck className="h-5 w-5" /> },
  { label: 'Routes', href: '/driver/routes', icon: <Navigation className="h-5 w-5" /> },
  { label: 'Tracking', href: '/driver/tracking', icon: <MapPin className="h-5 w-5" /> },
  { label: 'Reports', href: '/driver/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Profile', href: '/driver/profile', icon: <User className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Citizens', href: '/admin/citizens', icon: <Users className="h-5 w-5" /> },
  { label: 'Complaints', href: '/admin/complaints', icon: <ShieldAlert className="h-5 w-5" /> },
  { label: 'Reports', href: '/admin/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

function getNavItems(role: UserRoleName): NavItem[] {
  if (role === 'admin' || role === 'supervisor') return adminNav;
  if (role === 'driver') return driverNav;
  return citizenNav;
}

interface MobileBottomNavProps {
  role: UserRoleName;
}

/**
 * Mobile-first fixed bottom navigation bar.
 * Only visible on screens < md breakpoint.
 * Uses Next.js usePathname for active state detection.
 */
export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(role);

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        'md:hidden',
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-stretch',
        'bg-surface-container-lowest border-t border-outline/10',
        'pb-safe', // safe-area inset for notched devices
        'shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
      )}
    >
      {navItems.map((item) => {
        // Active if pathname exactly matches or starts with the item href (non-root)
        const isExact = item.href.split('/').length === 2; // e.g. /citizen, /driver, /admin
        const isActive = isExact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 px-1',
              'text-[10px] font-semibold transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'select-none',
              isActive
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center h-7 w-10 rounded-xl transition-all duration-200',
                isActive && 'bg-primary/10'
              )}
            >
              {item.icon}
            </span>
            <span className={cn('leading-none', isActive && 'font-bold')}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
