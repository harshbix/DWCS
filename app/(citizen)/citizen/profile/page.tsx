'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, LogOut, Phone, Mail, MapPin } from 'lucide-react';

export default function CitizenProfilePage() {
  const { profile, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-text-primary">My Profile</h1>

          {/* Service Card */}
          <div className="bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] tracking-widest font-mono text-primary-container opacity-80">
                  TANZANIA WASTE AUTHORITY
                </p>
                <h3 className="text-lg font-bold mt-1">{profile?.full_name || 'EcoCollect Member'}</h3>
                <p className="text-[10px] text-primary-container opacity-70 mt-0.5">{profile?.email}</p>
              </div>
              <Badge variant="outline" className="text-white border-white/30">ACTIVE</Badge>
            </div>

            <div className="bg-white p-4 rounded-xl w-32 h-32 mx-auto flex items-center justify-center shadow-inner">
              <QrCode className="h-24 w-24 text-black" />
            </div>

            <div className="flex justify-between font-mono text-xs">
              <div>
                <p className="text-[8px] text-primary-container opacity-70">MEMBER NO</p>
                <p className="font-bold">WST-{profile?.id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-primary-container opacity-70">ZONE</p>
                <p className="font-bold">MBY-MUNICIPALITY</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
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
              <MapPin className="h-4 w-4 text-text-secondary shrink-0" />
              <div>
                <p className="text-[10px] text-text-secondary">Status</p>
                <p className="text-sm font-semibold text-text-primary capitalize">{profile?.status || 'active'}</p>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={logout} className="w-full text-error border-error/20 hover:bg-error/5">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </main>
      <MobileBottomNav role="citizen" />
    </div>
  );
}
