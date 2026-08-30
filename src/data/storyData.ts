import { RingInfo, Chapter } from '../types';

export const ECOSYSTEM_RINGS: RingInfo[] = [
  {
    id: 'ring-01',
    number: '01',
    title: 'Ecosystem & Development',
    subtitle: 'THE FOUNDATIONAL SUBSTRATE',
    description: 'Autonomous systems, neural frameworks, and open architectural protocols powering the next era of synthetic cognition.',
    pillars: [
      'Distributed Agent Networks',
      'Cognitive Substrates & Compute',
      'Open Intelligence Protocols',
      'Emergent Systems Engineering'
    ],
    manifesto: 'We construct not tools, but living environments where human ingenuity and machine capability co-evolve in perpetual equilibrium.',
    coordinates: '34°03\'N 118°14\'W',
    orbitRadius: 180,
    rotationSpeed: 0.0006
  },
  {
    id: 'ring-02',
    number: '02',
    title: 'Philosophy & Art',
    subtitle: 'CONSCIOUSNESS & AESTHETICS',
    description: 'Examining the metaphysical, ethical, and artistic horizons of artificial thought, synthetic creativity, and digital existence.',
    pillars: [
      'Ethics of Synthetic Intent',
      'Computational Aesthetics',
      'The Speculative Mind Laboratory',
      'Post-Biological Philosophy'
    ],
    manifesto: 'Intelligence without contemplation is merely acceleration. We question the nature of meaning when the author is no longer solely human.',
    coordinates: '51°30\'N 00°07\'W',
    orbitRadius: 280,
    rotationSpeed: -0.0004
  },
  {
    id: 'ring-03',
    number: '03',
    title: 'Education & Ideas',
    subtitle: 'KNOWLEDGE COMMONS',
    description: 'Transformative epistemic models and decentralized learning environments designed for the co-evolution of mind and machine.',
    pillars: [
      'Adaptive Epistemic Synthesizers',
      'Open Scientific Archives',
      'Cognitive Apprenticeship',
      'Future Discourse Colloquiums'
    ],
    manifesto: 'Democratizing not just access to knowledge, but the cognitive architectures required to synthesize and transcend it.',
    coordinates: '35°41\'N 139°41\'E',
    orbitRadius: 380,
    rotationSpeed: 0.0003
  },
  {
    id: 'ring-04',
    number: '04',
    title: 'Media & Publishing',
    subtitle: 'CHRONICLES OF TOMORROW',
    description: 'Independent cinematic journals, critical essays, living research monographs, and dispatches from the frontier of change.',
    pillars: [
      'The House Quarterly Journal',
      'Living Research Monograms',
      'Cinematic Explorations',
      'Archival Future Artifacts'
    ],
    manifesto: 'To document the emergence as it unfolds: documenting the dialectic between biological heritage and algorithmic dawn.',
    coordinates: '48°51\'N 02°21\'E',
    orbitRadius: 480,
    rotationSpeed: -0.0002
  }
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'opening',
    number: '00',
    title: 'THE GENESIS TRINITY',
    subtitle: 'Equilibrium before movement',
    progressStart: 0,
    progressEnd: 0.12
  },
  {
    id: 'separation',
    number: '01',
    title: 'THE PROTAGONIST DEPARTS',
    subtitle: 'A single point begins to travel',
    progressStart: 0.12,
    progressEnd: 0.28
  },
  {
    id: 'weaving',
    number: '02',
    title: 'PATHS & RELATIONSHIPS',
    subtitle: 'Structures emerge from continuous motion',
    progressStart: 0.28,
    progressEnd: 0.44
  },
  {
    id: 'discovery',
    number: '03',
    title: 'THE FOUR ECOSYSTEM RINGS',
    subtitle: 'Intelligence, Philosophy, Education, Media',
    progressStart: 0.44,
    progressEnd: 0.72
  },
  {
    id: 'macrocosm',
    number: '04',
    title: 'THE LIVING SYNTHESIS',
    subtitle: 'The ecosystem reaches full emergence',
    progressStart: 0.72,
    progressEnd: 0.88
  },
  {
    id: 'convergence',
    number: '05',
    title: 'RETURN & INFINITY',
    subtitle: 'The future remains unfinished',
    progressStart: 0.88,
    progressEnd: 1.0
  }
];
