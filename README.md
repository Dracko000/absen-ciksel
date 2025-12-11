# Absensi Sekolah - Sistem Absensi Berbasis Barcode

Sistem absensi sekolah berbasis web yang dapat di-install di smartphone (PWA), memiliki tiga role utama (Superadmin, Admin, User), mendukung absensi melalui barcode scanning, dan menyediakan export data ke Excel.

## Fitur Utama

- **Tiga Role Pengguna**:
  - Superadmin (Kepala Sekolah): Mengelola data guru, melihat laporan guru
  - Admin (Guru): Mengelola data murid, mengabsen murid melalui barcode
  - User (Murid): Melihat riwayat absensi pribadi

- **Absensi Menggunakan Barcode**: Scan kamera smartphone/webcam untuk proses absensi

- **Dashboard Statistik**: Menampilkan jumlah kehadiran per hari, minggu, bulan

- **Export Data Absensi**: Pilihan export harian, mingguan, bulanan, dan rentang tanggal

- **PWA (Progressive Web App)**: Installable di smartphone dan support offline untuk proses scanning

- **Log Aktivitas**: Setiap absensi dan aktivitas lainnya dicatat

## Teknologi yang Digunakan

- Next.js 16 dengan TypeScript
- Tailwind CSS
- Prisma ORM dengan PostgreSQL
- JWT Authentication
- Barcode scanning (html5-qrcode)
- Excel export (xlsx)
- PWA Support

## Prasyarat

- Node.js (versi 18 atau lebih baru)
- npm atau yarn

## Instalasi

1. **Clone atau buat proyek ini**
   ```bash
   git clone <repository-url>
   cd absensi-sekolah
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Buat file `.env` di root direktori dengan konten:
   ```
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza196WDhzQTM2V2ZlT29oQ0pHLTJlbWwiLCJhcGlfa2V5IjoiMDFLQzVYNzJLQUowUVE3WlRXWEYyWFBIRFAiLCJ0ZW5hbnRfaWQiOiJlOGQ3MmVkM2E1MTczZmU1OTdlYmU5MzQyNmQ3MDcwZGYzYmE1ZWUzYzRjZDRjMDRlZTBhNDhmMDIyNTU4MmNmIiwiaW50ZXJuYWxfc2VjcmV0IjoiODBiZGM5YjgtY2VmNS00M2U2LTlmZWItOTM5NDE0OThmZDgxIn0.JMjRz-tJKWprwfMJSI_WI8vjk56oPOKNT9557hN1mnc"
   JWT_SECRET=f65d27eaab77d606690346d5f7726124
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Jalankan migrasi database**
   ```bash
   npx prisma migrate dev
   ```

## Menjalankan Aplikasi

### Mode Development
```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

### Build untuk Produksi
```bash
npm run build
npm start
```

## Struktur Proyek

```
absensi-sekolah/
├── components/          # Komponen React
│   ├── layout/          # Komponen layout (Sidebar, Header)
│   └── barcode/         # Komponen barcode (UserBarcode, BarcodeScanner)
├── context/             # React Context (AuthContext)
├── hooks/               # Custom hooks (useServiceWorker)
├── lib/                 # Utilitas dan layanan (auth, attendance, activity, excel)
├── pages/               # Halaman aplikasi
│   ├── api/             # Endpoint API
│   ├── admin/           # Halaman untuk guru
│   ├── superadmin/      # Halaman untuk kepala sekolah
│   └── user/            # Halaman untuk siswa
├── public/              # File statis (manifest.json, icons, sw.js)
├── styles/              # File CSS
├── utils/               # Utilitas tambahan
└── middleware.ts        # Middleware otentikasi
```

## Testing Fitur Utama

### 1. Otorisasi dan Otentikasi
- Buka halaman login (`/login`)
- Coba login dengan kredensial yang valid dan tidak valid
- Verifikasi bahwa halaman yang dilindungi tidak dapat diakses tanpa login
- Uji otentikasi role-based (Superadmin, Admin, User)

### 2. Dashboard
- Pastikan dashboard masing-masing role menampilkan data yang sesuai
- Verifikasi statistik kehadiran ditampilkan dengan benar
- Uji navigasi antar halaman untuk masing-masing role

### 3. Absensi Berbasis Barcode
- Akses halaman absensi sesuai role (Admin: `/admin/attendance`, Superadmin: `/superadmin/attendance`)
- Uji fitur pemindaian barcode
- Verifikasi bahwa data absensi disimpan dengan benar di database
- Pastikan hanya user dengan role yang sesuai yang bisa mengakses fitur

### 4. Ekspor Excel
- Kunjungi halaman laporan (`/admin/reports` atau `/superadmin/reports`)
- Uji berbagai pilihan ekspor (harian, mingguan, bulanan, rentang tanggal)
- Verifikasi file Excel yang dihasilkan memiliki format dan data yang benar

### 5. Log Aktivitas
- Lakukan beberapa aksi (login, scan barcode, ekspor data)
- Kunjungi halaman log aktivitas (`/admin/activity` atau `/superadmin/activity`)
- Verifikasi bahwa semua aktivitas tercatat dengan benar

### 6. PWA
- Buka aplikasi di browser modern (Chrome, Firefox, Safari)
- Coba install aplikasi ke home screen (Add to Home Screen)
- Verifikasi bahwa aplikasi berjalan sebagai PWA
- Uji fitur offline (akan membutuhkan penyesuaian lebih lanjut untuk caching API)

## Database Schema

Aplikasi menggunakan skema database berikut:

- **User**: Informasi pengguna (id, nama, email, role, barcodeData, dll.)
- **Attendance**: Catatan kehadiran (userId, attendanceType, status, tanggal, dll.)
- **ActivityLog**: Log aktivitas pengguna (userId, action, deskripsi, timestamp, dll.)

## Endpoint API

- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/register` - Registrasi pengguna
- `POST /api/auth/verify` - Verifikasi token
- `GET /api/activity` - Dapatkan log aktivitas
- Dan endpoint lainnya untuk manajemen absensi

## Kontribusi

1. Buat branch fitur (`git checkout -b feature/NamaFitur`)
2. Commit perubahan (`git commit -m 'Add some NamaFitur'`)
3. Push ke branch (`git push origin feature/NamaFitur`)
4. Buat Pull Request

## Lisensi

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE.md](LICENSE.md) untuk detail.

## Dukungan

Jika menemukan masalah atau bug, silakan buat issue di repository ini.