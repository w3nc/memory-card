import { useCallback, useEffect, useRef } from 'react';
import clickCard from '../assets/sounds/click-card.mp3';
import cardFlip from '../assets/sounds/card-flip.mp3';
import winSound from '../assets/sounds/win-sound.mp3';
import loseSound from '../assets/sounds/lose-sound.mp3';

// Name -> file + volume. Use it as play('click'), play('flip'), play('win'), play('lose').
const SOUNDS = {
  click: { src: clickCard, volume: 0.5 },
  flip: { src: cardFlip, volume: 0.5 },
  win: { src: winSound, volume: 0.7 },
  lose: { src: loseSound, volume: 0.7 },
};

export default function useSound(enabled) {
  const cache = useRef({});

  // Preload once so the first click doesn't lag.
  useEffect(() => {
    Object.entries(SOUNDS).forEach(([name, { src }]) => {
      const a = new Audio(src);
      a.preload = 'auto';
      cache.current[name] = a;
    });
  }, []);

  return useCallback(
    (name) => {
      if (!enabled) return;
      const def = SOUNDS[name];
      if (!def) return;
      try {
        const base = cache.current[name] || new Audio(def.src);
        cache.current[name] = base;
        // Clone so rapid clicks can overlap instead of cutting each other off.
        const node = base.cloneNode();
        node.volume = def.volume;
        const p = node.play();
        if (p && p.catch) p.catch(() => {});
      } catch {
        /* audio is optional */
      }
    },
    [enabled]
  );
}
