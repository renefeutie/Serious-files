import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Google Maps error listener and quota defense tap
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

const origError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => String(a)).join(' ');
  if (
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('InvalidKeyMapError')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
  origError.apply(console, args);
};

// Global error handler to catch cross-origin script error from Google Maps JS API gracefully
window.addEventListener('error', (event) => {
  if (
    event.message === 'Script error.' ||
    event.filename?.includes('maps.googleapis.com')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    // Prevent unhandled rejection overlay in development
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
