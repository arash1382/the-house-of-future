import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only run on non-touch devices with fine pointers
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch) return;

    let animId: number;
    let isRunning = true;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isHovered = false;
    let isDown = false;
    let isVisible = false;

    const updateStyles = () => {
      if (!ringRef.current || !dotRef.current || !containerRef.current) return;

      if (!isVisible) {
        containerRef.current.style.opacity = '0';
        return;
      }

      containerRef.current.style.opacity = '1';

      // Dot position
      const dotScale = isDown ? 0.7 : 1;
      dotRef.current.style.transform = `translate3d(${targetX - 3}px, ${targetY - 3}px, 0) scale(${dotScale})`;

      // Ring position
      const ringSize = isHovered ? 48 : 26;
      const offset = ringSize / 2;
      ringRef.current.style.width = `${ringSize}px`;
      ringRef.current.style.height = `${ringSize}px`;
      ringRef.current.style.transform = `translate3d(${currentX - offset}px, ${currentY - offset}px, 0)`;
      ringRef.current.style.borderColor = isHovered
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(255, 255, 255, 0.25)';
      ringRef.current.style.backgroundColor = isHovered
        ? 'rgba(255, 255, 255, 0.05)'
        : 'transparent';
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) isVisible = true;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('.interactive-node') ||
          target.closest('[data-interactive]'))
      ) {
        isHovered = true;
      } else {
        isHovered = false;
      }
    };

    const handleMouseDown = () => {
      isDown = true;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (containerRef.current) containerRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisible = true;
    };

    const animateTrail = () => {
      if (!isRunning) return;
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      updateStyles();
      animId = requestAnimationFrame(animateTrail);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId = requestAnimationFrame(animateTrail);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ opacity: 0, transition: 'opacity 0.2s ease-out' }}
      className="hidden lg:block pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* Central precise dot */}
      <div
        ref={dotRef}
        className="fixed w-1.5 h-1.5 bg-white rounded-full transition-transform duration-75 pointer-events-none"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />

      {/* Trailing architectural ring */}
      <div
        ref={ringRef}
        className="fixed border border-neutral-500/50 rounded-full transition-[width,height,border-color,background-color] duration-300 ease-out pointer-events-none"
        style={{
          width: '26px',
          height: '26px',
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      />
    </div>
  );
};

