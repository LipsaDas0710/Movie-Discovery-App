// UI label -> value sent to the backend.
export const SORTS = [
  { label: 'Popular', value: 'popularity' },
  { label: 'Top rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
  { label: 'A–Z', value: 'title' },
];

export const LANGS = [
  { label: 'English', value: 'en' },
  { label: 'Korean', value: 'ko' },
  { label: 'Spanish', value: 'es' },
  { label: 'Japanese', value: 'ja' },
  { label: 'French', value: 'fr' },
  { label: 'Hindi', value: 'hi' },
];

export const DEFAULT_SORT = 'popularity';
export const langName = (code) => LANGS.find((l) => l.value === code)?.label || (code ? code.toUpperCase() : '—');
