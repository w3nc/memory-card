import logo from '../assets/br-ba-loading.png';
import '../styles/LoadingPage.css';

export default function LoadingPage() {
  return (
    <div className="loading">
      <div className="plate-wrap">
        <img src={logo} alt="Loading" className="loading-logo" />
      </div>
      <div className="load-bar" aria-hidden="true"><span /></div>
      <p>Loading…</p>
    </div>
  );
}
