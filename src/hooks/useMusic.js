import { useEffect, useRef } from 'react';
import theme from '../assets/sounds/Breaking Bad Full Intro Title Sequence.mp3';

// Background music: your intro title sequence, looped quietly.
// Browsers block autoplay until the person interacts with the page, so if the
// first attempt is refused we start the track on the first click/tap/key press.
export default function useMusic(enabled) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio(theme);
      a.loop = true;
      a.volume = 0.1;
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (!enabled) {
      a.pause();
      return undefined;
    }

    // play() returns undefined in very old browsers, so never chain on it blindly.
    const tryPlay = () => {
      try {
        return Promise.resolve(a.play());
      } catch (err) {
        return Promise.reject(err);
      }
    };

    let off = () => {};
    tryPlay().catch(() => {
      const resume = () => {
        tryPlay().catch(() => {});
        off();
      };
      off = () => {
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
        window.removeEventListener('touchend', resume);
      };
      window.addEventListener('pointerdown', resume);
      window.addEventListener('keydown', resume);
      window.addEventListener('touchend', resume); // older iOS Safari
    });

    // Don't play audio (and burn battery) while the tab is in the background.
    const onVisibility = () => {
      if (document.hidden) a.pause();
      else tryPlay().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      off();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    []
  );
}
