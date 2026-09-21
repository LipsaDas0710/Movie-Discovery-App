import { Link } from 'react-router-dom';

export default function NotFoundPage({ title = 'Page not found', text = 'That page doesn’t exist.' }) {
  return (
    <main className="page">
      <div className="state-box empty">
        <span className="state-title">{title}</span>
        <span className="state-text">{text}</span>
        <Link to="/" className="btn-primary">Back to browse</Link>
      </div>
    </main>
  );
}
