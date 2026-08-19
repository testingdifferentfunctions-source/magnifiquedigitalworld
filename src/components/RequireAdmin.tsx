import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// The secret admin path is backend-only, so fall back to the home page.
const LOGIN_PATH = '/';

/**
 * Gate for administrative routes.
 * Renders (and therefore lets React lazily download) admin code only after the
 * backend has confirmed both a valid session and the `admin` role.
 * No secrets, paths or privileged logic live in the client bundle.
 */
const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading, roleLoading } = useAuth();
  const location = useLocation();

  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
