'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, CreditCard, Trash2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 } })
};

const PAYMENT_METHODS = [
  { id: 1, type: 'M-Pesa', number: '•••• 4321', isDefault: true, color: 'bg-red-50 text-red-600', iconColor: 'text-red-500' },
  { id: 2, type: 'Tigo Pesa', number: '•••• 8765', isDefault: false, color: 'bg-blue-50 text-blue-600', iconColor: 'text-blue-500' },
  { id: 3, type: 'GePG Card', number: '•••• •••• •••• 1234', isDefault: false, color: 'bg-slate-50 text-slate-700', iconColor: 'text-slate-500' }
];

export default function PaymentSettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0edef] text-on-surface">
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-outline-variant/10">
        <Link href="/citizen/profile" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </Link>
        <h1 className="text-lg font-bold">Payment Methods</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 bg-green-50 text-green-700 p-3 rounded-xl border border-green-100">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs font-medium">Your payment information is securely encrypted and managed according to Tanzania data protection standards.</p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {PAYMENT_METHODS.map((method, i) => (
            <motion.div 
              key={method.id}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/10 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${method.color}`}>
                <CreditCard className={`w-6 h-6 ${method.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-on-surface">{method.type}</p>
                  {method.isDefault && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Default</span>
                  )}
                </div>
                <p className="text-xs text-on-surface/50 font-medium tracking-widest mt-0.5">{method.number}</p>
              </div>
              <button className="p-2 text-on-surface/30 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div custom={PAYMENT_METHODS.length + 1} variants={fadeUp} initial="hidden" animate="visible" className="mt-2">
          <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 font-bold flex gap-2">
            <Plus className="w-5 h-5" />
            Add New Payment Method
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
