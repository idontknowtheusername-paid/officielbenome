import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Composant ErrorBoundary simple (classe) - sans hooks pour éviter les problèmes de contexte
class QueryErrorBoundaryClass extends React.Component {
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

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Une erreur inattendue a été détectée</AlertTitle>
            <AlertDescription className="mt-2">
              Une erreur est survenue lors du chargement.
              <div className="mt-2 text-sm text-muted-foreground">
                {this.state.error?.message || 'Erreur inconnue'}
              </div>
            </AlertDescription>
            <Button
              onClick={() => {
                this.resetErrorBoundary();
                window.location.reload();
              }}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recharger la page
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export simple sans hooks
export const QueryErrorBoundary = ({ children }) => {
  return (
    <QueryErrorBoundaryClass>
      {children}
    </QueryErrorBoundaryClass>
  );
}; 