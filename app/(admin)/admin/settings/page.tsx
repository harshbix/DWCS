'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Settings, Shield, Building, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { profile, logout } = useAuth();
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="settings" setActiveTab={(tab) => router.push(`/admin/${tab === 'dashboard' ? '' : tab}`)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="flex flex-col gap-6 p-4 sm:p-6 w-full max-w-lg mx-auto">
            <div>
              <h1 className="text-xl font-bold text-text-primary">System Settings</h1>
              <p className="text-xs text-text-secondary mt-0.5">Municipal organization control and profile settings</p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" /> Municipal Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-outline/5">
                  <span className="text-text-secondary">Org ID</span>
                  <span className="font-mono font-bold text-text-primary">{profile?.organization_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-secondary">Authority Region</span>
                  <span className="font-bold text-text-primary">Dar es Salaam (TMWA)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Profile Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-outline/5">
                  <span className="text-text-secondary">Name</span>
                  <span className="font-bold text-text-primary">{profile?.full_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline/5">
                  <span className="text-text-secondary">Email</span>
                  <span className="font-bold text-text-primary">{profile?.email}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-secondary">Role</span>
                  <span className="font-bold text-text-primary capitalize">{profile?.primaryRole}</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={logout} className="w-full text-error border-error/20 hover:bg-error/5">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out Admin Account
            </Button>
          </div>
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
