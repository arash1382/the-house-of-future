import React, { useEffect, useRef, useCallback } from 'react';
import { ECOSYSTEM_RINGS } from '../data/storyData';
import { RingInfo, NodePoint, Particle } from '../types';
import { sound } from '../utils/audio';

interface StoryCanvasProps {
  progress: number;
  onSelectRing: (ring: RingInfo) => void;
  activeRingIndex: number | null;
  isFreeFlight: boolean;
}

export const StoryCanvas: React.FC<StoryCanvasProps> = ({
  progress,
  onSelectRing,
  activeRingIndex,
  isFreeFlight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse / Interaction state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false, isDown: false });
  const freeFlightPosRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Trails & Particles
  const trailRef = useRef<{ x: number; y: number; time: number; alpha: number }[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<NodePoint[]>([]);

  // Sound triggering refs
  const lastTriggeredRing = useRef<number | null>(null);

  // Initialize nodes for architectural mesh
  useEffect(() => {
    const nodes: NodePoint[] = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const ringIdx = i % 4;
      const baseRadius = ECOSYSTEM_RINGS[ringIdx].orbitRadius;
      const dist = baseRadius + (Math.random() - 0.5) * 40;
      nodes.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 1.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
        ringIndex: ringIdx,
        label: i % 6 === 0 ? `NODE.${(i + 1).toString().padStart(2, '0')}` : undefined,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    nodesRef.current = nodes;
  }, []);

  // Handle Resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasRef.current.width = width * dpr;
    canvasRef.current.height = height * dpr;
  }, []);

  useEffect(() => {
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [handleResize]);

  // Handle Mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      mouseRef.current.targetX = rawX - rect.width / 2;
      mouseRef.current.targetY = rawY - rect.height / 2;
      mouseRef.current.isHovering = true;
    };

    const handleMouseDown = () => {
      mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = touch.clientX - rect.left;
      const rawY = touch.clientY - rect.top;
      mouseRef.current.targetX = rawX - rect.width / 2;
      mouseRef.current.targetY = rawY - rect.height / 2;
      mouseRef.current.isHovering = true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      mouseRef.current.isDown = true;
      if (e.touches.length > 0 && containerRef.current) {
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.targetX = touch.clientX - rect.left - rect.width / 2;
        mouseRef.current.targetY = touch.clientY - rect.top - rect.height / 2;
        mouseRef.current.isHovering = true;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.isDown = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Store dynamic props in refs for continuous 60fps render loop without restart jank
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const isFreeFlightRef = useRef(isFreeFlight);
  isFreeFlightRef.current = isFreeFlight;

  const activeRingIndexRef = useRef(activeRingIndex);
  activeRingIndexRef.current = activeRingIndex;

  // Main Render Loop
  useEffect(() => {
    let animFrame: number;
    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;
      time += 0.016;

      const currentProgress = progressRef.current;
      const currentIsFreeFlight = isFreeFlightRef.current;
      const currentActiveRing = activeRingIndexRef.current;

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrame = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      if (width <= 0 || height <= 0) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Sound update
      sound.setProgress(currentProgress);

      // Heartbeat pulse calculation
      const pulseRate = currentProgress < 0.12 ? 2.5 : 1.2;
      const pulse = Math.sin(time * pulseRate) * 0.5 + 0.5;

      // Base Circle Dimensions
      const baseRadius = Math.max(16, Math.min(width * 0.024, 24));
      const circleSpacing = baseRadius * 2.8;

      // Global Camera Zoom & Pan based on progress
      let cameraScale = 1.0;
      let cameraOffsetY = 0;
      let cameraRotation = 0;

      if (currentProgress < 0.12) {
        // Opening Genesis: Crisp centered scale
        cameraScale = 1.0;
      } else if (currentProgress < 0.28) {
        // Separation: Subtle forward push
        const t = (currentProgress - 0.12) / 0.16;
        cameraScale = 1.0 + t * 0.15;
      } else if (currentProgress < 0.44) {
        // Weaving: Architectural grid view
        const t = (currentProgress - 0.28) / 0.16;
        cameraScale = 1.15 - t * 0.1;
        cameraOffsetY = Math.sin(t * Math.PI) * -30;
      } else if (currentProgress < 0.72) {
        // Rings discovery: Dynamic orbit zoom
        const t = (currentProgress - 0.44) / 0.28;
        cameraScale = 1.05 - t * 0.2;
        cameraRotation = t * 0.08;
      } else if (currentProgress < 0.88) {
        // Macro Living Synthesis: Cinematic wide pull
        const t = (currentProgress - 0.72) / 0.16;
        cameraScale = 0.85 - t * 0.25;
      } else {
        // Convergence & Return: Smooth reset to 1.0
        const t = (currentProgress - 0.88) / 0.12;
        cameraScale = 0.6 + t * 0.4;
      }

      // Center with dynamic offset + mouse parallax
      ctx.translate(
        centerX + mouseRef.current.x * 0.03,
        centerY + cameraOffsetY + mouseRef.current.y * 0.03
      );
      ctx.scale(cameraScale, cameraScale);
      ctx.rotate(cameraRotation);

      // -------------------------------------------------------------
      // 1. ARCHITECTURAL AMBIENT BACKGROUND & ORBITAL GRIDS
      // -------------------------------------------------------------
      if (currentProgress > 0.05) {
        const gridAlpha = Math.min(0.18, Math.sin(currentProgress * Math.PI) * 0.25);
        ctx.strokeStyle = `rgba(255, 255, 255, ${gridAlpha})`;
        ctx.lineWidth = 0.6;

        // Subtle crosshair guides
        ctx.beginPath();
        ctx.moveTo(-width * 0.6, 0);
        ctx.lineTo(width * 0.6, 0);
        ctx.moveTo(0, -height * 0.6);
        ctx.lineTo(0, height * 0.6);
        ctx.stroke();

        // Corner tick marks
        const tickDist = 200;
        ctx.beginPath();
        [-tickDist, tickDist].forEach((tx) => {
          [-tickDist, tickDist].forEach((ty) => {
            ctx.moveTo(tx - 6, ty);
            ctx.lineTo(tx + 6, ty);
            ctx.moveTo(tx, ty - 6);
            ctx.lineTo(tx, ty + 6);
          });
        });
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 2. THE FOUR ECOSYSTEM RINGS (Emerging organically)
      // -------------------------------------------------------------
      if (currentProgress > 0.2) {
        const ringProgress = Math.min(1, (currentProgress - 0.2) / 0.5);

        ECOSYSTEM_RINGS.forEach((ring, idx) => {
          const appearThreshold = 0.2 + idx * 0.1;
          if (currentProgress < appearThreshold) return;

          const ringAlphaBase = Math.min(1, (currentProgress - appearThreshold) / 0.15);
          const isRingFocused =
            currentActiveRing === idx ||
            (currentProgress >= 0.44 + idx * 0.07 && currentProgress < 0.44 + (idx + 1) * 0.07);

          // Audio chime trigger when passing into ring realm
          if (isRingFocused && lastTriggeredRing.current !== idx) {
            lastTriggeredRing.current = idx;
            sound.playDiscoverChime(idx);
          }

          const ringBaseRadius = ring.orbitRadius;
          const currentRadius = ringBaseRadius * (0.85 + ringProgress * 0.15);
          const rotAngle = time * (ring.rotationSpeed * 40) + idx * 0.5;

          // Outer Ring Line
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);

          if (isRingFocused) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * ringAlphaBase})`;
            ctx.lineWidth = 1.8;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * ringAlphaBase})`;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([4, 12]);
          }
          ctx.stroke();

          // Subtle secondary orbital wave / harmonic geometry for each ring
          if (idx === 1) {
            // Philosophy & Art: Morphing harmonic sine loop
            ctx.beginPath();
            const segments = 120;
            for (let s = 0; s <= segments; s++) {
              const theta = (s / segments) * Math.PI * 2;
              const wave = Math.sin(theta * 6 + time * 1.5) * (isRingFocused ? 12 : 5);
              const r = currentRadius + wave;
              const px = Math.cos(theta) * r;
              const py = Math.sin(theta) * r;
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * ringAlphaBase})`;
            ctx.lineWidth = 0.6;
            ctx.setLineDash([2, 6]);
            ctx.stroke();
          }

          // Orbital satellite markers on each ring
          const markerAngle = rotAngle;
          const mx = Math.cos(markerAngle) * currentRadius;
          const my = Math.sin(markerAngle) * currentRadius;

          ctx.beginPath();
          ctx.arc(mx, my, isRingFocused ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fillStyle = isRingFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
          ctx.fill();

          // Ring Numeric Label floating near orbital marker
          if (isRingFocused && ringAlphaBase > 0.5) {
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(`RING.${ring.number} // ${ring.coordinates}`, mx + 10, my - 6);
          }

          ctx.restore();
        });
      }

      // -------------------------------------------------------------
      // 3. LIVING NODES & CONNECTIONS
      // -------------------------------------------------------------
      if (currentProgress > 0.25) {
        const nodesAlpha = Math.min(1, (currentProgress - 0.25) / 0.2);
        const nodes = nodesRef.current;

        // Draw connections between proximate nodes
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          // Slow orbital rotation of nodes
          const baseRing = ECOSYSTEM_RINGS[n1.ringIndex || 0];
          const speed = baseRing ? baseRing.rotationSpeed * 30 : 0.005;
          const currentAngle = Math.atan2(n1.y, n1.x) + speed;
          const currentDist = Math.hypot(n1.x, n1.y);
          n1.x = Math.cos(currentAngle) * currentDist;
          n1.y = Math.sin(currentAngle) * currentDist;

          // Mouse gravitational influence
          const mdx = mouseRef.current.x - n1.x;
          const mdy = mouseRef.current.y - n1.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < 160) {
            const force = (1 - mDist / 160) * 1.5;
            n1.x += (mdx / mDist) * force;
            n1.y += (mdy / mDist) * force;
          }

          // Connect with nearby nodes
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90) {
              const edgeAlpha = (1 - dist / 90) * 0.15 * nodesAlpha;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${edgeAlpha})`;
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }

          // Draw Node dot
          ctx.beginPath();
          const nodePulse = Math.sin(time * 2 + n1.pulsePhase) * 0.5 + 0.5;
          ctx.arc(n1.x, n1.y, n1.radius * (0.8 + nodePulse * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${n1.alpha * nodesAlpha * (0.5 + nodePulse * 0.5)})`;
          ctx.fill();

          if (n1.label && nodesAlpha > 0.8) {
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * nodesAlpha})`;
            ctx.fillText(n1.label, n1.x + 6, n1.y + 3);
          }
        }
      }

      // -------------------------------------------------------------
      // 4. THE PROTAGONIST CIRCLE TRAJECTORY & RECOMBINATION
      // -------------------------------------------------------------
      let protagX = 0;
      let protagY = 0;
      let protagRadius = baseRadius;
      let leftCircleX = -circleSpacing;
      let leftCircleY = 0;
      let leftCircleAlpha = 1.0;
      let rightCircleX = circleSpacing;
      let rightCircleY = 0;
      let rightCircleAlpha = 1.0;

      let protagAlpha = 1.0;

      if (currentIsFreeFlight) {
        // Free Flight physics: Protagonist follows mouse freely
        const targetX = mouseRef.current.x;
        const targetY = mouseRef.current.y;
        freeFlightPosRef.current.vx += (targetX - freeFlightPosRef.current.x) * 0.05;
        freeFlightPosRef.current.vy += (targetY - freeFlightPosRef.current.y) * 0.05;
        freeFlightPosRef.current.vx *= 0.88;
        freeFlightPosRef.current.vy *= 0.88;
        freeFlightPosRef.current.x += freeFlightPosRef.current.vx;
        freeFlightPosRef.current.y += freeFlightPosRef.current.vy;

        protagX = freeFlightPosRef.current.x;
        protagY = freeFlightPosRef.current.y;
        protagAlpha = 1.0;
        leftCircleAlpha = 0.25;
        rightCircleAlpha = 0.25;
      } else if (currentProgress < 0.10) {
        // State 0: Genesis Opening - Canvas circles hidden to keep hero typography clean & unclipped
        protagX = 0;
        protagY = 0;
        protagAlpha = 0;
        leftCircleAlpha = 0;
        rightCircleAlpha = 0;
        protagRadius = baseRadius * (1.0 + pulse * 0.04);
      } else if (currentProgress < 0.14) {
        // State 0 -> 1 Transition: Fade in as separation begins
        const introT = (currentProgress - 0.10) / 0.04;
        protagX = 0;
        protagY = -introT * 20;
        protagAlpha = introT;
        leftCircleAlpha = 0.4 * introT;
        rightCircleAlpha = 0.4 * introT;
        protagRadius = baseRadius * (1.0 + pulse * 0.04);
      } else if (currentProgress < 0.28) {
        // State 1: Separation (Protagonist detaches and soars forward)
        const t = (currentProgress - 0.14) / 0.14;
        const easeT = t * t * (3 - 2 * t); // smoothstep

        protagX = Math.sin(easeT * Math.PI) * 140;
        protagY = -20 - easeT * 200;
        protagRadius = baseRadius * (1.0 - easeT * 0.25);
        protagAlpha = 1.0;

        // Companion circles fade to subtle anchors
        leftCircleAlpha = 0.4 * (1.0 - easeT * 0.6);
        rightCircleAlpha = 0.4 * (1.0 - easeT * 0.6);
      } else if (currentProgress < 0.44) {
        // State 2: Weaving Structures & Systems
        const t = (currentProgress - 0.28) / 0.16;
        const angle = t * Math.PI * 2.5;
        const spiralRadius = 120 + Math.sin(t * Math.PI * 4) * 40;

        protagX = Math.cos(angle) * spiralRadius;
        protagY = Math.sin(angle) * (spiralRadius * 0.7) - 60;
        protagRadius = baseRadius * 0.75;
        leftCircleAlpha = 0.2;
        rightCircleAlpha = 0.2;
      } else if (currentProgress < 0.72) {
        // State 3: Exploring the 4 Ecosystem Rings
        const t = (currentProgress - 0.44) / 0.28;
        const ringIdx = Math.min(3, Math.floor(t * 4));
        const ringT = (t * 4) % 1;
        const currentRing = ECOSYSTEM_RINGS[ringIdx];
        const r = currentRing.orbitRadius;
        const ringAngle = ringT * Math.PI * 2 + time * 0.5;

        protagX = Math.cos(ringAngle) * r;
        protagY = Math.sin(ringAngle) * r;
        protagRadius = baseRadius * 0.8;
        leftCircleAlpha = 0.15;
        rightCircleAlpha = 0.15;
      } else if (currentProgress < 0.88) {
        // State 4: Macro Living Synthesis
        const t = (currentProgress - 0.72) / 0.16;
        const grandAngle = t * Math.PI * 3 + time * 0.8;
        const grandRadius = 260 + Math.sin(t * Math.PI * 2) * 80;

        protagX = Math.cos(grandAngle) * grandRadius;
        protagY = Math.sin(grandAngle) * (grandRadius * 0.6);
        protagRadius = baseRadius * 0.7;
        leftCircleAlpha = 0.2 + t * 0.3;
        rightCircleAlpha = 0.2 + t * 0.3;
      } else {
        // State 5: Convergence & Reconnection into [ ● ● ● ]
        const t = (currentProgress - 0.88) / 0.12;
        const easeT = 1 - Math.pow(1 - t, 3); // cubic ease-out

        // Return path: Smooth curve back to (0, 0)
        const startX = 220;
        const startY = 120;
        protagX = (1 - easeT) * startX;
        protagY = (1 - easeT) * startY * Math.cos(easeT * Math.PI);
        protagRadius = (baseRadius * 0.7) + easeT * (baseRadius * 0.3);

        leftCircleAlpha = 0.5 + easeT * 0.5;
        rightCircleAlpha = 0.5 + easeT * 0.5;
      }

      // Sync free flight initial position if switching
      if (!currentIsFreeFlight) {
        freeFlightPosRef.current.x = protagX;
        freeFlightPosRef.current.y = protagY;
      }

      // -------------------------------------------------------------
      // 5. VECTOR TRAIL BEHIND THE PROTAGONIST
      // -------------------------------------------------------------
      if (currentProgress > 0.1) {
        trailRef.current.push({ x: protagX, y: protagY, time, alpha: 1.0 });
        if (trailRef.current.length > 50) {
          trailRef.current.shift();
        }

        // Draw trail curve
        if (trailRef.current.length > 2) {
          ctx.beginPath();
          ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
          for (let i = 1; i < trailRef.current.length - 1; i++) {
            const xc = (trailRef.current[i].x + trailRef.current[i + 1].x) / 2;
            const yc = (trailRef.current[i].y + trailRef.current[i + 1].y) / 2;
            ctx.quadraticCurveTo(trailRef.current[i].x, trailRef.current[i].y, xc, yc);
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Spawn dynamic micro-particles
        if (Math.random() < 0.4) {
          particlesRef.current.push({
            x: protagX,
            y: protagY,
            originX: protagX,
            originY: protagY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 1 + Math.random() * 2,
            alpha: 0.8,
            life: 0,
            maxLife: 30 + Math.random() * 20,
          });
        }
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
          ctx.fill();
        }
      }

      // -------------------------------------------------------------
      // 6. DRAW THE COMPANION CIRCLES (Left & Right)
      // -------------------------------------------------------------
      // Left Circle
      ctx.beginPath();
      ctx.arc(leftCircleX, leftCircleY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${leftCircleAlpha})`;
      ctx.fill();

      // Right Circle
      ctx.beginPath();
      ctx.arc(rightCircleX, rightCircleY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${rightCircleAlpha})`;
      ctx.fill();

      // -------------------------------------------------------------
      // 7. DRAW THE PROTAGONIST CENTER CIRCLE
      // -------------------------------------------------------------
      if (protagAlpha > 0.01) {
        // Outer subtle energy aura
        ctx.beginPath();
        ctx.arc(protagX, protagY, protagRadius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.06 * protagAlpha})`;
        ctx.fill();

        // Core crisp circle
        ctx.beginPath();
        ctx.arc(protagX, protagY, protagRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${protagAlpha})`;
        ctx.fill();
      }

      // Micro crosshair centered on protagonist when traveling
      if (currentProgress > 0.12 && currentProgress < 0.9) {
        ctx.beginPath();
        const ch = protagRadius * 2.2;
        ctx.moveTo(protagX - ch, protagY);
        ctx.lineTo(protagX + ch, protagY);
        ctx.moveTo(protagX, protagY - ch);
        ctx.lineTo(protagX, protagY + ch);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      ctx.restore();
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none z-10">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
