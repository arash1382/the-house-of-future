import { RingInfo, Chapter } from '../types';

export const ECOSYSTEM_RINGS: RingInfo[] = [
  {
    id: 'ring-01',
    number: '01',
    title: 'Infrastructure & Development',
    subtitle: 'FOUNDATIONAL SUBSTRATE & COMPUTE',
    description: 'Autonomous systems, compute networks, neural architectures, and open protocols powering the frontier of intelligence in Iran.',
    nodes: [
      'House of AI Iran',
      'Victor Frankenstein AI Laboratory',
      'Cyborg Institute',
      'Dr. Caligari Cabinet',
      'Mehri Observatory',
      'Academium'
    ],
    pillars: [
      'Distributed Compute Substrates',
      'Autonomous Agent Architectures',
      'Neural Laboratory Pipelines',
      'Open Intelligence Protocols'
    ],
    manifesto: 'We construct not tools, but living environments where human ingenuity and machine capability co-evolve in perpetual equilibrium.',
    coordinates: '35°41\'N 51°25\'E',
    orbitRadius: 130,
    rotationSpeed: 0.0006
  },
  {
    id: 'ring-02',
    number: '02',
    title: 'Philosophy & Social Studies',
    subtitle: 'CONSCIOUSNESS & HUMAN SOCIETY',
    description: 'Investigating the metaphysical, psychological, and sociological horizons of synthetic mind, machine consciousness, and human agency.',
    nodes: [
      'Dasein Studio',
      'Human Institute',
      'Ravan Psychology Clinic'
    ],
    pillars: [
      'Phenomenology of Synthetic Mind',
      'Cognitive & Behavioral Psychology',
      'Ethics of Autonomous Systems',
      'Post-Biological Philosophy'
    ],
    manifesto: 'Intelligence without contemplation is merely acceleration. We question the nature of meaning when the author is no longer solely human.',
    coordinates: '51°30\'N 00°07\'W',
    orbitRadius: 195,
    rotationSpeed: -0.00045
  },
  {
    id: 'ring-03',
    number: '03',
    title: 'Education & Ideas',
    subtitle: 'KNOWLEDGE COMMONS & ACADEMIA',
    description: 'Transformative epistemic models, decentralized knowledge circles, and critical academies preparing minds for synthetic eras.',
    nodes: [
      'Dr. Ford AI School',
      'Envan AI Think Tank',
      'Enso Advisory Circle',
      'Anti AI Academy'
    ],
    pillars: [
      'Critical Machine Pedagogy',
      'Adaptive Epistemic Synthesizers',
      'Dialectical Future Colloquiums',
      'Interdisciplinary Think Tanks'
    ],
    manifesto: 'Democratizing not just access to knowledge, but the cognitive architectures required to synthesize and transcend it.',
    coordinates: '35°41\'N 139°41\'E',
    orbitRadius: 260,
    rotationSpeed: 0.00035
  },
  {
    id: 'ring-04',
    number: '04',
    title: 'Media & Publishing',
    subtitle: 'DISPATCHES & CRITICAL CHRONICLES',
    description: 'Independent cinematic journals, investigative dispatches, algorithmic journalism, and publishing houses recording the unfolding dawn.',
    nodes: [
      'Ayandeh Publishing',
      'Ivan Magazine',
      'Chapar News Agency',
      'Ped Studio',
      'Khalezanak Media',
      'Third Eye',
      'Jaguar Studio'
    ],
    pillars: [
      'Ayandeh Publishing Imprints',
      'Cinematic Investigations',
      'Algorithmic Journalism',
      'Archival Future Artifacts'
    ],
    manifesto: 'To document the emergence as it unfolds: capturing the dialectic between biological heritage and algorithmic dawn.',
    coordinates: '48°51\'N 02°21\'E',
    orbitRadius: 325,
    rotationSpeed: -0.00028
  },
  {
    id: 'ring-05',
    number: '05',
    title: 'Arts & Literature',
    subtitle: 'AESTHETICS & SPECULATIVE NARRATIVE',
    description: 'Avant-garde cinema, generative soundscapes, speculative architecture, and experimental design at the intersection of silicon and soul.',
    nodes: [
      'Alternative Film Studio',
      'Shivan Urban Studio',
      'House of Modern Art',
      'Queen Bee Studio',
      'X-One Music Ensemble',
      'Design Studio',
      'Cinema AI'
    ],
    pillars: [
      'Computational Cinema & Aesthetics',
      'Algorithmic Sound Compositions',
      'Speculative Urban Architecture',
      'Synthetic Narrative Laboratories'
    ],
    manifesto: 'Art is the sensory probe that tests the future before it solidifies into habit. Here, synthetic imagination meets human longing.',
    coordinates: '40°42\'N 74°00\'W',
    orbitRadius: 390,
    rotationSpeed: 0.00022
  },
  {
    id: 'ring-06',
    number: '06',
    title: 'Commerce & Exchange',
    subtitle: 'MARKETPLACES & VALUE ARCHITECTURE',
    description: 'Physical and virtual galleries, tokenized curatorial institutions, and sovereign venues for the emerging synthetic cultural economy.',
    nodes: [
      'Tivan Gallery'
    ],
    pillars: [
      'Curated Gallery Exhibitions',
      'Sovereign Cultural Economics',
      'Digital-Physical Provenance',
      'Autonomous Exchange Protocols'
    ],
    manifesto: 'Sustainable futures require sustainable vessels of exchange. We cultivate galleries that anchor synthetic culture into tangible permanence.',
    coordinates: '25°12\'N 55°16\'E',
    orbitRadius: 455,
    rotationSpeed: -0.00018
  }
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'stage-1',
    number: '00',
    title: 'THE THREE DOTS',
    subtitle: 'Equilibrium before movement',
    progressStart: 0,
    progressEnd: 0.10
  },
  {
    id: 'stage-2',
    number: '01',
    title: 'ORBITAL PATHS',
    subtitle: 'The protagonist separates & weaves trajectories',
    progressStart: 0.10,
    progressEnd: 0.20
  },
  {
    id: 'stage-3',
    number: '02',
    title: 'THE CORE EMERGES',
    subtitle: 'The House of Future central gravitational anchor',
    progressStart: 0.20,
    progressEnd: 0.30
  },
  {
    id: 'stage-4',
    number: '03',
    title: 'RING 01 // INFRASTRUCTURE & DEVELOPMENT',
    subtitle: 'Foundational substrate, laboratories & compute',
    progressStart: 0.30,
    progressEnd: 0.40
  },
  {
    id: 'stage-5',
    number: '04',
    title: 'RING 02 // PHILOSOPHY & SOCIAL STUDIES',
    subtitle: 'Consciousness, ethics & human society',
    progressStart: 0.40,
    progressEnd: 0.50
  },
  {
    id: 'stage-6',
    number: '05',
    title: 'RING 03 // EDUCATION & IDEAS',
    subtitle: 'Knowledge commons & dialectical academies',
    progressStart: 0.50,
    progressEnd: 0.60
  },
  {
    id: 'stage-7',
    number: '06',
    title: 'RING 04 // MEDIA & PUBLISHING',
    subtitle: 'Dispatches, magazines & chronicles of tomorrow',
    progressStart: 0.60,
    progressEnd: 0.70
  },
  {
    id: 'stage-8',
    number: '07',
    title: 'RING 05 // ARTS & LITERATURE',
    subtitle: 'Cinema, music, speculative urbanism & poetics',
    progressStart: 0.70,
    progressEnd: 0.80
  },
  {
    id: 'stage-9',
    number: '08',
    title: 'RING 06 // COMMERCE & EXCHANGE',
    subtitle: 'Galleries & cultural economy',
    progressStart: 0.80,
    progressEnd: 0.90
  },
  {
    id: 'stage-10',
    number: '09',
    title: 'THE LIVING SYNTHESIS',
    subtitle: 'Six concentric rings in perpetual harmony',
    progressStart: 0.90,
    progressEnd: 1.00
  }
];
