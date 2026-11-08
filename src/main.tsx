import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('eval_store_settings');
      localStorage.removeItem('eval_store_products');
      localStorage.removeItem('eval_store_categories');
      localStorage.removeItem('eval_wishlist');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            direction: 'rtl',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#FAF8F5',
            color: '#1c1917',
          }}
        >
          <div
            style={{
              maxWidth: '450px',
              background: 'white',
              padding: '30px',
              borderRadius: '24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              border: '1px solid #e7e5e4',
            }}
          >
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              متجر إيفال | EVAL Fashion
            </h1>
            <p style={{ fontSize: '14px', color: '#78716c', marginBottom: '20px', lineHeight: '1.6' }}>
              حدث تحديث في البيانات، انقري أدناه لإعادة تشغيل المتجر بسلاسة وسرعة.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: '#064e3b',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              إعادة تحميل المتجر الآن ✨
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
