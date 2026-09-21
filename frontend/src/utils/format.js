const TONES = [
  'oklch(0.26 0.04 45)',
  'oklch(0.24 0.035 280)',
  'oklch(0.25 0.03 160)',
  'oklch(0.23 0.04 20)',
  'oklch(0.26 0.03 100)',
  'oklch(0.24 0.045 320)',
];

// Placeholder colour shown behind posters (and when a poster is missing).
export const toneFor = (id) => TONES[id % TONES.length];

export const formatRating = (r) => (r == null ? '—' : Number(r).toFixed(1));

// "2025 · ★ 7.4", tolerating missing year/rating.
export const metaLine = (m) => [m.year, m.rating != null ? `★ ${formatRating(m.rating)}` : null].filter(Boolean).join(' · ') || 'No info yet';

export const formatRuntime = (mins) => (mins ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m` : null);

export const formatMoney = (n) => {
  if (!n) return null;
  return n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${n.toLocaleString()}`;
};
