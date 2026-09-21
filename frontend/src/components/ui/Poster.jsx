import { useState } from 'react';
import { toneFor } from '../../utils/format';

// Fixed-aspect poster. Falls back to the tinted placeholder when there is no image or it fails to load.
export default function Poster({ movie, className = '', children }) {
  const [broken, setBroken] = useState(false);
  const showImg = movie.posterUrl && !broken;

  return (
    <div className={`poster ${className}`} style={{ backgroundColor: toneFor(movie.id) }}>
      {showImg && (
        <img
          className="poster-img"
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
      {!showImg && <span className="poster-label">no poster</span>}
      {children}
    </div>
  );
}
