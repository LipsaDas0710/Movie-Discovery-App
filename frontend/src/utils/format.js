const TONES = [
  'oklch(0.26 0.04 45)',
  'oklch(0.24 0.035 280)',
  'oklch(0.25 0.03 160)',
  'oklch(0.23 0.04 20)',
  'oklch(0.26 0.03 100)',
  'oklch(0.24 0.045 320)',
];

// Placeholder poster colour until real TMDB poster URLs are wired in.
export const toneFor = (id) => TONES[id % TONES.length];

export const metaLine = (m) => `${m.year} · ★ ${Number(m.rating).toFixed(1)}`;
