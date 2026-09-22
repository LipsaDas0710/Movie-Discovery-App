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

// "just now" / "3h ago" / "5d ago" for review timestamps.
export const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};
