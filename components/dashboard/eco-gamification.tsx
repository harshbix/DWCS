import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Medal, Leaf } from 'lucide-react';

export function EcoGamification() {
  // In a real app, these would come from the database
  const ecoPoints = 1250;
  const streak = 4;
  const level = 'Seedling';
  const nextLevel = 'Ranger';
  const progressPercent = 65; // 65% to next level

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
      }}
      className="bg-gradient-to-br from-primary to-primary-container p-4 rounded-3xl text-on-primary shadow-lg relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
        <Leaf className="w-32 h-32" />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full w-max mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              {streak} Week Streak
            </span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight leading-none">
            {ecoPoints.toLocaleString()} <span className="text-sm font-semibold opacity-80 uppercase">pts</span>
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md h-12 w-12 rounded-2xl border border-white/20">
          <Medal className="w-6 h-6 text-amber-300 mb-0.5" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10">
        <div className="flex justify-between text-[10px] font-semibold mb-1.5 opacity-90">
          <span>Level {level}</span>
          <span>Next: {nextLevel}</span>
        </div>
        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="h-full bg-white rounded-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 w-full h-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
