import { useEffect, useState, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { StoryCanvas } from './components/StoryCanvas';
import { NarrativeOverlay } from './components/NarrativeOverlay';
import { HeaderHUD } from './components/HeaderHUD';
import { CustomCursor } from './components/CustomCursor';
import { TimelineScrubber } from './components/TimelineScrubber';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { CHAPTERS } from './data/storyData';
import { sound } from './utils/audio';

export default function App() {
  const [progress, setProgress] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [highlightedRingIndex, setHighlightedRingIndex] = useState<number | null>(null);
  const [isFreeFlight, setIsFreeFlight] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [contentTransition, setContentTransition] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const orbitalRunwayRef = useRef<HTMLDivElement | null>(null);
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
      const runwayEl = orbitalRunwayRef.current;
      const runwayHeight = runwayEl ? runwayEl.offsetHeight : window.innerHeight * 8.5;
      const orbitalScrollMax = Math.max(1, runwayHeight - window.innerHeight);

      // 1. Orbital Progress (0.0 to 1.0 dedicated solely to the orbital sequence)
      if (orbitalScrollMax > 0) {
        const rawOrbital = Math.min(Math.max(scrollY / orbitalScrollMax, 0), 1);
        setProgress(rawOrbital);

        // Update active chapter index
        for (let i = 0; i < CHAPTERS.length; i++) {
          if (rawOrbital >= CHAPTERS[i].progressStart && rawOrbital <= CHAPTERS[i].progressEnd) {
            setCurrentChapterIndex(i);
            break;
          }
        }
      }

      // 2. Content Transition Progress (Only begins AFTER the orbital sequence is 100% complete)
      if (scrollY > orbitalScrollMax) {
        const transitionDist = window.innerHeight * 0.75;
        const trans = Math.min(Math.max((scrollY - orbitalScrollMax) / transitionDist, 0), 1);
        setContentTransition(trans);
      } else {
        setContentTransition(0);
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
      const runwayEl = orbitalRunwayRef.current;
      const runwayHeight = runwayEl ? runwayEl.offsetHeight : window.innerHeight * 8.5;
      const orbitalScrollMax = Math.max(1, runwayHeight - window.innerHeight);
      const currentScroll = window.scrollY || document.documentElement.scrollTop;

      if (currentScroll >= orbitalScrollMax - 10) {
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
        window.scrollBy({ top: 1.8, behavior: 'auto' });
      }

      autoPlayAnimRef.current = requestAnimationFrame(step);
    };

    autoPlayAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (autoPlayAnimRef.current) cancelAnimationFrame(autoPlayAnimRef.current);
    };
  }, [isAutoPlay]);

  // Navigate to specific progress point within the orbital sequence
  const handleSelectProgress = useCallback((targetProgress: number) => {
    const runwayEl = orbitalRunwayRef.current;
    const runwayHeight = runwayEl ? runwayEl.offsetHeight : window.innerHeight * 8.5;
    const orbitalScrollMax = Math.max(1, runwayHeight - window.innerHeight);
    const targetScrollY = Math.max(0, Math.min(targetProgress * orbitalScrollMax, orbitalScrollMax));

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetScrollY, { duration: 1.6 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  }, []);

  // Navigate to next chapter or scroll forward
  const handleScrollNext = useCallback(() => {
    if (progress >= 0.98) {
      // Transition forward to About content section
      const aboutEl = document.getElementById('about');
      if (aboutEl && lenisRef.current) {
        lenisRef.current.scrollTo(aboutEl, { duration: 1.6 });
      } else if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const nextChapter = CHAPTERS[currentChapterIndex + 1] || CHAPTERS[0];
      handleSelectProgress(nextChapter.progressStart + 0.02);
    }
  }, [progress, currentChapterIndex, handleSelectProgress]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (!e.key || isInputFocused) return;

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

  return (
    <main
      ref={scrollContainerRef}
      className="relative bg-black text-white w-full overflow-x-clip selection:bg-white selection:text-black cursor-default"
    >
      {/* Film grain layer */}
      <div className="fixed inset-0 film-grain z-50 pointer-events-none opacity-40" />

      {/* Custom smooth cursor */}
      <CustomCursor />

      {/* Header HUD Navigation (Always available) */}
      <HeaderHUD
        progress={progress}
        currentChapterIndex={currentChapterIndex}
        highlightedRingIndex={highlightedRingIndex}
        onSelectProgress={handleSelectProgress}
        onToggleHighlightRing={(idx) => setHighlightedRingIndex(idx)}
        isAutoPlay={isAutoPlay}
        onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
      />

      {/* ------------------------------------------------------------- */}
      {/* PINNED ORBITAL UNIVERSE (Canvas + Narrative Typography + Scrubber) */}
      {/* Pinned for the entire orbital sequence (Stages 1 through 9 & 10) */}
      {/* Higher z-index than following content sections until completion */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`fixed inset-0 w-full h-screen overflow-hidden ${
          contentTransition >= 0.99 ? 'z-0 pointer-events-none' : 'z-30 pointer-events-auto'
        }`}
        style={{
          opacity: Math.max(0, 1 - contentTransition),
          transition: 'opacity 0.25s ease-out',
        }}
      >
        {/* Interactive Story Canvas: One Central Orbital System */}
        <StoryCanvas
          progress={progress}
          highlightedRingIndex={highlightedRingIndex}
          onToggleHighlightRing={(idx) => setHighlightedRingIndex(idx)}
          isFreeFlight={isFreeFlight}
        />

        {/* Dynamic Narrative Typography Overlay (Pure text, zero cards, zero boxes) */}
        <NarrativeOverlay
          progress={progress}
          onScrollNext={handleScrollNext}
        />

        {/* Timeline Chapter Scrubber (Pinned inside orbital universe) */}
        <TimelineScrubber
          progress={progress}
          onSelectProgress={handleSelectProgress}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SIGNIFICANTLY INCREASED ORBITAL SCROLL RUNWAY (Stages 01 to 09) */}
      {/* 850vh scroll duration guarantees full gradual emergence of all rings */}
      {/* ------------------------------------------------------------- */}
      <div
        ref={orbitalRunwayRef}
        className="w-full h-[850vh] sm:h-[900vh] pointer-events-none"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. REVEALED CONTENT SECTIONS (About, Collaborate, Connect, Footer) */}
      {/* Placed AFTER the runway so they NEVER enter viewport during orbital journey */}
      {/* Only revealed smoothly AFTER Ring 06 & living synthesis complete 100% */}
      {/* ------------------------------------------------------------- */}
      <div
        id="content-flow"
        className="relative z-10 w-full min-h-screen select-auto transition-opacity duration-700"
        style={{
          opacity: contentTransition > 0.05 ? Math.min(1, contentTransition * 1.4) : 0,
          transform: `translateY(${Math.max(0, (1 - contentTransition) * 35)}px)`,
        }}
      >
        {/* About Section with Persian Manifesto & Metrics */}
        <AboutSection />

        {/* Chapter 10 Convergence, Collaborate Form, Connect & Footer */}
        <div
          id="collaborate"
          className="relative w-full min-h-screen bg-gradient-to-b from-transparent via-black/85 to-black pt-16 sm:pt-24 pb-16 px-4 sm:px-6 md:px-8 flex flex-col items-center select-auto"
        >
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
            <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
              10 // RETURN &amp; CONVERGENCE
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
              What comes next?
            </h2>
            <p className="font-body text-xs sm:text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-md mx-auto">
              The moving circle returns to its origin, yet the universe it traced expands infinitely across six rings.
            </p>
          </div>

          {/* Contact Form, Transmission Channels, Social Links & Footer */}
          <ContactSection onReplay={() => handleSelectProgress(0)} />
        </div>
      </div>
    </main>
  );
}
