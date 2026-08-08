import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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
