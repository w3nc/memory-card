import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import Card from '../components/Card.jsx';
import GameOver from '../components/GameOver.jsx';
import characters from '../characters.js';
import '../styles/GamePage.css';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const FLIP_MS = 420; // keep in sync with --flip in styles.css

const pickPool = (size) => shuffle(characters).slice(0, size);


const dealHand = (pool, clicked, shown) => {
  const fresh = pool.filter((c) => !clicked.has(c.id));
  const seen = pool.filter((c) => clicked.has(c.id));
  const first = shuffle(fresh)[0];
  const rest = shuffle([...fresh.filter((c) => c !== first), ...seen]);
  return shuffle([first, ...rest.slice(0, shown - 1)]);
};

export default function GamePage({ level, config, best, onBest, onExit, play }) {
  const [pool, setPool] = useState(() => pickPool(config.pool));
  const [clicked, setClicked] = useState(() => new Set());
  const [hand, setHand] = useState(() => dealHand(pool, new Set(), config.shown));
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState(null); // 'win' | 'lose' | null
  const busy = useRef(false);
  const timers = useRef([]);

  const score = clicked.size;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const handlePick = (character) => {
    if (busy.current || result) return;
    busy.current = true;

    if (clicked.has(character.id)) {
      play('lose');
      setResult('lose');
      busy.current = false;
      return;
    }

    const next = new Set(clicked).add(character.id);
    setClicked(next);
    onBest(next.size);

    if (next.size === config.pool) {
      play('win');
      setResult('win');
      busy.current = false;
      return;
    }

    play('click');
    setFlipped(true);
    later(() => play('flip'), 60);

    // Reshuffle while the cards are face-down, then flip back.
    later(() => setHand(dealHand(pool, next, config.shown)), FLIP_MS);
    later(() => {
      setFlipped(false);
      play('flip');
    }, FLIP_MS + 160);
    later(() => {
      busy.current = false;
    }, FLIP_MS * 2 + 160);
  };

  const restart = () => {
    const newPool = pickPool(config.pool);
    const empty = new Set();
    setPool(newPool);
    setClicked(empty);
    setHand(dealHand(newPool, empty, config.shown));
    setFlipped(false);
    setResult(null);
    busy.current = false;
  };

  return (
    <>
      <Header score={score} best={best} level={level} onExit={onExit} play={play} />
      <main className="table">
        <div className="cards">
          {hand.map((c, i) => (
            <Card key={c.id} index={i} character={c} flipped={flipped} onPick={handlePick} />
          ))}
        </div>
        <p className="progress">{score} / {config.pool}</p>
      </main>
      {result && <GameOver result={result} onRestart={restart} onExit={onExit} play={play} />}
    </>
  );
}
