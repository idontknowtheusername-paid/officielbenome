import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute check:', { user: !!user, loading, requiredRole, path: location.pathname });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    console.log('🔒 User not authenticated, redirecting to /connexion');
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Vérifier si l'utilisateur a le rôle requis
  const hasRequiredRole =
    (Array.isArray(user.roles) && user.roles.includes(requiredRole)) ||
    user.role === requiredRole ||
    user.roles === requiredRole;
  
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
