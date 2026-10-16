import { useEffect, useRef } from 'react';
import cardBack from '../assets/card-back.jpg';
import { createTilt } from '../tilt.js';
import '../styles/Card.css';

export default function Card({ character, flipped, onPick, index = 0 }) {
  const cardRef = useRef(null);
  const tiltRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    api.current = createTilt(cardRef.current, tiltRef.current);
    return () => api.current.destroy();
  }, []);

  useEffect(() => {
    api.current?.setLocked(flipped);
  }, [flipped]);

  return (
    <button
      ref={cardRef}
      className={flipped ? 'card flipped' : 'card'}
      style={{ '--i': index }}
      onClick={() => onPick(character)}
      aria-label={character.name}
    >
      <div className="tilt" ref={tiltRef}>
        <div className="card-inner">
          <div className="face front">
            {character.src ? (
              <img src={character.src} alt="" className="art-img" draggable="false" decoding="async" />
            ) : (
              <div className="art" style={{ background: character.color }}>
                {character.emoji}
              </div>
            )}
            <div className="name">{character.name}</div>
            <div className="glare" aria-hidden="true" />
          </div>
          <div className="face back" aria-hidden="true">
            <img src={cardBack} alt="" className="back-img" draggable="false" decoding="async" />
          </div>
        </div>
      </div>
    </button>
  );
}
