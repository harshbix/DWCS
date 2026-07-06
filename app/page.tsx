'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CitizenPortal } from '@/components/dashboard/citizen-portal';
import { DriverPortal } from '@/components/dashboard/driver-portal';
import { AdminPortal } from '@/components/dashboard/admin-portal';

/**
 * Root Dashboard preview page.
 * Dynamically binds views and roles depending on active Zustand selectors.
 */
export default function RootDashboardPage() {
  const { role } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Align default tab selections when roles toggle
  useEffect(() => {
    if (role === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('home');
    }
  }, [role]);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {role === 'citizen' && (
        <CitizenPortal activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      {role === 'driver' && (
        <DriverPortal activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      {role === 'admin' && (
        <AdminPortal activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </DashboardLayout>
  );
}
