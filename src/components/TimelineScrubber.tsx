import React from 'react';
import { CHAPTERS } from '../data/storyData';

interface TimelineScrubberProps {
  progress: number;
  onSelectProgress: (progress: number) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  progress,
  onSelectProgress,
}) => {
  return (
    <div className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-4 select-none pointer-events-auto">
      {/* Chapter Nodes */}
      <div className="flex flex-col items-center gap-3.5 py-4 px-2 rounded-full bg-neutral-950/60 backdrop-blur-md border border-white/10 shadow-2xl">
        {CHAPTERS.map((chapter, idx) => {
          const isActive = progress >= chapter.progressStart && progress <= chapter.progressEnd;
          const isPassed = progress > chapter.progressEnd;

          return (
            <button
              key={chapter.id}
              onClick={() => onSelectProgress(chapter.progressStart + 0.02)}
              className="group relative flex items-center justify-center p-1"
              title={`${chapter.number} — ${chapter.title}`}
            >
              {/* Dot */}
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    : isPassed
                    ? 'bg-neutral-500 hover:bg-neutral-300'
                    : 'bg-neutral-800 hover:bg-neutral-600'
                }`}
              />

              {/* Tooltip on hover */}
              <div className="absolute right-7 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0 whitespace-nowrap bg-neutral-900 border border-white/15 px-3 py-1.5 rounded-lg text-[10px] font-mono text-neutral-200 tracking-wider shadow-xl flex items-center gap-2">
                <span className="text-white font-semibold">{chapter.number}</span>
                <span className="text-neutral-500">/</span>
                <span>{chapter.title}</span>
              </div>
            </button>
          );
        })}

        {/* Dynamic vertical indicator line */}
        <div className="w-0.5 h-16 bg-neutral-800 rounded-full relative overflow-hidden my-1">
          <div
            className="w-full bg-white transition-all duration-150"
            style={{ height: `${progress * 100}%` }}
          />
        </div>

        {/* Numeric percentage */}
        <span className="font-mono text-[9px] text-neutral-400">
          {Math.round(progress * 100).toString().padStart(2, '0')}%
        </span>
      </div>
    </div>
  );
};
