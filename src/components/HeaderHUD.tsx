import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { sound } from '../utils/audio';
import { CHAPTERS } from '../data/storyData';

interface HeaderHUDProps {
  progress: number;
  currentChapterIndex: number;
  highlightedRingIndex: number | null;
  onSelectProgress: (progress: number) => void;
  onToggleHighlightRing: (ringIndex: number | null) => void;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  progress,
  currentChapterIndex,
  highlightedRingIndex,
  onSelectProgress,
  onToggleHighlightRing,
  isAutoPlay,
  onToggleAutoPlay,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleSound = () => {
    const isUnmuted = sound.toggleMute();
    setIsMuted(!isUnmuted);
  };

  const currentChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-3 sm:px-6 md:px-10 py-3 sm:py-5 flex items-center justify-between text-xs tracking-wider uppercase font-mono pointer-events-none select-none">
      {/* Brand Identity: Three Circles + Title */}
      <div className="flex items-center gap-2 sm:gap-3.5 pointer-events-auto">
        <button
          onClick={() => onSelectProgress(0)}
          className="group flex items-center gap-2.5 sm:gap-3 text-white transition-opacity hover:opacity-80 focus:outline-none cursor-pointer"
          title="Return to Stage 1"
        >
          <div className="flex items-center gap-[3px] sm:gap-[3.5px]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform group-hover:scale-125 duration-300" />
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform group-hover:scale-125 duration-300 delay-75" />
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform group-hover:scale-125 duration-300 delay-150" />
          </div>
          <span className="font-heading font-semibold text-xs sm:text-sm tracking-widest text-neutral-100 hidden xs:inline sm:inline">
            THE HOUSE OF FUTURE
          </span>
        </button>
      </div>

      {/* Center Cinematic Stage Indicator */}
      <div className="hidden lg:flex items-center gap-4 text-neutral-400 bg-neutral-950/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{currentChapter.number}</span>
          <span className="text-neutral-600">//</span>
          <span className="text-neutral-300 tracking-wider text-[11px]">{currentChapter.title}</span>
        </div>
        <div className="w-px h-3 bg-neutral-800" />
        <span className="font-mono text-[10px] text-neutral-400">
          {Math.round(progress * 100).toString().padStart(2, '0')}%
        </span>
      </div>

      {/* Right Controls: Minimal Inline Ring Jumpers, Auto Play, Sound */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Minimal inline ring focus numbers (01 to 06) */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 bg-neutral-950/60 backdrop-blur-md text-[10px]">
          <span className="text-neutral-600 px-1 font-mono text-[9px]">RINGS:</span>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isRingHighlighted = highlightedRingIndex === idx;
            const targetProg = 0.35 + idx * 0.10;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectProgress(targetProg);
                  onToggleHighlightRing(idx);
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono transition-all duration-200 cursor-pointer ${
                  isRingHighlighted
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
                title={`Jump to Ring 0${idx + 1}`}
              >
                0{idx + 1}
              </button>
            );
          })}
        </div>

        {/* About jump button */}
        <button
          onClick={() => {
            const el = document.getElementById('about');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/15 hover:border-white/40 bg-neutral-900/60 hover:bg-white hover:text-black text-neutral-200 transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer"
          title="About The House of Future"
        >
          <span>ABOUT</span>
        </button>

        {/* Collaborate jump button */}
        <button
          onClick={() => {
            const el = document.getElementById('collaborate');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border border-white/15 hover:border-white/40 bg-neutral-900/60 hover:bg-white hover:text-black text-neutral-200 transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer"
          title="Collaborate & Connect"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="hidden xs:inline">CONNECT</span>
        </button>

        {/* Auto Cinematic Playback Toggle */}
        <button
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-300 text-[10px] sm:text-[11px] cursor-pointer ${
            isAutoPlay
              ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              : 'bg-neutral-900/60 text-neutral-300 border-white/10 hover:border-white/30 hover:text-white'
          }`}
          title={isAutoPlay ? 'Pause Cinematic Journey' : 'Auto Play Journey'}
        >
          {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span className="hidden sm:inline">{isAutoPlay ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {/* Ambient Soundscape Toggle */}
        <button
          onClick={handleToggleSound}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 cursor-pointer ${
            !isMuted
              ? 'bg-white/15 border-white/40 text-white'
              : 'bg-neutral-900/60 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
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
