'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Phone, Mail, BadgeCheck } from 'lucide-react';

export default function DriverProfilePage() {
  const { profile, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-text-primary">Driver Profile</h1>

          <div className="bg-gradient-to-br from-tertiary to-tertiary-container text-white rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/20">
              {profile?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold">{profile?.full_name}</h3>
              <p className="text-[10px] text-on-tertiary-container/70 mt-0.5">Municipal Waste Collector</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline/10 divide-y divide-outline/5">
            <div className="flex items-center gap-3 p-4">
              <Phone className="h-4 w-4 text-text-secondary shrink-0" />
              <div>
                <p className="text-[10px] text-text-secondary">Phone</p>
                <p className="text-sm font-semibold text-text-primary">{profile?.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Mail className="h-4 w-4 text-text-secondary shrink-0" />
              <div>
                <p className="text-[10px] text-text-secondary">Email</p>
                <p className="text-sm font-semibold text-text-primary">{profile?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <BadgeCheck className="h-4 w-4 text-text-secondary shrink-0" />
              <div>
                <p className="text-[10px] text-text-secondary">Account Status</p>
                <p className="text-sm font-semibold text-text-primary capitalize">{profile?.status || 'active'}</p>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={logout} className="w-full text-error border-error/20 hover:bg-error/5">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out Driver Account
          </Button>
        </div>
      </main>
      <MobileBottomNav role="driver" />
    </div>
  );
}
