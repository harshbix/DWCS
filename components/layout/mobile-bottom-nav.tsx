'use client';

import React, { useRef, useEffect, useState } from 'react';
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
}

const citizenNav: NavItem[] = [
  { label: 'Home',       href: '/citizen',            icon: <Home className="h-5 w-5" /> },
  { label: 'Schedule',   href: '/citizen/schedule',   icon: <CalendarClock className="h-5 w-5" /> },
  { label: 'Payments',   href: '/citizen/payments',   icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Complaints', href: '/citizen/complaints', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Profile',    href: '/citizen/profile',    icon: <User className="h-5 w-5" /> },
];

const driverNav: NavItem[] = [
  { label: 'Dashboard', href: '/driver',          icon: <Truck className="h-5 w-5" /> },
  { label: 'Routes',    href: '/driver/routes',   icon: <Navigation className="h-5 w-5" /> },
  { label: 'Tracking',  href: '/driver/tracking', icon: <MapPin className="h-5 w-5" /> },
  { label: 'Reports',   href: '/driver/reports',  icon: <FileText className="h-5 w-5" /> },
  { label: 'Profile',   href: '/driver/profile',  icon: <User className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin',            icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Citizens',  href: '/admin/citizens',   icon: <Users className="h-5 w-5" /> },
  { label: 'Alerts',    href: '/admin/complaints', icon: <ShieldAlert className="h-5 w-5" /> },
  { label: 'Reports',   href: '/admin/reports',    icon: <FileText className="h-5 w-5" /> },
  { label: 'Settings',  href: '/admin/settings',   icon: <Settings className="h-5 w-5" /> },
];

function getNavItems(role: UserRoleName): NavItem[] {
  if (role === 'admin' || role === 'supervisor') return adminNav;
  if (role === 'driver') return driverNav;
  return citizenNav;
}

function isItemActive(pathname: string, item: NavItem, index: number): boolean {
  // Home/root items require exact match
  const isRoot = item.href.split('/').length === 2;
  return isRoot ? pathname === item.href : pathname.startsWith(item.href);
}

interface MobileBottomNavProps {
  role: UserRoleName;
}

/**
 * MobileBottomNav
 *
 * Animated bottom navigation bar for mobile devices (<md breakpoint).
 * Features:
 * - Sliding pill indicator that animates between active tabs
 * - Spring-based CSS transition for the indicator
 * - Accessible aria-current labels
 * - Safe area inset padding for notched devices
 */
export const MobileBottomNav = React.memo(function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(role);
  const navRef = useRef<HTMLElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = navItems.findIndex((item, i) => isItemActive(pathname, item, i));

  // Calculate pill position based on the active button's bounding rect
  useEffect(() => {
    const nav = navRef.current;
    const activeButton = itemRefs.current[activeIndex];
    if (!nav || !activeButton) return;

    const navRect = nav.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();

    // Center a 40px pill under the icon
    const pillWidth = 44;
    const centerX = btnRect.left - navRect.left + btnRect.width / 2;

    setPillStyle({
      left: centerX - pillWidth / 2,
      width: pillWidth,
    });
  }, [activeIndex, pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Mobile navigation"
      className={cn(
        'md:hidden',
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-stretch',
        'bg-surface-container-lowest border-t border-outline/8',
        'pb-safe',
        'shadow-[0_-2px_20px_rgba(0,0,0,0.06)]'
      )}
    >
      {/* Animated sliding pill indicator */}
      {pillStyle && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2 h-8 rounded-xl bg-primary/10 transition-all duration-300"
          style={{
            left: pillStyle.left,
            width: pillStyle.width,
            transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        />
      )}

      {navItems.map((item, index) => {
        const isActive = isItemActive(pathname, item, index);

        return (
          <button
            key={item.href}
            ref={(el) => { itemRefs.current[index] = el; }}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 px-1',
              'text-[9px] font-bold tracking-wide uppercase',
              'transition-colors duration-150',
              'focus:outline-none',
              'select-none active:scale-95',
              isActive ? 'text-primary' : 'text-on-surface/40 hover:text-on-surface/70'
            )}
          >
            <span
              className={cn(
                'relative z-10 flex items-center justify-center h-7 w-10',
                'transition-transform duration-200',
                isActive && 'scale-110'
              )}
            >
              {item.icon}
            </span>
            <span className="relative z-10 leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';
