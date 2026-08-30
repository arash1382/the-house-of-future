import { useEffect, useState, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { StoryCanvas } from './components/StoryCanvas';
import { NarrativeOverlay } from './components/NarrativeOverlay';
import { HeaderHUD } from './components/HeaderHUD';
import { CustomCursor } from './components/CustomCursor';
import { TimelineScrubber } from './components/TimelineScrubber';
import { RingInteractiveModal } from './components/RingInteractiveModal';
import { ContactSection } from './components/ContactSection';
import { CHAPTERS, ECOSYSTEM_RINGS } from './data/storyData';
import { RingInfo } from './types';
import { sound } from './utils/audio';

export default function App() {
  const [progress, setProgress] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [selectedRing, setSelectedRing] = useState<RingInfo | null>(null);
  const [isFreeFlight, setIsFreeFlight] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const autoPlayAnimRef = useRef<number | null>(null);

  // Initialize Lenis smooth scroll with touch synchronization
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: isTouch ? 0.9 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: true,
    });

    lenisRef.current = lenis;

    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const rawProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
        setProgress(rawProgress);

        // Update active chapter index
        for (let i = 0; i < CHAPTERS.length; i++) {
          if (rawProgress >= CHAPTERS[i].progressStart && rawProgress <= CHAPTERS[i].progressEnd) {
            setCurrentChapterIndex(i);
            break;
          }
        }
      }
    };

    lenis.on('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });

    let isRunning = true;
    let reqId: number;

    function raf(time: number) {
      if (!isRunning) return;
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    }
    reqId = requestAnimationFrame(raf);

    // Initial check
    onScroll();

    return () => {
      isRunning = false;
      cancelAnimationFrame(reqId);
      window.removeEventListener('scroll', onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle Auto Cinematic Playback
  useEffect(() => {
    if (!isAutoPlay) {
      if (autoPlayAnimRef.current) cancelAnimationFrame(autoPlayAnimRef.current);
      return;
    }

    let isLooping = false;
    const step = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY || document.documentElement.scrollTop;

      if (currentScroll >= maxScroll - 5) {
        if (!isLooping) {
          isLooping = true;
          lenisRef.current?.scrollTo(0, {
            duration: 2.5,
            onComplete: () => {
              isLooping = false;
            },
          });
        }
      } else if (!isLooping) {
        window.scrollBy({ top: 1.6, behavior: 'auto' });
      }

      autoPlayAnimRef.current = requestAnimationFrame(step);
    };

    autoPlayAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (autoPlayAnimRef.current) cancelAnimationFrame(autoPlayAnimRef.current);
    };
  }, [isAutoPlay]);

  // Navigate to specific progress point
  const handleSelectProgress = useCallback((targetProgress: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = Math.max(0, Math.min(targetProgress * maxScroll, maxScroll));
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetScrollY, { duration: 1.6 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  }, []);

  // Navigate to next chapter or scroll forward
  const handleScrollNext = useCallback(() => {
    if (progress >= 0.92) {
      // Replay from start
      handleSelectProgress(0);
    } else {
      const nextChapter = CHAPTERS[currentChapterIndex + 1] || CHAPTERS[0];
      handleSelectProgress(nextChapter.progressStart + 0.02);
    }
  }, [progress, currentChapterIndex, handleSelectProgress]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcut keys when focused on input or textarea elements
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (!e.key) return;

      if (isInputFocused) {
        // Allow normal typing inside input/textarea without triggering shortcuts or page navigation
        return;
      }

      const keyLower = typeof e.key === 'string' ? e.key.toLowerCase() : '';

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIdx = Math.min(CHAPTERS.length - 1, currentChapterIndex + 1);
        handleSelectProgress(CHAPTERS[nextIdx].progressStart + 0.02);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIdx = Math.max(0, currentChapterIndex - 1);
        handleSelectProgress(CHAPTERS[prevIdx].progressStart + 0.02);
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setIsAutoPlay((prev) => !prev);
      } else if (keyLower === 'm') {
        sound.toggleMute();
      } else if (keyLower === 'f') {
        setIsFreeFlight((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, handleSelectProgress]);

  // Calculate active ring index if within discovery range
  const getActiveRingIndex = (): number | null => {
    if (progress < 0.44 || progress > 0.72) return null;
    const t = (progress - 0.44) / 0.28;
    return Math.min(3, Math.floor(t * 4));
  };

  return (
    <main
      ref={scrollContainerRef}
      className="relative bg-black text-white w-full overflow-x-clip selection:bg-white selection:text-black cursor-default"
    >
      {/* Film grain layer */}
      <div className="fixed inset-0 film-grain z-30 pointer-events-none opacity-40" />

      {/* Custom smooth cursor */}
      <CustomCursor />

      {/* Header HUD Navigation */}
      <HeaderHUD
        progress={progress}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={handleSelectProgress}
        onSelectRing={(ring) => setSelectedRing(ring)}
        isFreeFlight={isFreeFlight}
        onToggleFreeFlight={() => setIsFreeFlight((prev) => !prev)}
        isAutoPlay={isAutoPlay}
        onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
      />

      {/* Timeline Chapter Scrubber */}
      <TimelineScrubber
        progress={progress}
        onSelectProgress={handleSelectProgress}
      />

      {/* Interactive Story Canvas (3 Circles, Protagonist, Paths, 4 Rings, Reconnection) */}
      <StoryCanvas
        progress={progress}
        onSelectRing={(ring) => setSelectedRing(ring)}
        activeRingIndex={getActiveRingIndex()}
        isFreeFlight={isFreeFlight}
      />

      {/* Dynamic Narrative Typography Overlay (Chapters 0-4) */}
      <NarrativeOverlay
        progress={progress}
        onOpenRingDetail={(ring) => setSelectedRing(ring)}
        onScrollNext={handleScrollNext}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. STORY SCROLL RUNWAY (Chapters 00 to 04) */}
      {/* ------------------------------------------------------------- */}
      <div
        className="w-full h-[380vh] sm:h-[420vh] pointer-events-none"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. CHAPTER 05: CONVERGENCE, COLLABORATE, CONNECT & FOOTER */}
      {/* Standard document flow section - 100% accessible on all devices */}
      {/* ------------------------------------------------------------- */}
      <div
        id="collaborate"
        className="relative z-30 w-full min-h-screen bg-gradient-to-b from-transparent via-black/85 to-black pt-20 sm:pt-28 pb-16 px-4 sm:px-6 md:px-8 flex flex-col items-center select-auto"
      >
        {/* Chapter 5 Prelude */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
            05 // RETURN &amp; CONVERGENCE
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
            What comes next?
          </h2>
          <p className="font-body text-xs sm:text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-md mx-auto">
            The moving circle returns to its origin, yet the universe it traced expands infinitely.
          </p>
        </div>

        {/* Contact Form, Transmission Channels, Social Links & Footer */}
        <ContactSection onReplay={() => handleSelectProgress(0)} />
      </div>

      {/* Detailed Ring Discovery Modal */}
      <RingInteractiveModal
        ring={selectedRing}
        onClose={() => setSelectedRing(null)}
      />
    </main>
  );
}
