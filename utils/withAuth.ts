import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken, checkAuthorization, UserRole } from '@/lib/auth';

type AuthOptions = {
  requiredRoles?: UserRole[];
};

const withAuth = (handler: NextApiHandler, options: AuthOptions = {}) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Access token is required' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Get user from token
      const user = await getUserFromToken(token);

      // Add user to request object
      (req as any).user = user;

      // Check role authorization if required roles are specified
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        const isAuthorized = checkAuthorization(user.role as UserRole, options.requiredRoles);
        if (!isAuthorized) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
      }

      // Call the original handler
      return handler(req, res);
    } catch (error: any) {
      console.error('Authentication error:', error);
      return res.status(401).json({ success: false, error: error.message || 'Unauthorized' });
    }
  };
};

export { withAuth };