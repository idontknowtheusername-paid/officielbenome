import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/constants/roles';
import { Loader2 } from 'lucide-react';

/**
 * AdminRoute component that protects admin routes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.requiredRoles] - Array of required role names (any of these roles will grant access)
 * @param {string[]} [props.requiredPermissions] - Array of required permissions (user must have all these permissions)
 * @param {string[]} [props.anyPermissions] - Array of permissions where user needs any one of them
 * @param {boolean} [props.strict] - If true, user must have exactly the specified role(s)
 * @param {string} [props.redirectTo] - Path to redirect to if not authorized (default: '/connexion')
 * @param {React.ReactNode} [props.unauthorized] - Custom component to render when unauthorized
 * @param {boolean} [props.loading] - Whether to show loading state
 * @returns {JSX.Element} Protected route or redirect
 */
const AdminRoute = ({
  children,
  requiredRoles = ['admin', 'super_admin'],
  requiredPermissions = [],
  anyPermissions = [],
  strict = false,
  redirectTo = '/connexion',
  unauthorized: UnauthorizedComponent,
  loading: isLoading = false,
  ...rest
}) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => 
    strict 
      ? user.role === role 
      : hasPermission(user, `admin:${role.replace('_admin', '')}`) || hasPermission(user, 'admin:*')
  );

  // Check if user has all required permissions
  const hasAllRequiredPermissions = requiredPermissions.length === 0 || 
    hasAllPermissions(user, requiredPermissions);
  
  // Check if user has any of the anyPermissions
  const hasAnyPermission = anyPermissions.length === 0 || 
    hasAnyPermission(user, anyPermissions);

  // Check if user is authorized
  const isAuthorized = hasRequiredRole && hasAllRequiredPermissions && hasAnyPermission;

  // If not authorized, show unauthorized component or redirect
  if (!isAuthorized) {
    if (UnauthorizedComponent) {
      return <UnauthorizedComponent />;
    }
    
    // Default unauthorized view
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Accès refusé</h2>
          <p className="text-muted-foreground">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
          <div className="pt-4">
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Retour au tableau de bord
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If authorized, render the children
  return children;
};

export default AdminRoute;
