import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-purge stale demo local caches to ensure fresh live database sync on mobile browsers
const CACHE_VERSION = 'v5_2k26_fresh';
if (localStorage.getItem('milad_cache_version') !== CACHE_VERSION) {
  const savedUser = localStorage.getItem('milad_user');
  localStorage.clear();
  if (savedUser) localStorage.setItem('milad_user', savedUser);
  localStorage.setItem('milad_cache_version', CACHE_VERSION);
}

class GlobalRootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Global Root Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#F59E0B', backgroundColor: '#021B15', fontFamily: 'sans-serif', minHeight: '100vh' }}>
          <h2>Application Rendering Error</h2>
          <p style={{ color: '#cbd5e1', fontSize: 13 }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ padding: '10px 20px', borderRadius: 8, backgroundColor: '#F59E0B', color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none', marginTop: 16 }}
          >
            Clear Browser Cache & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalRootErrorBoundary>
      <App />
    </GlobalRootErrorBoundary>
  </StrictMode>,
)
