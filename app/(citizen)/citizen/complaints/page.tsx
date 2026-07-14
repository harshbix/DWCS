'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useComplaints } from '@/hooks/useComplaints';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { formatDate } from '@/utils/format';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import type { ComplaintType } from '@/types/database';
import {
  ChevronLeft, ChevronRight, Truck, Wrench, AlertTriangle, 
  MoreHorizontal, Camera, MapPin, Send, CheckCircle2, Clock, XCircle,
} from 'lucide-react';

const ISSUE_TYPES: { id: ComplaintType; label: string; icon: React.ReactNode; }[] = [
  { id: 'missed_collection', label: 'Breakdown',    icon: <Truck className="w-7 h-7" /> },
  { id: 'damaged_container', label: 'Blocked Road', icon: <Wrench className="w-7 h-7" /> },
  { id: 'hazardous_waste',   label: 'Hazard',       icon: <AlertTriangle className="w-7 h-7" /> },
  { id: 'other',             label: 'Other',        icon: <MoreHorizontal className="w-7 h-7" /> },
];

const statusStyle: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-[#cce6d0] text-[#0f5238]',
  rejected: 'bg-red-100 text-red-700',
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'resolved') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === 'rejected') return <XCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 } })
};

export default function CitizenComplaintsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { complaints, isLoading, submitComplaint } = useComplaints(user?.id);

  const [view, setView] = useState<'form' | 'history'>('form');
  const [selectedType, setSelectedType] = useState<ComplaintType>('missed_collection');
  const [description, setDescription] = useState('');
  const [locationAcquired, setLocationAcquired] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGPS = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocationText(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
        setLocationAcquired(true);
      },
      () => {
        setLocationText('-8.9000° N, 33.4500° E');
        setLocationAcquired(true);
        toast.info('Location Fallback', 'Using default Mbeya coordinates.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !description.trim()) {
      toast.error('Missing Info', 'Please fill in a description.');
      return;
    }
    const coords = locationText.replace(/[°NE]/g, '').split(',');
    const lat = coords[0] ? parseFloat(coords[0].trim()) : undefined;
    const lng = coords[1] ? parseFloat(coords[1].trim()) : undefined;

    try {
      await submitComplaint.mutateAsync({
        citizenId: user.id,
        complaintType: selectedType,
        description,
        latitude: lat,
        longitude: lng,
        imageFile,
      });
      setDescription('');
      setImageFile(null);
      setLocationAcquired(false);
      setLocationText('');
      toast.success('Report Submitted', 'Your report has been submitted to TMWA.');
      setView('history');
    } catch { /* handled in hook */ }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf8fb] text-on-surface">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold text-on-surface">
            {view === 'form' ? 'Report Issue' : 'My Reports'}
          </h1>
        </div>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setView(v => v === 'form' ? 'history' : 'form')}
          className="text-primary text-sm font-semibold"
        >
          {view === 'form' ? 'My Reports' : 'New Report'}
        </motion.button>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 px-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              {/* Issue Type Grid */}
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <p className="text-base font-bold text-on-surface mb-3">Select Issue Type</p>
                <div className="grid grid-cols-2 gap-3">
                  {ISSUE_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200',
                        selectedType === type.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-outline-variant/30 bg-white'
                      )}
                    >
                      <span className={cn('transition-colors', selectedType === type.id ? 'text-primary' : 'text-on-surface-variant')}>
                        {type.icon}
                      </span>
                      <span className="text-sm font-semibold text-on-surface">{type.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                <p className="text-base font-bold text-on-surface mb-3">Short Description</p>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the situation..."
                  className="w-full bg-white border border-outline-variant/30 rounded-2xl p-4 text-sm resize-none text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </motion.div>

              {/* Add Photo */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-full h-20 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors',
                    imageFile ? 'border-primary bg-primary/5' : 'border-outline-variant/40 bg-surface-container'
                  )}
                >
                  <Camera className={cn('w-6 h-6', imageFile ? 'text-primary' : 'text-primary')} />
                  <span className={cn('text-sm font-semibold', imageFile ? 'text-primary' : 'text-primary')}>
                    {imageFile ? `📷 ${imageFile.name}` : 'Add Photo'}
                  </span>
                </motion.button>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])} accept="image/*" className="hidden" />
              </motion.div>

              {/* Location */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGPS}
                  className="w-full bg-white border border-outline-variant/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">
                      {locationAcquired ? 'Location Acquired' : 'Get My Location'}
                    </p>
                    {locationAcquired && (
                      <p className="text-xs text-on-surface/50 font-mono mt-0.5">{locationText}</p>
                    )}
                  </div>
                </motion.button>
              </motion.div>

              {/* Submit */}
              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="pb-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={submitComplaint.isPending || !description.trim()}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                >
                  {submitComplaint.isPending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-5 h-5" /> Submit Report</>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3 mt-2"
            >
              {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />)
              ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-on-surface/30" />
                  </div>
                  <p className="text-base font-semibold text-on-surface">No reports filed yet</p>
                  <p className="text-sm text-on-surface/50 max-w-xs">Use the 'New Report' button to file your first complaint.</p>
                </div>
              ) : (
                complaints.map((comp, i) => (
                  <motion.div
                    key={comp.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-on-surface capitalize">
                          {comp.complaint_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface/50 line-clamp-2">{comp.description}</p>
                      <p className="text-[10px] text-on-surface/30 mt-1.5">{formatDate(comp.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1', statusStyle[comp.status] ?? 'bg-surface-container text-on-surface/50')}>
                        <StatusIcon status={comp.status} />
                        {comp.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-on-surface/20" />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileBottomNav role="citizen" />
    </div>
  );
}
