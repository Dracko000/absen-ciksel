import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserRole } from '@/lib/jwt-edge'; // Use Edge-compatible version

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-token'  // This could be used to verify tokens
  ];

  // Get the pathname
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token in headers or cookies
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('auth-token')?.value;

  // Route-based authorization rules
  const roleRequirements: { [key: string]: UserRole[] } = {
    // Superadmin routes
    '/api/admin': [UserRole.SUPERADMIN],
    '/admin': [UserRole.SUPERADMIN],

    // Admin routes (for teachers)
    '/api/guru': [UserRole.ADMIN],
    '/guru': [UserRole.ADMIN],
    '/api/teacher': [UserRole.ADMIN],
    '/teacher': [UserRole.ADMIN],

    // User routes (for students)
    '/api/student': [UserRole.USER],
    '/student': [UserRole.USER],
    '/api/murid': [UserRole.USER],
    '/murid': [UserRole.USER],
  };

  // Check if the current path requires specific roles
  let requiredRoles: UserRole[] | undefined;

  // Find if path matches any role requirement patterns
  for (const [routePattern, roles] of Object.entries(roleRequirements)) {
    if (pathname.startsWith(routePattern)) {
      requiredRoles = roles;
      break;
    }
  }

  // If a token exists, verify it
  if (token) {
    try {
      const decoded = await verifyToken(token); // Await the verification

      // If route requires specific roles, check authorization
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return NextResponse.redirect(new URL('/api/auth/unauthorized', request.url));
      }

      // Token is valid and authorized, proceed
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  } else {
    // No token, redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Apply middleware to specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}