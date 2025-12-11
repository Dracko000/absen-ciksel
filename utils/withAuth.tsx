import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/auth';
import { useEffect } from 'react';

interface WithAuthProps {
  requiredRoles?: UserRole[];
}

export function withAuth<P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRoles }: WithAuthProps = {}
) {
  const authenticatedComponent = (props: P) => {
    const router = useRouter();
    const { state } = useAuth();

    useEffect(() => {
      // If not authenticated, redirect to login
      if (!state.isAuthenticated) {
        router.push('/login');
        return;
      }

      // If specific roles are required, check authorization
      if (requiredRoles && state.user) {
        const userRole = state.user.role as UserRole;
        if (!requiredRoles.includes(userRole)) {
          // Redirect to unauthorized page or home
          router.push('/unauthorized');
        }
      }
    }, [state, router, requiredRoles]);

    // If loading or not authenticated, show loading state
    if (!state.isAuthenticated || state.loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    // If roles are required and user doesn't have the right role, don't render
    if (requiredRoles && state.user) {
      const userRole = state.user.role as UserRole;
      if (!requiredRoles.includes(userRole)) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Unauthorized Access</div>
          </div>
        );
      }
    }

    return <WrappedComponent {...props} />;
  };

  return authenticatedComponent;
};