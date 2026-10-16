import { BackIcon } from './Icons.jsx';
import '../styles/Header.css';

export default function Header({ score, best, level, onExit, play }) {
  return (
    <header className="header">
      <button
        className="back-btn"
        onClick={() => { play('click'); onExit(); }}
        aria-label={`Back to start (${level})`}
      >
        <BackIcon />
        <span>Back</span>
      </button>
      <div className="score" aria-live="polite">
        <div>Score: <span key={score} className="bump">{score}</span></div>
        <div>Best score: {best}</div>
      </div>
    </header>
  );
}
