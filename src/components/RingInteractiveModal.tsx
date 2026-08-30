import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RingInfo } from '../types';
import { X, ArrowUpRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface RingInteractiveModalProps {
  ring: RingInfo | null;
  onClose: () => void;
}

export const RingInteractiveModal: React.FC<RingInteractiveModalProps> = ({ ring, onClose }) => {
  useEffect(() => {
    if (ring) {
      sound.playDiscoverChime(parseInt(ring.number, 10));
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ring, onClose]);

  if (!ring) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-neutral-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-12 text-white shadow-2xl overflow-y-auto max-h-[88vh] flex flex-col justify-between"
        >
          {/* Subtle architectural grid bg */}
          <div className="absolute inset-0 architectural-grid opacity-30 pointer-events-none" />

          <div>
            {/* Header / Ring Number */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 sm:pb-6 mb-6 sm:mb-8 relative z-10">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <span className="font-heading font-light text-xl sm:text-2xl md:text-3xl text-white">
                  RING {ring.number}
                </span>
                <span className="h-4 w-px bg-neutral-800" />
                <span className="font-mono text-[10px] sm:text-xs tracking-widest text-neutral-400 uppercase">
                  {ring.subtitle}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/60 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-4 sm:space-y-6 relative z-10">
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white">
                {ring.title}
              </h3>
              <p className="font-body text-neutral-300 text-sm sm:text-base md:text-lg font-light leading-relaxed">
                {ring.description}
              </p>

              {/* Manifesto Callout */}
              <div className="border-l-2 border-white/40 pl-4 sm:pl-6 py-2 my-4 sm:my-6 bg-white/[0.02] rounded-r-xl">
                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 tracking-widest uppercase mb-1.5 sm:mb-2">
                  RING MANIFESTO
                </div>
                <blockquote className="font-body text-xs sm:text-sm md:text-base text-neutral-200 italic leading-relaxed">
                  &ldquo;{ring.manifesto}&rdquo;
                </blockquote>
              </div>

              {/* Pillars list */}
              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 tracking-widest uppercase">
                  CORE INITIATIVES &amp; SUBSTRATES
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {ring.pillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono text-neutral-300 hover:border-white/30 transition-colors"
                    >
                      <span>{pillar}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Coordinates */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-widest relative z-10">
            <span>COORDINATES // {ring.coordinates}</span>
            <span className="hidden xs:inline">THE HOUSE OF FUTURE // RING {ring.number}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
