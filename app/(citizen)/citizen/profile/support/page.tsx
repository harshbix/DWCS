'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, PhoneCall, MessageCircle, Mail } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 } })
};

const FAQS = [
  { q: "How do I report a missed pickup?", a: "You can report a missed pickup by going to the 'Complaints' tab and submitting a new report with the 'Missed Collection' category." },
  { q: "When is my next collection day?", a: "Your next collection schedule is displayed on the main dashboard. It's usually based on your zone's designated days." },
  { q: "How do I change my payment method?", a: "Go to Profile > Payment Methods to add or remove Mobile Money and GePG options." },
];

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left font-semibold text-sm hover:text-primary transition-colors"
      >
        {q}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-on-surface/70 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0edef] text-on-surface">
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-outline-variant/10">
        <Link href="/citizen/profile" className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </Link>
        <h1 className="text-lg font-bold">Help & Support</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-6 mt-2">
        
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Frequently Asked Questions</h2>
          <div className="flex flex-col">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>

        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Contact Us</h2>
          
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-700 py-4 rounded-xl hover:bg-blue-100 transition-colors">
              <PhoneCall className="w-6 h-6" />
              <span className="text-xs font-bold">Call Us</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 bg-green-50 text-green-700 py-4 rounded-xl hover:bg-green-100 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 bg-orange-50 text-orange-700 py-4 rounded-xl hover:bg-orange-100 transition-colors">
              <Mail className="w-6 h-6" />
              <span className="text-xs font-bold">Email</span>
            </button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
