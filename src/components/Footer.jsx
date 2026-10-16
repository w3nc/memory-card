import { useState } from 'react';
import { VolumeOn, VolumeOff, MusicOn, MusicOff } from './Icons.jsx';
import '../styles/Footer.css';

export default function Footer({ soundOn, setSoundOn, musicOn, setMusicOn, play }) {
  const [help, setHelp] = useState(false);
  return (
    <footer className="footer">
      <div className="footer-left">
        <button
          className="round"
          aria-label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
          onClick={() => { play('click'); setSoundOn(!soundOn); }}
        >
          {soundOn ? <VolumeOn /> : <VolumeOff />}
        </button>
        <button
          className="round"
          aria-label={musicOn ? 'Turn music off' : 'Turn music on'}
          onClick={() => { play('click'); setMusicOn(!musicOn); }}
        >
          {musicOn ? <MusicOn /> : <MusicOff />}
        </button>
      </div>
      <button className="round" aria-label="How to play" onClick={() => setHelp(!help)}>
        {help ? '✕' : '?'}
      </button>
      {help && (
        <div className="help">
          <p>Click a card to score, but never click the same character twice.</p>
          <p>Cards reshuffle after every pick. Use the Back button to leave.</p>
        </div>
      )}
    </footer>
  );
}
