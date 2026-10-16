import { createRoot } from 'react-dom/client';
import './styles/base.css'; // global tokens, background, shared buttons (load first)
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
