import { useEffect, useState } from 'react';
import LoadingPage from './pages/LoadingPage.jsx';
import StartPage from './pages/StartPage.jsx';
import GamePage from './pages/GamePage.jsx';
import Footer from './components/Footer.jsx';
import useSound from './hooks/useSound.js';
import useMusic from './hooks/useMusic.js';
import { LEVELS } from './levels.js';
import characters from './characters.js';
import cardBack from './assets/card-back.jpg';
import logo from './assets/br-ba.png';
import winGif from './assets/win.gif';
import loseGif from './assets/lose.gif';
import { preloadImages, whenIdle } from './preload.js';

function loadBest() {
  try {
    return JSON.parse(localStorage.getItem('dl-best') || '{}');
  } catch {
    return {};
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(null); 
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [best, setBest] = useState(loadBest);
  const play = useSound(soundOn);
  useMusic(musicOn);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    // Use the loading screen to fetch what the next screens need...
    preloadImages([logo, cardBack, ...characters.map((c) => c.src)]);
    // ...and fetch the big win/lose GIFs later, when the browser is idle.
    whenIdle(() => preloadImages([winGif, loseGif]));
    return () => clearTimeout(t);
  }, []);

  const updateBest = (lvl, score) => {
    setBest((prev) => {
      if ((prev[lvl] || 0) >= score) return prev;
      const next = { ...prev, [lvl]: score };
      try {
        localStorage.setItem('dl-best', JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
      return next;
    });
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      {level ? (
        <GamePage
          key={level}
          level={level}
          config={LEVELS[level]}
          best={best[level] || 0}
          onBest={(s) => updateBest(level, s)}
          onExit={() => setLevel(null)}
          play={play}
        />
      ) : (
        <StartPage onPick={setLevel} play={play} />
      )}
      <Footer
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        musicOn={musicOn}
        setMusicOn={setMusicOn}
        play={play}
      />
    </>
  );
}
