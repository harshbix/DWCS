'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AccountSettingsPage() {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0edef] text-on-surface">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-outline-variant/10">
        <Link href="/citizen/profile" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </Link>
        <h1 className="text-lg font-bold">Account Settings</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onSubmit={handleSave} 
          className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-5 mt-4"
        >
          <div className="flex flex-col items-center mb-2">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shadow-sm border-4 border-white mb-3">
              {(formData.fullName || 'User').substring(0, 2).toUpperCase()}
            </div>
            <p className="text-xs text-primary font-semibold cursor-pointer hover:underline">Change Photo</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface">Full Name</label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="bg-surface-container-lowest"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface">Phone Number</label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+255..."
                className="bg-surface-container-lowest"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface">Email Address</label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="bg-surface-container-lowest"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 mt-4 rounded-xl font-bold flex items-center justify-center gap-2"
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
