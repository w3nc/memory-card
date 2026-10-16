import winGif from '../assets/win.gif';
import loseGif from '../assets/lose.gif';
import '../styles/GameOver.css';

export default function GameOver({ result, onRestart, onExit, play }) {
  const won = result === 'win';
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className={won ? 'panel win' : 'panel lose'}>
        <img
          className="panel-gif" decoding="async"
          src={won ? winGif : loseGif}
          alt={won ? "Walter White: You're goddamn right." : 'Walter White: Say my name.'}
        />
        <h2>{won ? 'You win!' : 'You lose!'}</h2>
        <div className="panel-actions">
          <button className="btn" onClick={() => { play('click'); onRestart(); }}>Restart</button>
          <button className="btn ghost" onClick={() => { play('click'); onExit(); }}>Change level</button>
        </div>
      </div>
    </div>
  );
}
