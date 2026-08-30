import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ECOSYSTEM_RINGS, CHAPTERS } from '../data/storyData';
import { RingInfo } from '../types';
import { ChevronRight, ArrowDown } from 'lucide-react';

interface NarrativeOverlayProps {
  progress: number;
  onOpenRingDetail: (ring: RingInfo) => void;
  onScrollNext: () => void;
}

export const NarrativeOverlay: React.FC<NarrativeOverlayProps> = ({
  progress,
  onOpenRingDetail,
  onScrollNext,
}) => {
  // Determine which narrative chapter is active
  const getActiveChapterIndex = () => {
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (progress >= CHAPTERS[i].progressStart && progress <= CHAPTERS[i].progressEnd) {
        return i;
      }
    }
    return CHAPTERS.length - 1;
  };

  const chapterIndex = getActiveChapterIndex();

  // Active ring during Discovery phase (0.44 to 0.72)
  const getActiveRing = (): { ring: RingInfo; index: number } | null => {
    if (chapterIndex !== 3 && (progress < 0.44 || progress > 0.72)) return null;
    const t = Math.max(0, Math.min(0.999, (progress - 0.44) / 0.28));
    const ringIdx = Math.min(3, Math.max(0, Math.floor(t * 4)));
    return { ring: ECOSYSTEM_RINGS[ringIdx], index: ringIdx };
  };

  const activeRingData = getActiveRing();

  // If in Chapter 5 (Convergence/Collaborate/Contact), the overlay completely hides to let the document flow section breathe
  const isFinalChapter = chapterIndex === 5 || progress >= 0.88;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-20 flex flex-col justify-between px-4 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 max-h-screen overflow-hidden select-none transition-opacity duration-700 ${
        isFinalChapter ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer matching header height */}
      <div className="h-12 sm:h-14 md:h-16 shrink-0" />

      {/* Main Narrative Dynamic Area */}
      <div className="w-full max-w-5xl mx-auto my-auto relative">
        <AnimatePresence mode="wait">
          {/* ------------------------------------------------------------- */}
          {/* SCENE 0: OPENING GENESIS (0.00 - 0.12) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 0 && (
            <motion.div
              key="chapter-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-8"
            >
              {/* Eyebrow */}
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
                THE GENESIS POINT
              </div>

              {/* Three Circle Logo (Standalone Brand Mark positioned ABOVE the main title) */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="flex items-center justify-center gap-2.5 sm:gap-4 py-0.5 sm:py-1 select-none"
                aria-label="The House of Future Logo"
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.45)]" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.7)] ring-4 ring-white/10" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.45)]" />
              </motion.div>

              {/* Main Title */}
              <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-white max-w-4xl leading-[1.05]">
                <span>THE HOUSE OF</span>
                <br />
                <span>FUTURE</span>
              </h1>

              {/* Subtitle */}
              <p className="font-body text-xs sm:text-sm md:text-base lg:text-lg text-neutral-400 max-w-lg sm:max-w-xl font-light leading-relaxed px-2">
                An AI ecosystem. A home for intelligence, ideas, education, philosophy, media and innovation.
              </p>

              {/* Scroll Trigger */}
              <div className="pt-2 sm:pt-4 pointer-events-auto flex flex-col items-center gap-3">
                <button
                  onClick={onScrollNext}
                  className="group flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-mono tracking-widest text-neutral-400 hover:text-white transition-colors duration-300 py-2 sm:py-2.5 px-4 sm:px-5 rounded-full border border-white/15 hover:border-white/40 bg-black/40 backdrop-blur-sm cursor-pointer shadow-lg"
                >
                  <span>SCROLL TO BEGIN JOURNEY</span>
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce group-hover:text-white" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SCENE 1: SEPARATION OF THE PROTAGONIST (0.12 - 0.28) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 1 && (
            <motion.div
              key="chapter-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl space-y-4 sm:space-y-6 text-left pr-6 sm:pr-0"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">
                <span className="w-4 sm:w-6 h-px bg-white/40" />
                <span>01 // THE PROTAGONIST DEPARTS</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
                A single point begins to travel.
              </h2>

              <p className="font-body text-xs sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed">
                In the quiet space before form, the center circle separates from equilibrium. Not to conquer space, but to weave continuity. As it moves, it originates the first trajectory of intelligence.
              </p>

              <div className="pt-1 sm:pt-2 font-mono text-[10px] sm:text-xs text-neutral-500 tracking-wider">
                TRAJECTORY: VECTOR_01 // CREATING PATHS
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SCENE 2: WEAVING STRUCTURES & SYSTEMS (0.28 - 0.44) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 2 && (
            <motion.div
              key="chapter-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl ml-auto text-right space-y-4 sm:space-y-6 pl-6 sm:pl-0"
            >
              <div className="flex items-center justify-end gap-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">
                <span>02 // STRUCTURES & TOPOLOGY</span>
                <span className="w-4 sm:w-6 h-px bg-white/40" />
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
                Nothing appears suddenly. Everything emerges from motion.
              </h2>

              <p className="font-body text-xs sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed">
                Points become trajectories. Trajectories intersect into relationships. Relationships crystallize into architecture. The ecosystem breathes as a single continuous continuum.
              </p>

              <div className="pt-1 sm:pt-2 font-mono text-[10px] sm:text-xs text-neutral-500 tracking-wider">
                NETWORK TOPOLOGY: 48 NODES // TENSION 0.84
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SCENE 3: DISCOVERY OF THE FOUR RINGS (0.44 - 0.72) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 3 && activeRingData && (
            <motion.div
              key={`ring-${activeRingData.ring.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl space-y-4 sm:space-y-6 text-left pr-6 sm:pr-0"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">
                <span className="text-white font-semibold">RING {activeRingData.ring.number}</span>
                <span className="text-neutral-600">//</span>
                <span>{activeRingData.ring.subtitle}</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
                {activeRingData.ring.title}
              </h2>

              <p className="font-body text-xs sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed">
                {activeRingData.ring.description}
              </p>

              {/* Pillars preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2 font-mono text-[11px] sm:text-xs text-neutral-400">
                {activeRingData.ring.pillars.map((pillar, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span>{pillar}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 sm:pt-4 pointer-events-auto">
                <button
                  onClick={() => onOpenRingDetail(activeRingData.ring)}
                  className="group flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-mono tracking-widest text-white hover:text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 hover:border-white bg-neutral-950/80 backdrop-blur-md transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] cursor-pointer"
                >
                  <span>DISCOVER RING {activeRingData.ring.number} MANIFESTO</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SCENE 4: MACRO LIVING SYNTHESIS (0.72 - 0.88) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 4 && (
            <motion.div
              key="chapter-4"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0"
            >
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
                04 // MACROCOSMIC SYMBIOSIS
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight">
                Four orbits. One living horizon.
              </h2>

              <p className="font-body text-xs sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed max-w-2xl mx-auto">
                Development gives structure to Philosophy. Ideas seed new Media. The ecosystem is not a catalog of features, but a self-sustaining organism of thought.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-2 sm:pt-4 text-[10px] sm:text-xs font-mono text-neutral-400">
                <span>ORBIT 01 // DEV</span>
                <span className="hidden sm:inline">•</span>
                <span>ORBIT 02 // ART</span>
                <span className="hidden sm:inline">•</span>
                <span>ORBIT 03 // IDEAS</span>
                <span className="hidden sm:inline">•</span>
                <span>ORBIT 04 // MEDIA</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom status bar info */}
      <div className="w-full flex items-end justify-between font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-widest shrink-0 pt-2">
        <div className="hidden sm:block">
          THE HOUSE OF FUTURE // AUTONOMOUS AI ECOSYSTEM
        </div>
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <span>CHAPTER {CHAPTERS[chapterIndex]?.number} OF 05</span>
          <span className="text-neutral-700">|</span>
          <span className="hidden xs:inline">LAT 34°03&apos;N LON 118°14&apos;W</span>
        </div>
      </div>
    </div>
  );
};
