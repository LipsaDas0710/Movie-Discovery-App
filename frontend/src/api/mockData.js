// Temporary catalogue used until the backend TMDB endpoints exist.
// Shape matches the DTO the backend will expose (see movie.mapper.js in the plan).
export const MOVIES = [
  { id: 1, title: 'The Quiet Orbit', year: 2025, rating: 8.4, runtime: '2h 11m', genres: 'Sci-Fi, Drama', pop: 98, synopsis: 'A salvage crew drifting past Neptune picks up a signal that should not exist, and has eleven hours to decide whether to answer it.' },
  { id: 2, title: 'Salt Harbour', year: 2024, rating: 7.6, runtime: '1h 48m', genres: 'Drama', pop: 81, synopsis: 'Two estranged sisters return to a fishing town that is slowly being bought out, and find the paperwork already bears their name.' },
  { id: 3, title: 'Nightbloom', year: 2025, rating: 7.1, runtime: '1h 56m', genres: 'Thriller', pop: 88, synopsis: 'A florist who works only after midnight begins receiving orders from an address that burned down a decade ago.' },
  { id: 4, title: 'Paper Tigers', year: 2023, rating: 8.0, runtime: '2h 04m', genres: 'Crime, Drama', pop: 74, synopsis: 'A junior auditor at a shipping conglomerate discovers a rounding error that turns out to be a person.' },
  { id: 5, title: 'Slow Comet', year: 2024, rating: 6.9, runtime: '1h 39m', genres: 'Comedy', pop: 66, synopsis: 'An astronomer sells his telescope to fund a road trip toward the one place his forecast says the sky will be clear.' },
  { id: 6, title: 'The Long Field', year: 2022, rating: 8.7, runtime: '2h 28m', genres: 'Drama, History', pop: 70, synopsis: 'Across three harvests, a family farm becomes the quiet battleground for a country changing its mind.' },
  { id: 7, title: 'Glasshouse', year: 2025, rating: 7.4, runtime: '1h 52m', genres: 'Mystery', pop: 92, synopsis: 'A locked-room case inside a botanical research station where every witness remembers a different weather.' },
  { id: 8, title: 'Radio Silence', year: 2023, rating: 7.9, runtime: '2h 01m', genres: 'Thriller, Sci-Fi', pop: 85, synopsis: 'The last operator of a decommissioned listening post refuses to leave until the frequency goes quiet.' },
  { id: 9, title: 'Hollow Bell', year: 2024, rating: 6.5, runtime: '1h 44m', genres: 'Horror', pop: 59, synopsis: 'A village rings its bell once a year to keep something asleep, and this year the rope snaps.' },
  { id: 10, title: 'Second Language', year: 2025, rating: 8.2, runtime: '1h 58m', genres: 'Romance, Drama', pop: 77, synopsis: 'Two translators fall for each other in a third language neither of them speaks well.' },
  { id: 11, title: 'Tin Sky', year: 2022, rating: 7.0, runtime: '1h 47m', genres: 'Action', pop: 63, synopsis: 'A cargo pilot takes one last run through contested airspace with a passenger who never files a name.' },
  { id: 12, title: 'Aperture', year: 2026, rating: 7.8, runtime: '2h 06m', genres: 'Drama, Mystery', pop: 95, synopsis: 'A war photographer returns home and starts finding images in her archive she has no memory of taking.' },
  { id: 13, title: 'Meridian Line', year: 2023, rating: 7.3, runtime: '1h 51m', genres: 'Adventure', pop: 68, synopsis: 'A surveyor walking a disputed border discovers the map has been wrong for two hundred years.' },
  { id: 14, title: 'Winter Count', year: 2024, rating: 8.1, runtime: '2h 14m', genres: 'Drama, History', pop: 72, synopsis: "A historian and her grandfather record a family's century, one painted year at a time." },
  { id: 15, title: 'Undertow', year: 2025, rating: 6.8, runtime: '1h 42m', genres: 'Thriller', pop: 80, synopsis: 'A lifeguard who saved a stranger is pulled into the life that stranger was trying to escape.' },
  { id: 16, title: 'Static Bloom', year: 2026, rating: 7.5, runtime: '1h 55m', genres: 'Sci-Fi', pop: 90, synopsis: "A city's flowers begin opening and closing in time with its network traffic." },
  { id: 17, title: 'Copper Town', year: 2022, rating: 7.2, runtime: '2h 08m', genres: 'Crime', pop: 57, synopsis: 'A retired detective takes a job as a night watchman at the mine that made his case go cold.' },
  { id: 18, title: 'Clear Air Turbulence', year: 2025, rating: 7.7, runtime: '1h 49m', genres: 'Action, Thriller', pop: 87, synopsis: 'Eight minutes of calm sky, one passenger who knows what happens next.' },
];

export const GENRES = ['All', 'Drama', 'Sci-Fi', 'Thriller', 'Comedy', 'Mystery', 'Horror', 'Action'];
export const SORTS = ['Popular', 'Top rated', 'Newest', 'A–Z'];
export const LANGS = ['English', 'Korean', 'Spanish', 'Japanese', 'French', 'Hindi'];
export const LANG_OPTS = ['Any language', ...LANGS];
export const langOf = (id) => LANGS[id % LANGS.length];

export const CAST = [
  { name: 'M. Oduya', role: 'Rell' },
  { name: 'J. Winters', role: 'Cmdr. Hale' },
  { name: 'S. Park', role: 'Ivo' },
  { name: 'L. Bright', role: 'Marina' },
  { name: 'T. Okafor', role: 'Dr. Sane' },
  { name: 'E. Kaya', role: 'Voice' },
];

export const REVIEWS = [
  { name: 'Priya N.', when: '2 days ago', score: 9, text: 'The middle hour is almost silent and it never once drags. Whoever cut this deserves every award going — the pacing does the work the dialogue refuses to.' },
  { name: 'Daniel Okonkwo', when: '1 week ago', score: 7, text: "Gorgeous to look at and genuinely tense, though the ending explains a little more than it needed to. Still the best thing I've seen this year in the genre." },
  { name: 'mika_84', when: '3 weeks ago', score: 8, text: 'Went in expecting spectacle, got a character study instead. The lead carries whole scenes on a look. Second viewing was better than the first.' },
];
