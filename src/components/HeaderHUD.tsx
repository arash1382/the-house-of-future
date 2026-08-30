import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Compass, Layers, Play, Pause } from 'lucide-react';
import { sound } from '../utils/audio';
import { CHAPTERS, ECOSYSTEM_RINGS } from '../data/storyData';
import { RingInfo } from '../types';

interface HeaderHUDProps {
  progress: number;
  currentChapterIndex: number;
  onSelectChapter: (progress: number) => void;
  onSelectRing: (ring: RingInfo) => void;
  isFreeFlight: boolean;
  onToggleFreeFlight: () => void;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  progress,
  currentChapterIndex,
  onSelectChapter,
  onSelectRing,
  isFreeFlight,
  onToggleFreeFlight,
  isAutoPlay,
  onToggleAutoPlay
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [showRingMenu, setShowRingMenu] = useState(false);
  const ringMenuRef = useRef<HTMLDivElement | null>(null);

  const handleToggleSound = () => {
    const isUnmuted = sound.toggleMute();
    setIsMuted(!isUnmuted);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ringMenuRef.current && !ringMenuRef.current.contains(e.target as Node)) {
        setShowRingMenu(false);
      }
    };
    if (showRingMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showRingMenu]);

  const currentChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-3 sm:px-6 md:px-10 py-3 sm:py-5 flex items-center justify-between text-xs tracking-wider uppercase font-mono pointer-events-none select-none">
      {/* Brand Identity: Three Circles + Title */}
      <div className="flex items-center gap-2 sm:gap-3.5 pointer-events-auto">
        <button
          onClick={() => onSelectChapter(0)}
          className="group flex items-center gap-2.5 sm:gap-3 text-white transition-opacity hover:opacity-80 focus:outline-none cursor-pointer"
          title="Return to Genesis"
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform group-hover:scale-125 duration-300" />
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform group-hover:scale-125 duration-300 delay-75" />
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform group-hover:scale-125 duration-300 delay-150" />
          </div>
          <span className="font-heading font-semibold text-xs sm:text-sm tracking-widest text-neutral-100 hidden xs:inline sm:inline">
            THE HOUSE OF FUTURE
          </span>
        </button>
      </div>

      {/* Center Cinematic Status: Chapter & Progress (visible on large screens to avoid tablet crowding) */}
      <div className="hidden lg:flex items-center gap-5 text-neutral-400 bg-neutral-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{currentChapter.number}</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300 tracking-widest">{currentChapter.title}</span>
        </div>
        <div className="w-px h-3 bg-neutral-800" />
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="font-mono text-[11px] text-neutral-300">
            {Math.round(progress * 100).toString().padStart(2, '0')}%
          </span>
        </div>
      </div>

      {/* Right Controls: Auto Play, Free Orbit, Rings Drawer, Audio */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
        {/* Collaborate & Connect Quick Nav */}
        <button
          onClick={() => onSelectChapter(1.0)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/15 hover:border-white/40 bg-neutral-900/70 hover:bg-white hover:text-black text-neutral-200 transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer"
          title="Jump to Collaborate & Connect Section"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>COLLABORATE</span>
        </button>

        {/* Auto Cinematic Playback Toggle */}
        <button
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer ${
            isAutoPlay
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              : 'bg-neutral-900/70 text-neutral-300 border-white/10 hover:border-white/30 hover:text-white'
          }`}
          title={isAutoPlay ? 'Pause Cinematic Journey' : 'Auto Play Journey'}
        >
          {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span className="hidden md:inline">{isAutoPlay ? 'PLAYING' : 'CINEMATIC'}</span>
        </button>

        {/* Free Flight Mode Toggle */}
        <button
          onClick={onToggleFreeFlight}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer ${
            isFreeFlight
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
              : 'bg-neutral-900/70 text-neutral-300 border-white/10 hover:border-white/30 hover:text-white'
          }`}
          title={isFreeFlight ? 'Return to Timeline' : 'Engage Free Orbit Physics'}
        >
          <Compass className="w-3 h-3" />
          <span className="hidden xl:inline">{isFreeFlight ? 'FREE ORBIT' : 'TIMELINE'}</span>
        </button>

        {/* Rings Index Trigger */}
        <div ref={ringMenuRef} className="relative">
          <button
            onClick={() => setShowRingMenu(!showRingMenu)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer ${
              showRingMenu
                ? 'bg-white/20 text-white border-white/40'
                : 'bg-neutral-900/70 text-neutral-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
            title="Ecosystem Rings Index"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden xs:inline sm:inline">RINGS</span>
          </button>

          {/* Rings Floating Dropdown */}
          {showRingMenu && (
            <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-neutral-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 sm:p-3 shadow-2xl space-y-1.5 z-50">
              <div className="text-[10px] text-neutral-500 font-labels px-2.5 py-1 tracking-widest">
                FOUR ECOSYSTEM RINGS
              </div>
              {ECOSYSTEM_RINGS.map((ring, idx) => (
                <button
                  key={ring.id}
                  onClick={() => {
                    onSelectRing(ring);
                    setShowRingMenu(false);
                    // Jump timeline to ring discovery section
                    onSelectChapter(0.46 + idx * 0.08);
                  }}
                  className="w-full text-left p-2 sm:p-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-start gap-2.5 sm:gap-3 group cursor-pointer"
                >
                  <span className="text-[10px] text-neutral-500 group-hover:text-white transition-colors mt-0.5 font-mono">
                    {ring.number}
                  </span>
                  <div>
                    <div className="text-xs text-white font-medium group-hover:text-neutral-200">
                      {ring.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-body normal-case line-clamp-1">
                      {ring.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ambient Soundscape Toggle */}
        <button
          onClick={handleToggleSound}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 cursor-pointer ${
            !isMuted
              ? 'bg-white/15 border-white/40 text-white'
              : 'bg-neutral-900/70 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Sound'}
        >
          {!isMuted ? (
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-white" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  );
};
