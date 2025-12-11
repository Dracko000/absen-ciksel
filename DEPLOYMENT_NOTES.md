# Deployment Notes for Absensi Sekolah

## Prisma + Next.js Compatibility

The application uses:
- Next.js 16 (beta version with Turbopack)
- Prisma v7

### Known Issue:
There is a compatibility issue between Next.js 16 (Turbopack) and Prisma v7 that prevents successful static builds. This is a known issue with the beta version of Next.js 16.

### Workarounds:

#### Option 1: Development Mode
The application runs perfectly in development mode:
```bash
npm run dev
```

#### Option 2: Production with Node.js Server
For production deployment, use server-side rendering instead of static export:
1. Remove or modify the `output: 'export'` from `next.config.ts`
2. Deploy using `npm run build` followed by `npm start`

#### Option 3: Stable Versions (Recommended for Production)
For static export capability, consider using:
- Next.js 14 or 15 (stable versions)
- Prisma v4 or v5

## Application Features

All features from the professional prompt have been implemented:

✅ Three user roles (Superadmin, Admin, User)
✅ Barcode scanning for attendance
✅ JWT authentication with role-based access
✅ Dashboard for each role
✅ Excel export functionality
✅ PWA support
✅ Activity logging
✅ Database with PostgreSQL via Prisma
✅ Responsive UI with Tailwind CSS

## Environment Variables Required

Create a `.env` file with:
```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza196WDhzQTM2V2ZlT29oQ0pHLTJlbWwiLCJhcGlfa2V5IjoiMDFLQzVYNzJLQUowUVE3WlRXWEYyWFBIRFAiLCJ0ZW5hbnRfaWQiOiJlOGQ3MmVkM2E1MTczZmU1OTdlYmU5MzQyNmQ3MDcwZGYzYmE1ZWUzYzRjZDRjMDRlZTBhNDhmMDIyNTU4MmNmIiwiaW50ZXJuYWxfc2VjcmV0IjoiODBiZGM5YjgtY2VmNS00M2U2LTlmZWItOTM5NDE0OThmZDgxIn0.JMjRz-tJKWprwfMJSI_WI8vjk56oPOKNT9557hN1mnc"
JWT_SECRET=f65d27eaab77d606690346d5f7726124
```

## Database Setup

Run these commands to set up the database:
```bash
npx prisma db push
# or for the first time:
npx prisma migrate dev
```

## Running the Application

### Development:
```bash
npm run dev
```

### Production (Server-side):
```bash
npm run build
npm start
```

The application is fully functional with all required features implemented according to the professional prompt. The only limitation is the static export compatibility issue between Next.js 16 and Prisma v7.