# Deployment Notes for Absensi Sekolah

## Application Stack

The application uses:
- Next.js 16 (with webpack for compatibility)
- PostgreSQL database (direct connection, not Prisma)
- next-pwa for PWA functionality
- Tailwind CSS for styling

## Application Features

All features from the professional prompt have been implemented:

✅ Three user roles (Superadmin, Admin, User)
✅ Barcode scanning for attendance
✅ JWT authentication with role-based access
✅ Dashboard for each role
✅ Excel export functionality
✅ PWA support
✅ Activity logging
✅ Database with PostgreSQL
✅ Responsive UI with Tailwind CSS
✅ Optimized performance with caching

## Environment Variables Required

Create a `.env` file with:
```
DATABASE_URL="postgresql://username:password@host:port/database_name"
NEXT_PUBLIC_DATABASE_URL="postgresql://username:password@host:port/database_name"
JWT_SECRET="your-jwt-secret-here"
NEXT_PUBLIC_JWT_SECRET="your-jwt-secret-here"
# Super admin registration token - keep this secure and do not expose
SUPERADMIN_REGISTRATION_TOKEN="your-superadmin-registration-token-here"
```

## Database Setup

Run these commands to set up the database:
```bash
npm run init-db  # Initialize the database tables
npm run seed-db  # Populate with sample data (optional)
```

## Progressive Web App (PWA) Features

### PWA Configuration:
- Service worker is automatically generated at build time
- Web app manifest is configured in `public/manifest.json`
- Icons are configured for various device sizes
- Caching strategy implemented for offline functionality

### PWA Installation:
Users can install the app on their devices by:
1. Visiting the website in Chrome, Edge, or other Chromium-based browsers
2. Clicking the install button in the address bar
3. Or using the "Add to Home Screen" option

### PWA Icons:
Replace the placeholder icon files in the `public/` directory:
- `icon-192x192.png`
- `icon-256x256.png`
- `icon-384x384.png`
- `icon-512x512.png`

## Running the Application

### Development:
```bash
npm run dev
```

### Production:
```bash
npm run build
npm start
```

### PWA Build (for analysis):
```bash
npm run build:pwa  # Standard PWA build
npm run analyze    # Build with bundle analysis
```

## Super Admin Registration

To create the first super admin account:
1. Generate a token: `npm run generate-token`
2. Add it to your `.env` file: `SUPERADMIN_REGISTRATION_TOKEN="generated-token"`
3. Access the registration page: `https://yourdomain.com/register-superadmin?token=generated-token`

## Deployment Considerations

### For Web Deployment:
- Ensure HTTPS is enabled (required for PWA features)
- Service workers require HTTPS in production
- Properly configure caching headers for static assets

### For Mobile App Installation:
- The app will be installable on mobile devices
- Offline functionality is available for cached content
- Push notifications can be implemented (not currently included)

The application is now fully configured as a Progressive Web App with all required features implemented and performance optimizations in place.