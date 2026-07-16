'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, Save, Lock } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TopNavigation } from '@/components/layout/top-navigation';

export default function DriverSettingsPage() {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    email: profile?.email || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNavigation />

      <header className="bg-surface-container-lowest px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-outline-variant/10">
        <Link href="/driver/profile" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ChevronLeft className="w-6 h-6 text-text-primary" />
        </Link>
        <h1 className="text-lg font-bold text-text-primary">Edit Profile</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onSubmit={handleSave} 
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-6 mt-4"
        >
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Contact Info</h2>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-primary">Phone Number</label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+255..."
                className="bg-surface-container"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-primary">Email Address</label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="bg-surface-container"
              />
            </div>
          </div>

          <div className="h-px w-full bg-outline-variant/20" />

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              Employment Details <Lock className="w-3 h-3 text-text-secondary" />
            </h2>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-secondary">Full Name</label>
              <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/20 text-sm font-medium text-text-primary/70">
                {profile?.full_name || '—'}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-secondary">Account Status</label>
              <div className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/20 text-sm font-medium text-text-primary/70 capitalize">
                {profile?.status || 'Active'}
              </div>
              <p className="text-[10px] text-text-secondary mt-1">To change employment details, please contact your supervisor.</p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </Button>
        </motion.form>
      </main>
    </div>
  );
}
