import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Vérifier si l'utilisateur a le rôle requis
  const hasRequiredRole = user.roles?.includes(requiredRole);
  
  // Si un rôle est requis mais que l'utilisateur ne l'a pas, rediriger vers la page d'accueil
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // Si tout est bon, afficher le composant enfant
  return children;
};

export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};
