export interface RingInfo {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  nodes: string[];
  pillars: string[];
  manifesto: string;
  coordinates: string;
  orbitRadius: number;
  rotationSpeed: number;
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  progressStart: number;
  progressEnd: number;
}

export interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  ringIndex?: number;
  label?: string;
  pulsePhase: number;
}

export interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}
