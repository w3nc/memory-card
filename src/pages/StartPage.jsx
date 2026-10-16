import logo from '../assets/br-ba.png';
import { LEVELS } from '../levels.js';
import '../styles/StartPage.css';

export default function StartPage({ onPick, play }) {
  return (
    <main className="start">
      <h1 className="title">
        <img src={logo} alt="Gravity Falls" className="logo-img" decoding="async" />
      </h1>
      
      <div className="levels">
        {Object.keys(LEVELS).map((name, i) => (
          <button
            key={name}
            className="btn"
            style={{ '--i': i }}
            onClick={() => {
              play('click');
              onPick(name);
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </main>
  );
}
