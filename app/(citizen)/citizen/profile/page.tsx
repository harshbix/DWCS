'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { User, MapPin, CreditCard, Settings2, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 24 } })
};

const MENU_SECTIONS = [
  {
    items: [
      { icon: <User className="w-5 h-5" />, label: 'Account Settings', sub: 'Name, phone, email', href: '/citizen/profile/settings' },
      { icon: <MapPin className="w-5 h-5" />, label: 'Address', sub: 'Zone, street, plot number', href: '/citizen/profile/address' },
      { icon: <CreditCard className="w-5 h-5" />, label: 'Payment Methods', sub: 'M-Pesa, Tigo, Airtel, GePG', href: '/citizen/profile/payments' },
      { icon: <Settings2 className="w-5 h-5" />, label: 'App Preferences', sub: 'Language, notifications', href: '/citizen/profile/preferences' },
    ]
  },
  {
    items: [
      { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', sub: 'FAQs, contact TMWA', href: '/citizen/profile/support' },
    ]
  },
];

export default function CitizenProfilePage() {
  const { profile, logout } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'User';
  const initials = (profile?.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#f0edef] text-on-surface">
      {/* Profile Hero */}
      <div className="bg-[#fcf8fb] pt-14 pb-6 px-5 flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shadow-sm border-4 border-white"
        >
          {initials}
        </motion.div>
        <div className="text-center">
          <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="text-xl font-bold text-on-surface"
          >
            {profile?.full_name ?? 'EcoCollect Member'}
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-sm text-on-surface/50 mt-0.5"
          >
            {profile?.email ?? ''}
          </motion.p>
          <motion.span custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-1.5 mt-2 bg-[#cce6d0] text-[#0f5238] px-3 py-1 rounded-full text-xs font-bold"
          >
            <span className="w-1.5 h-1.5 bg-[#0f5238] rounded-full" />
            ACTIVE
          </motion.span>
        </div>
      </div>

      {/* Menu Sections */}
      <main className="flex-1 overflow-y-auto pb-28 px-4 pt-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {MENU_SECTIONS.map((section, si) => (
          <motion.div
            key={si}
            custom={si + 2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-outline-variant/10"
          >
            {section.items.map((item, ii) => (
              <Link key={item.label} href={item.href} className="block">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-surface-container-low transition-colors text-left"
                  style={{ borderBottom: ii < section.items.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                    {item.sub && <p className="text-xs text-on-surface/40 mt-0.5 truncate">{item.sub}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface/20 flex-shrink-0" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={logout}
            className="w-full h-14 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Logout
          </motion.button>
        </motion.div>
      </main>

      <MobileBottomNav role="citizen" />
    </div>
  );
}
