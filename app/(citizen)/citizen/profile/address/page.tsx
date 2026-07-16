'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Save, Map as MapIcon, Crosshair } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AddressSettingsPage() {
  const [formData, setFormData] = useState({
    zone: 'Kijitonyama',
    street: 'Ali Hassan Mwinyi Rd',
    plotNumber: 'Plot 45',
    instructions: 'Behind the blue gate'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0edef] text-on-surface">
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-outline-variant/10">
        <Link href="/citizen/profile" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </Link>
        <h1 className="text-lg font-bold">Address</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Map Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="w-full h-48 bg-surface-container-high rounded-2xl overflow-hidden relative border border-outline-variant/20 shadow-sm flex items-center justify-center"
        >
          {/* Faux map pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <div className="z-10 flex flex-col items-center text-on-surface/60">
            <MapIcon className="w-8 h-8 mb-2" />
            <span className="text-sm font-semibold">Map View</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <MapPin className="w-10 h-10 text-primary drop-shadow-md" fill="white" />
          </div>

          <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-on-surface hover:bg-surface-container-lowest z-30">
            <Crosshair className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
          onSubmit={handleSave} 
          className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-4"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface">Zone / District</label>
              <Input 
                value={formData.zone} 
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="e.g. Kinondoni"
                className="bg-surface-container-lowest"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Street</label>
                <Input 
                  value={formData.street} 
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Street Name"
                  className="bg-surface-container-lowest"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Plot / House No.</label>
                <Input 
                  value={formData.plotNumber} 
                  onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                  placeholder="Plot No."
                  className="bg-surface-container-lowest"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface">Pickup Instructions (Optional)</label>
              <Input 
                value={formData.instructions} 
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="e.g. Call when outside"
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
                Update Address
              </>
            )}
          </Button>
        </motion.form>
      </main>
    </div>
  );
}
