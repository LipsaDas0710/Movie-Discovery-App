// Turns TMDB's shapes into the small, stable DTOs the client uses.
// Every field is defensive: TMDB regularly returns null/missing posters, dates, overviews, etc.
const IMG = 'https://image.tmdb.org/t/p';

const img = (path, size) => (path ? `${IMG}/${size}${path}` : null);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const yearOf = (date) => (typeof date === 'string' && /^\d{4}/.test(date) ? Number(date.slice(0, 4)) : null);
const rating = (m) => (m.vote_count > 0 && Number.isFinite(m.vote_average) ? Math.round(m.vote_average * 10) / 10 : null);
const title = (m) => m.title || m.original_title || 'Untitled';

// genreMap: Map<id, name>
function toSummary(m, genreMap = new Map()) {
  const ids = Array.isArray(m.genre_ids) ? m.genre_ids : (m.genres || []).map((g) => g.id);
  return {
    id: m.id,
    title: title(m),
    year: yearOf(m.release_date),
    rating: rating(m),
    posterUrl: img(m.poster_path, 'w342'),
    genres: ids.map((id) => genreMap.get(id)).filter(Boolean),
    language: m.original_language || null,
    popularity: num(m.popularity) ?? 0,
  };
}

function toDetail(m, genreMap = new Map()) {
  const crew = m.credits?.crew || [];
  const cast = (m.credits?.cast || []).slice(0, 12);
  const similar = (m.recommendations?.results || []).slice(0, 12);
  return {
    id: m.id,
    title: title(m),
    tagline: m.tagline || '',
    synopsis: m.overview || '',
    year: yearOf(m.release_date),
    releaseDate: m.release_date || null,
    runtimeMinutes: m.runtime > 0 ? m.runtime : null,
    rating: rating(m),
    voteCount: num(m.vote_count) ?? 0,
    genres: (m.genres || []).map((g) => g.name),
    language: m.original_language || null,
    status: m.status || null,
    budget: m.budget > 0 ? m.budget : null,
    posterUrl: img(m.poster_path, 'w500'),
    backdropUrl: img(m.backdrop_path, 'w1280'),
    director: crew.find((c) => c.job === 'Director')?.name || null,
    cast: cast.map((c) => ({ id: c.id, name: c.name, character: c.character || '', photoUrl: img(c.profile_path, 'w185') })),
    similar: similar.map((s) => toSummary(s, genreMap)),
  };
}

function toBackdropSummary(m, genreMap) {
  return { ...toSummary(m, genreMap), synopsis: m.overview || '', backdropUrl: img(m.backdrop_path, 'w1280') };
}

module.exports = { toSummary, toDetail, toBackdropSummary };
