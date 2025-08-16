import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Composant ErrorBoundary simple (classe)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QueryErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          resetErrorBoundary: () => {
            this.setState({ hasError: false, error: null });
            if (this.props.onReset) {
              this.props.onReset();
            }
          }
        });
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Une erreur est survenue</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'Erreur inconnue'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) {
                  this.props.onReset();
                }
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant QueryErrorBoundary qui utilise le hook et retourne l'ErrorBoundary
export const QueryErrorBoundary = ({ children }) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription className="mt-2">
              Une erreur est survenue lors du chargement des données.
              <div className="mt-2 text-sm text-muted-foreground">
                {error.message}
              </div>
            </AlertDescription>
            <Button
              onClick={resetErrorBoundary}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </Alert>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}; 