import React, { useEffect, useRef, useCallback } from 'react';
import { ECOSYSTEM_RINGS } from '../data/storyData';
import { RingInfo, Particle } from '../types';
import { sound } from '../utils/audio';

interface StoryCanvasProps {
  progress: number;
  highlightedRingIndex: number | null;
  onToggleHighlightRing: (ringIndex: number | null) => void;
  isFreeFlight: boolean;
}

interface StructuredNode {
  ringIndex: number;
  nodeIndex: number;
  name: string;
  baseAngle: number;
  pulseOffset: number;
}

export const StoryCanvas: React.FC<StoryCanvasProps> = ({
  progress,
  highlightedRingIndex,
  onToggleHighlightRing,
  isFreeFlight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse & Parallax
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    worldX: 0,
    worldY: 0,
  });

  // Free Flight physics
  const freeFlightPosRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Trails & Ambient Particles
  const trailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Camera lerp state
  const cameraRef = useRef({
    scale: 1.0,
    targetScale: 1.0,
    offsetY: 0,
    targetOffsetY: 0,
    rotation: 0,
  });

  // Pre-generate structured nodes for all 6 rings
  const nodesRef = useRef<StructuredNode[]>([]);
  useEffect(() => {
    const list: StructuredNode[] = [];
    ECOSYSTEM_RINGS.forEach((ring, rIdx) => {
      const count = ring.nodes.length;
      ring.nodes.forEach((name, nIdx) => {
        list.push({
          ringIndex: rIdx,
          nodeIndex: nIdx,
          name,
          baseAngle: (nIdx / count) * Math.PI * 2,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      });
    });
    nodesRef.current = list;

    // Seed ambient star particles
    const pts: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 1400,
        y: (Math.random() - 0.5) * 1400,
        originX: 0,
        originY: 0,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.15 + Math.random() * 0.35,
        life: Math.random() * 100,
        maxLife: 100,
      });
    }
    particlesRef.current = pts;
  }, []);

  // Sync props to refs for uninterrupted 60fps render loop
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const highlightedRingRef = useRef(highlightedRingIndex);
  highlightedRingRef.current = highlightedRingIndex;

  const isFreeFlightRef = useRef(isFreeFlight);
  isFreeFlightRef.current = isFreeFlight;

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
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [handleResize]);

  // Click & Mouse Interactions (Scroll remains primary, click only highlights/focuses in place)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      mouseRef.current.targetX = rawX - rect.width / 2;
      mouseRef.current.targetY = rawY - rect.height / 2;

      // Compute world coordinates
      const cam = cameraRef.current;
      const screenX = mouseRef.current.targetX;
      const screenY = mouseRef.current.targetY - cam.offsetY;
      mouseRef.current.worldX = screenX / (cam.scale || 1.0);
      mouseRef.current.worldY = screenY / (cam.scale || 1.0);

      // Check if hovering near an emerging ring
      const dist = Math.hypot(mouseRef.current.worldX, mouseRef.current.worldY);
      const prog = progressRef.current;
      let isNearRing = false;

      ECOSYSTEM_RINGS.forEach((ring, idx) => {
        const ringStartProg = 0.30 + idx * 0.10;
        if (prog >= ringStartProg) {
          if (Math.abs(dist - ring.orbitRadius) < 22) {
            isNearRing = true;
          }
        }
      });

      if (containerRef.current) {
        containerRef.current.style.cursor = isNearRing ? 'pointer' : 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cam = cameraRef.current;
      const rawX = e.clientX - rect.left - rect.width / 2;
      const rawY = e.clientY - rect.top - rect.height / 2 - cam.offsetY;
      const worldX = rawX / (cam.scale || 1.0);
      const worldY = rawY / (cam.scale || 1.0);
      const dist = Math.hypot(worldX, worldY);
      const prog = progressRef.current;

      let clickedRingIdx: number | null = null;
      let minDiff = 26;

      ECOSYSTEM_RINGS.forEach((ring, idx) => {
        const ringStartProg = 0.30 + idx * 0.10;
        // Only rings that have emerged or are emerging can be focused
        if (prog >= ringStartProg - 0.05) {
          const diff = Math.abs(dist - ring.orbitRadius);
          if (diff < minDiff) {
            minDiff = diff;
            clickedRingIdx = idx;
          }
        }
      });

      if (clickedRingIdx !== null) {
        try {
          sound.playDiscoverChime(clickedRingIdx);
        } catch {
          // safe
        }
        if (highlightedRingRef.current === clickedRingIdx) {
          onToggleHighlightRing(null);
        } else {
          onToggleHighlightRing(clickedRingIdx);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.targetX = touch.clientX - rect.left - rect.width / 2;
      mouseRef.current.targetY = touch.clientY - rect.top - rect.height / 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onToggleHighlightRing]);

  // Main Uninterrupted 60fps Animation Loop
  useEffect(() => {
    let animFrame: number;
    let isRunning = true;
    let time = 0;

    const render = () => {
      if (!isRunning) return;
      time += 0.016;

      const p = progressRef.current;
      const activeHighlight = highlightedRingRef.current;
      const isFree = isFreeFlightRef.current;

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

      // Safe sound progress update
      try {
        sound.setProgress(p);
      } catch {
        // audio error ignored to preserve animation
      }

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Heartbeat pulse calculation
      const pulse = Math.sin(time * 1.8) * 0.5 + 0.5;

      // Base Circle Dimensions
      const baseRadius = Math.max(16, Math.min(width * 0.024, 24));
      const circleSpacing = baseRadius * 2.3;

      // -------------------------------------------------------------
      // ONE CONTINUOUS CAMERA JOURNEY (Smoothly pulls back as rings emerge)
      // -------------------------------------------------------------
      let targetCamScale = 1.0;
      let targetCamOffsetY = 0;

      if (p < 0.10) {
        // Stage 1: The Three Dots
        targetCamScale = 1.0;
        targetCamOffsetY = 0;
      } else if (p < 0.20) {
        // Stage 2: Dots separate & create paths
        const t = (p - 0.10) / 0.10;
        targetCamScale = 1.0 + t * 0.1;
      } else if (p < 0.30) {
        // Stage 3: The House of Future Core emerges
        targetCamScale = 1.05;
      } else if (p < 0.40) {
        // Stage 4: Ring 01 emerges (radius 130)
        const t = (p - 0.30) / 0.10;
        targetCamScale = 1.0 - t * 0.08;
      } else if (p < 0.50) {
        // Stage 5: Ring 02 grows (radius 195)
        const t = (p - 0.40) / 0.10;
        targetCamScale = 0.92 - t * 0.09;
      } else if (p < 0.60) {
        // Stage 6: Ring 03 appears (radius 260)
        const t = (p - 0.50) / 0.10;
        targetCamScale = 0.83 - t * 0.09;
      } else if (p < 0.70) {
        // Stage 7: Ring 04 appears (radius 325)
        const t = (p - 0.60) / 0.10;
        targetCamScale = 0.74 - t * 0.09;
      } else if (p < 0.80) {
        // Stage 8: Ring 05 appears (radius 390)
        const t = (p - 0.70) / 0.10;
        targetCamScale = 0.65 - t * 0.08;
      } else if (p < 0.90) {
        // Stage 9: Ring 06 appears (radius 455)
        const t = (p - 0.80) / 0.10;
        targetCamScale = 0.57 - t * 0.07;
      } else {
        // Stage 10: Living Synthesis & Convergence (all 6 rings in harmony)
        targetCamScale = 0.50;
      }

      // If user highlighted a ring, apply gentle focal boost
      if (activeHighlight !== null) {
        targetCamScale *= 1.12;
      }

      // Smooth camera interpolation
      const cam = cameraRef.current;
      cam.scale += (targetCamScale - cam.scale) * 0.05;
      cam.offsetY += (targetCamOffsetY - cam.offsetY) * 0.05;

      // Apply camera transform + subtle mouse parallax
      ctx.translate(
        centerX + mouseRef.current.x * 0.025,
        centerY + cam.offsetY + mouseRef.current.y * 0.025
      );
      ctx.scale(cam.scale, cam.scale);

      // -------------------------------------------------------------
      // AMBIENT COSMIC BACKGROUND (Subtle drifting particles & coordinate grid)
      // -------------------------------------------------------------
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.x > 700) pt.x = -700;
        if (pt.x < -700) pt.x = 700;
        if (pt.y > 700) pt.y = -700;
        if (pt.y < -700) pt.y = 700;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pt.alpha * (p > 0.1 ? 0.35 : 0.18)})`;
        ctx.fill();
      }

      // Crosshair coordinate lines (visible once motion begins)
      if (p > 0.08) {
        const gridAlpha = Math.min(0.12, (p - 0.08) * 0.25);
        ctx.strokeStyle = `rgba(255, 255, 255, ${gridAlpha})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-600, 0);
        ctx.lineTo(600, 0);
        ctx.moveTo(0, -600);
        ctx.lineTo(0, 600);
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // STAGE 3: THE HOUSE OF FUTURE CORE EMERGES (Radius ~ 42)
      // -------------------------------------------------------------
      if (p > 0.22) {
        const coreAlpha = Math.min(1, (p - 0.22) / 0.10);
        ctx.save();

        // Core aura
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.03 * coreAlpha})`;
        ctx.fill();

        // Core perimeter ring
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * coreAlpha})`;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([2, 4]);
        ctx.stroke();

        // Core Center Dot & Label
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * coreAlpha})`;
        ctx.fill();

        if (coreAlpha > 0.5) {
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * coreAlpha})`;
          ctx.fillText('HOUSE OF FUTURE // CORE', 12, -8);
        }

        ctx.restore();
      }

      // -------------------------------------------------------------
      // STAGES 4 - 9: THE SIX ECOSYSTEM RINGS (Emerging gradually, rotating together)
      // -------------------------------------------------------------
      // Each ring emerges in order:
      // Ring 01: starts at p = 0.30
      // Ring 02: starts at p = 0.40
      // Ring 03: starts at p = 0.50
      // Ring 04: starts at p = 0.60
      // Ring 05: starts at p = 0.70
      // Ring 06: starts at p = 0.80
      ECOSYSTEM_RINGS.forEach((ring, idx) => {
        const startProg = 0.30 + idx * 0.10;
        if (p < startProg) return;

        // Gradual emergence transition (0 to 1 over 0.08 progress)
        const ringEntrance = Math.min(1, (p - startProg) / 0.08);
        const isHighlighted = activeHighlight === idx;

        // Current Radius: grows smoothly from core outward to base radius
        const currentRadius = ring.orbitRadius * (0.85 + ringEntrance * 0.15);

        // Continuous orbital rotation angle
        const rotAngle = time * (ring.rotationSpeed * 35) + idx * 0.4;

        ctx.save();

        // Orbit Line
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);

        if (isHighlighted) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * ringEntrance})`;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([]);
        } else {
          const baseAlpha = activeHighlight !== null ? 0.12 : 0.22;
          ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * ringEntrance})`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([3, 8]);
        }
        ctx.stroke();

        // Secondary subtle harmonic geometry for Philosophy & Arts rings
        if (idx === 1 || idx === 4) {
          ctx.beginPath();
          const segments = 100;
          for (let s = 0; s <= segments; s++) {
            const theta = (s / segments) * Math.PI * 2;
            const wave = Math.sin(theta * 6 + time * 1.4) * (isHighlighted ? 8 : 3.5);
            const r = currentRadius + wave;
            const px = Math.cos(theta) * r;
            const py = Math.sin(theta) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${(isHighlighted ? 0.35 : 0.10) * ringEntrance})`;
          ctx.lineWidth = 0.5;
          ctx.setLineDash([2, 5]);
          ctx.stroke();
        }

        // Orbital Satellite Marker
        const smx = Math.cos(rotAngle) * currentRadius;
        const smy = Math.sin(rotAngle) * currentRadius;

        ctx.beginPath();
        ctx.arc(smx, smy, isHighlighted ? 3.5 : 2.0, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? '#ffffff' : `rgba(255, 255, 255, ${0.5 * ringEntrance})`;
        ctx.fill();

        // Ring Title & Number floating alongside satellite marker
        if (ringEntrance > 0.4) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = isHighlighted
            ? 'rgba(255, 255, 255, 0.95)'
            : `rgba(255, 255, 255, ${0.45 * ringEntrance})`;
          ctx.fillText(`RING ${ring.number} // ${ring.title.toUpperCase()}`, smx + 10, smy - 4);
        }

        ctx.restore();
      });

      // -------------------------------------------------------------
      // STRUCTURED NODES FOR ALL EMERGED RINGS (All rotate simultaneously)
      // -------------------------------------------------------------
      const allNodes = nodesRef.current;
      const nodesByRing: { [key: number]: { x: number; y: number; name: string }[] } = {};

      allNodes.forEach((node) => {
        const ring = ECOSYSTEM_RINGS[node.ringIndex];
        const ringStartProg = 0.30 + node.ringIndex * 0.10;
        if (p < ringStartProg) return;

        const ringEntrance = Math.min(1, (p - ringStartProg) / 0.08);
        const isHighlighted = activeHighlight === node.ringIndex;

        // Current orbital position
        const speed = ring.rotationSpeed * 35;
        const currentAngle = node.baseAngle + time * speed;
        const radius = ring.orbitRadius * (0.85 + ringEntrance * 0.15);

        const nx = Math.cos(currentAngle) * radius;
        const ny = Math.sin(currentAngle) * radius;

        if (!nodesByRing[node.ringIndex]) nodesByRing[node.ringIndex] = [];
        nodesByRing[node.ringIndex].push({ x: nx, y: ny, name: node.name });

        // Node dot appearance
        const nodePulse = Math.sin(time * 2.2 + node.pulseOffset) * 0.5 + 0.5;
        const dotRadius = isHighlighted ? 3.5 : 2.0;
        const dotAlpha = isHighlighted
          ? 0.95
          : (activeHighlight !== null ? 0.25 : 0.45) * ringEntrance;

        // Node glow
        if (isHighlighted) {
          ctx.beginPath();
          ctx.arc(nx, ny, dotRadius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, 0.14)`;
          ctx.fill();
        }

        // Node center dot
        ctx.beginPath();
        ctx.arc(nx, ny, dotRadius * (0.85 + nodePulse * 0.25), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dotAlpha})`;
        ctx.fill();

        // Node Name: always visible when highlighted or when user is in that ring's chapter
        const isCurrentChapterRing =
          p >= ringStartProg && p < ringStartProg + 0.10;

        if ((isHighlighted || isCurrentChapterRing) && ringEntrance > 0.5) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = isHighlighted
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(255, 255, 255, 0.65)';
          ctx.fillText(node.name, nx + 8, ny + 3);

          // Micro tick crosshair
          ctx.beginPath();
          ctx.moveTo(nx - 3, ny);
          ctx.lineTo(nx + 3, ny);
          ctx.moveTo(nx, ny - 3);
          ctx.lineTo(nx, ny + 3);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // Animated synapse connections between nodes of highlighted or active ring
      const targetRingForSynapse =
        activeHighlight !== null
          ? activeHighlight
          : Math.floor((p - 0.30) / 0.10);

      if (targetRingForSynapse >= 0 && targetRingForSynapse < 6 && nodesByRing[targetRingForSynapse]) {
        const ringNodes = nodesByRing[targetRingForSynapse];
        if (ringNodes.length > 1) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${activeHighlight !== null ? 0.35 : 0.15})`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 5]);

          for (let i = 0; i < ringNodes.length; i++) {
            const nextIdx = (i + 1) % ringNodes.length;
            const n1 = ringNodes[i];
            const n2 = ringNodes[nextIdx];
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // STAGES 1 & 2: THE THREE DOTS & PROTAGONIST SEPARATION
      // -------------------------------------------------------------
      let protagX = 0;
      let protagY = 0;
      let protagRadius = baseRadius;
      let leftCircleAlpha = 1.0;
      let rightCircleAlpha = 1.0;
      let protagAlpha = 1.0;

      if (isFree) {
        // Free Orbit Mode
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
        leftCircleAlpha = 0.2;
        rightCircleAlpha = 0.2;
      } else if (p < 0.10) {
        // Stage 1: The Three Dots equilibrium [ ● ● ● ]
        // Canvas center circle hidden while hero DOM logo is displayed
        protagX = 0;
        protagY = 0;
        protagAlpha = 0;
        leftCircleAlpha = 0;
        rightCircleAlpha = 0;
      } else if (p < 0.20) {
        // Stage 2: Dots separate and weave orbital paths
        const t = (p - 0.10) / 0.10;
        const easeT = t * t * (3 - 2 * t);

        // Center dot separates and soars upward/around
        protagX = Math.sin(easeT * Math.PI * 1.5) * 160;
        protagY = -easeT * 180;
        protagRadius = baseRadius * (1.0 - easeT * 0.3);
        protagAlpha = 1.0;

        leftCircleAlpha = 0.5 * (1.0 - easeT * 0.5);
        rightCircleAlpha = 0.5 * (1.0 - easeT * 0.5);
      } else if (p < 0.30) {
        // Stage 3: Weaving toward the core
        const t = (p - 0.20) / 0.10;
        const angle = t * Math.PI * 2;
        const r = 80 * (1 - t * 0.5);
        protagX = Math.cos(angle) * r;
        protagY = Math.sin(angle) * r;
        protagRadius = baseRadius * 0.7;
        protagAlpha = 1.0 - t * 0.4;
        leftCircleAlpha = 0.2;
        rightCircleAlpha = 0.2;
      } else if (p < 0.90) {
        // Stages 4 - 9: Traveling as an active orbital voyager along current outer ring
        const currentActiveRingIdx = Math.min(5, Math.max(0, Math.floor((p - 0.30) / 0.10)));
        const curRing = ECOSYSTEM_RINGS[currentActiveRingIdx];
        const ringProg = ((p - 0.30) % 0.10) / 0.10;
        const angle = ringProg * Math.PI * 2 + time * 0.6;
        const r = curRing.orbitRadius;

        protagX = Math.cos(angle) * r;
        protagY = Math.sin(angle) * r;
        protagRadius = baseRadius * 0.6;
        protagAlpha = 0.85;
        leftCircleAlpha = 0.12;
        rightCircleAlpha = 0.12;
      } else {
        // Stage 10: Reconnecting into [ ● ● ● ]
        const t = (p - 0.90) / 0.10;
        const easeT = 1 - Math.pow(1 - t, 3);
        protagX = (1 - easeT) * 160;
        protagY = (1 - easeT) * 80;
        protagRadius = baseRadius * 0.7 + easeT * (baseRadius * 0.3);
        protagAlpha = 0.4 + easeT * 0.6;
        leftCircleAlpha = 0.2 + easeT * 0.8;
        rightCircleAlpha = 0.2 + easeT * 0.8;
      }

      // Sync free flight initial position
      if (!isFree) {
        freeFlightPosRef.current.x = protagX;
        freeFlightPosRef.current.y = protagY;
      }

      // Trail behind traveling protagonist
      if (p > 0.10 && p < 0.92) {
        trailRef.current.push({ x: protagX, y: protagY, alpha: 1.0 });
        if (trailRef.current.length > 40) trailRef.current.shift();

        if (trailRef.current.length > 2) {
          ctx.beginPath();
          ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
          for (let i = 1; i < trailRef.current.length - 1; i++) {
            const xc = (trailRef.current[i].x + trailRef.current[i + 1].x) / 2;
            const yc = (trailRef.current[i].y + trailRef.current[i + 1].y) / 2;
            ctx.quadraticCurveTo(trailRef.current[i].x, trailRef.current[i].y, xc, yc);
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      // Draw Companion Left & Right Dots
      if (leftCircleAlpha > 0.02) {
        ctx.beginPath();
        ctx.arc(-circleSpacing, 0, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${leftCircleAlpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(circleSpacing, 0, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${rightCircleAlpha})`;
        ctx.fill();
      }

      // Draw Protagonist Center Circle
      if (protagAlpha > 0.02) {
        // Outer aura
        ctx.beginPath();
        ctx.arc(protagX, protagY, protagRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * protagAlpha})`;
        ctx.fill();

        // Core circle
        ctx.beginPath();
        ctx.arc(protagX, protagY, protagRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${protagAlpha})`;
        ctx.fill();
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
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-10 select-none"
      style={{ touchAction: 'pan-y' }}
      aria-label="The House of Future Orbital System Canvas"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
