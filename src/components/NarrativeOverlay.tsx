import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ECOSYSTEM_RINGS, CHAPTERS } from '../data/storyData';
import { ArrowDown } from 'lucide-react';

interface NarrativeOverlayProps {
  progress: number;
  onScrollNext: () => void;
}

export const NarrativeOverlay: React.FC<NarrativeOverlayProps> = ({
  progress,
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

  // If at or past 1.0, orbital narrative is complete and overlay fades out for content flow
  const isDocumentFlow = progress >= 1.0;

  // Active ring for Stages 4 to 9 (progress 0.32 to 0.90)
  const getActiveRingData = () => {
    if (progress < 0.30 || progress >= 0.90) return null;
    const ringIdx = Math.min(5, Math.max(0, Math.floor((progress - 0.30) / 0.10)));
    return { ring: ECOSYSTEM_RINGS[ringIdx], index: ringIdx };
  };

  const activeRing = getActiveRingData();

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-20 flex flex-col justify-between px-4 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 max-h-screen overflow-hidden select-none transition-opacity duration-700 ${
        isDocumentFlow ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer matching header height */}
      <div className="h-12 sm:h-14 md:h-16 shrink-0" />

      {/* Main Narrative Dynamic Area (Pure floating typography, zero cards, zero boxes) */}
      <div className="w-full max-w-5xl mx-auto my-auto relative">
        <AnimatePresence mode="wait">
          {/* ------------------------------------------------------------- */}
          {/* STAGE 1: THE THREE DOTS APPEAR (0.00 - 0.10) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 0 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-7"
            >
              {/* Eyebrow */}
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
                THE GENESIS POINT
              </div>

              {/* Three Circle Identity Logo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="flex items-center justify-center gap-1 sm:gap-1.5 py-0.5 sm:py-1 select-none"
                aria-label="The House of Future Logo"
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.45)]" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.7)] ring-4 ring-white/10" />
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.45)]" />
              </motion.div>

              {/* Main Title: Rebalanced with "OF" on the second line */}
              <h1 className="font-heading text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-tight text-white max-w-5xl leading-[1.05] text-center select-none">
                <span className="block">THE HOUSE</span>
                <span className="block font-light text-white/95">OF FUTURE</span>
              </h1>

              {/* Tagline directly below the main title */}
              <div className="pt-1 pb-1">
                <p className="font-mono text-xs sm:text-sm md:text-base font-extralight uppercase tracking-[0.25em] text-neutral-300 text-center max-w-2xl px-4 py-1 border-y border-white/10">
                  Being modern is not the issue. Being contemporary is.
                </p>
              </div>

              {/* Subtitle */}
              <p className="font-body text-xs sm:text-sm md:text-base text-neutral-400 max-w-lg sm:max-w-xl font-light leading-relaxed px-2 text-center">
                An AI ecosystem. A continuous orbital journey through intelligence, ideas, philosophy, media, arts and commerce.
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
          {/* STAGE 2: THE DOTS SEPARATE AND CREATE ORBITAL PATHS (0.10 - 0.22) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 1 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl space-y-3 sm:space-y-4 text-left"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">
                <span className="w-4 sm:w-6 h-px bg-white/40" />
                <span>STAGE 02 // ORBITAL PATHS</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
                The dots separate and create orbital paths.
              </h2>

              <p className="font-body text-xs sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed">
                In the quiet space before form, the center circle detaches from equilibrium to weave continuity. As it moves across space, trajectories intersect into relationships.
              </p>

              <div className="font-mono text-[10px] sm:text-xs text-neutral-500 tracking-wider">
                TRAJECTORY: VECTOR_01 // SYSTEM FORMATION
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 3: THE HOUSE OF FUTURE CORE EMERGES (0.22 - 0.32) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 2 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl ml-auto text-right space-y-3 sm:space-y-4"
            >
              <div className="flex items-center justify-end gap-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">
                <span>STAGE 03 // THE CORE EMERGES</span>
                <span className="w-4 sm:w-6 h-px bg-white/40" />
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
                The House of Future core emerges.
              </h2>

              <p className="font-body text-xs sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed">
                The central gravitational anchor crystallizes at the center. From this single unified origin, six primary rings will emerge in continuous concentric progression.
              </p>

              <div className="font-mono text-[10px] sm:text-xs text-neutral-500 tracking-wider">
                GRAVITATIONAL ORIGIN // LAT 35°41&apos;N LON 51°25&apos;E
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGES 4 TO 9: RINGS 01 TO 06 EMERGE FROM THE CENTRAL SYSTEM (0.32 - 0.90) */}
          {/* ------------------------------------------------------------- */}
          {activeRing && (
            <motion.div
              key={`ring-stage-${activeRing.ring.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl space-y-3 sm:space-y-4 text-left"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neutral-400 uppercase">
                <span className="text-white font-medium">STAGE 0{activeRing.index + 4}</span>
                <span className="text-neutral-600">//</span>
                <span>RING {activeRing.ring.number} EMERGES</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
                {activeRing.ring.title}
              </h2>

              <p className="font-body text-xs sm:text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-xl">
                {activeRing.ring.description}
              </p>

              {/* Minimal inline list of nodes without cards or boxes */}
              <div className="pt-1 space-y-1.5">
                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-widest">
                  SYNAPSE NODES ({activeRing.ring.nodes.length})
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-neutral-300">
                  {activeRing.ring.nodes.map((nodeName, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-white/90 hover:text-white transition-colors">
                        {nodeName}
                      </span>
                      {idx < activeRing.ring.nodes.length - 1 && (
                        <span className="text-neutral-600">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="font-mono text-[10px] sm:text-xs text-neutral-500 tracking-wider pt-1">
                ROTATING IN CONCENTRIC SYNTHESIS WITH PREVIOUS RINGS
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 10: LIVING SYNTHESIS (0.90 - 0.94) */}
          {/* ------------------------------------------------------------- */}
          {chapterIndex === 9 && !activeRing && (
            <motion.div
              key="stage-10"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4"
            >
              <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
                STAGE 10 // MACROCOSMIC LIVING SYNTHESIS
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
                Six rings. One living universe.
              </h2>

              <p className="font-body text-xs sm:text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-xl mx-auto">
                All six orbital rings rotate together around the central House of Future core. Every discipline informs the next in perpetual harmony.
              </p>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono text-neutral-400 pt-1">
                <span>01 DEV</span>
                <span>•</span>
                <span>02 PHILOSOPHY</span>
                <span>•</span>
                <span>03 IDEAS</span>
                <span>•</span>
                <span>04 MEDIA</span>
                <span>•</span>
                <span>05 ARTS</span>
                <span>•</span>
                <span>06 COMMERCE</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom status bar info */}
      <div className="w-full flex items-end justify-between font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-widest shrink-0 pt-2">
        <div className="hidden sm:block">
          THE HOUSE OF FUTURE // CONTINUOUS ORBITAL SYSTEM
        </div>
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <span>STAGE {CHAPTERS[chapterIndex]?.number} OF 09</span>
          <span className="text-neutral-700">|</span>
          <span className="hidden xs:inline">LAT 35°41&apos;N LON 51°25&apos;E</span>
        </div>
      </div>
    </div>
  );
};
