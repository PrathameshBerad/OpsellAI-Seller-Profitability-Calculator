import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface-2)', border: '1px solid var(--accent-danger)', borderRadius: '16px' }}>
            <h1 style={{ color: 'var(--accent-danger)', fontFamily: 'Sora', marginBottom: '16px' }}>Oops, something went wrong.</h1>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans', marginBottom: '24px' }}>
              We encountered an unexpected error while calculating your numbers.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '10px 24px',
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'DM Sans',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}
