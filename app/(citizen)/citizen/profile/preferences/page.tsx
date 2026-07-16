'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, Smartphone, Languages, Moon } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 } })
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-container-high border border-outline/20'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ transform: `translateX(${checked ? '22px' : '2px'})` }} />
    </button>
  );
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({
    pushNotifications: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en'
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f0edef] text-on-surface">
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-outline-variant/10">
        <Link href="/citizen/profile" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </Link>
        <h1 className="text-lg font-bold">App Preferences</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-6 mt-2">
        
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Notifications</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Push Notifications</p>
                <p className="text-xs text-on-surface/50">Pickup reminders and updates</p>
              </div>
            </div>
            <Toggle checked={prefs.pushNotifications} onChange={() => setPrefs({ ...prefs, pushNotifications: !prefs.pushNotifications })} />
          </div>

          <div className="h-px w-full bg-outline-variant/20" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">SMS Alerts</p>
                <p className="text-xs text-on-surface/50">Receive texts for billing</p>
              </div>
            </div>
            <Toggle checked={prefs.smsAlerts} onChange={() => setPrefs({ ...prefs, smsAlerts: !prefs.smsAlerts })} />
          </div>
        </motion.div>

        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">General</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Language</p>
                <p className="text-xs text-on-surface/50">English (US)</p>
              </div>
            </div>
            <select 
              value={prefs.language} 
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="bg-surface-container-low text-sm font-semibold rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

          <div className="h-px w-full bg-outline-variant/20" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Dark Mode</p>
                <p className="text-xs text-on-surface/50">Coming soon</p>
              </div>
            </div>
            <Toggle checked={prefs.darkMode} onChange={() => {}} />
          </div>
        </motion.div>

      </main>
    </div>
  );
}
