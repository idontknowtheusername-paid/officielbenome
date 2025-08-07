import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log pour prod
    // eslint-disable-next-line no-console
    console.error('Erreur non interceptée:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const missingEnv = !supabaseUrl || !supabaseKey;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 720 }}>
            <h1 style={{ marginBottom: 12 }}>Une erreur est survenue</h1>
            <p style={{ opacity: 0.9 }}>
              {missingEnv
                ? 'Variables d\'environnement Supabase manquantes en production.'
                : 'Une erreur inattendue a été détectée.'}
            </p>
            <pre style={{
              textAlign: 'left',
              background: '#111827',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              marginTop: 16,
            }}>
{String(this.state.error)}
            </pre>
            {missingEnv && (
              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <p>Configurer dans Vercel → Settings → Environment Variables:</p>
                <code style={{ display: 'block', marginTop: 8 }}>VITE_SUPABASE_URL</code>
                <code style={{ display: 'block' }}>VITE_SUPABASE_ANON_KEY</code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

