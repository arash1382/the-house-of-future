import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24 select-auto"
      aria-label="About The House of Future"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-neutral-950/90 border border-white/15 p-6 sm:p-10 md:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle background architectural geometry */}
        <div className="absolute inset-0 architectural-grid opacity-20 pointer-events-none" />
        
        {/* Three Circle Identity Mark */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-6 sm:mb-8 select-none">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/60" />
          <div className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-white ring-4 ring-white/10 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/60" />
        </div>

        {/* Section Header */}
        <div className="text-center space-y-2.5 mb-10 sm:mb-12">
          <div className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
            ABOUT // THE ECOSYSTEM
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white uppercase">
            THE HOUSE OF FUTURE
          </h2>
          <p className="font-mono text-[11px] sm:text-xs text-neutral-400 font-extralight tracking-widest uppercase">
            Iran&apos;s First Applied Artificial Intelligence Ecosystem
          </p>
        </div>

        {/* Persian Description Card */}
        <div
          dir="rtl"
          lang="fa"
          className="my-6 p-6 sm:p-8 md:p-10 rounded-2xl bg-white/[0.03] border border-white/15 text-right relative"
          style={{ fontFamily: "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          {/* Subtle Persian Label */}
          <div className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-4 text-left dir-ltr">
            درباره عمارت آینده // MANIFESTO
          </div>

          <div className="space-y-4 sm:space-y-6 text-neutral-200 text-sm sm:text-base md:text-lg lg:text-xl font-light leading-[2.1] sm:leading-[2.2] tracking-normal">
            <p className="font-medium text-white text-base sm:text-lg md:text-xl lg:text-2xl leading-[2]">
              عمارت آینده نخستین اکوسیستم کاربردی هوش مصنوعی در ایران است.
            </p>
            <p className="text-neutral-300">
              اکوسیستمی میان‌رشته‌ای که فرهنگ، فناوری، آموزش، ایده، خلاقیت و پژوهش را در یک ساختار مشترک گرد هم می‌آورد.
            </p>
            <p className="text-neutral-300">
              هدف عمارت آینده ایجاد بستری برای هم‌نشینی دانش‌ها، شکل‌گیری همکاری‌های نو و توسعه آینده‌ای مبتنی بر هوش مصنوعی است.
            </p>
          </div>
        </div>

        {/* Ecosystem Substrates Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 pt-8 border-t border-white/10 font-mono text-[10px] sm:text-xs text-neutral-400">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
            <span className="text-white text-base sm:text-lg font-light font-heading">06</span>
            <span className="tracking-wider text-neutral-400 uppercase">Primary Rings</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
            <span className="text-white text-base sm:text-lg font-light font-heading">28</span>
            <span className="tracking-wider text-neutral-400 uppercase">Active Nodes</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-white text-base sm:text-lg font-light font-heading">01</span>
            <span className="tracking-wider text-neutral-400 uppercase">Unified Core</span>
          </div>
        </div>
      </div>
    </section>
  );
};
