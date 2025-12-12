# Aplikasi Absensi QR Code

Aplikasi absensi berbasis QR code untuk 3 level pengguna: Kepala Sekolah, Guru, dan Murid.

## Fitur Utama

1. **User Authentication**:
   - 3 jenis login: Kepala Sekolah (Superadmin), Guru (Admin), dan Murid (User)
   - Autentikasi menggunakan email dan password

2. **Level Akses & Peran**:
   - Kepala Sekolah: Dapat memindai QR code guru dan mengekspor data absensi guru/murid
   - Guru: Dapat memindai QR code murid dan mengekspor data absensi murid
   - Murid: Memiliki QR code dan dapat melihat riwayat absensi

3. **Fitur Export to Excel**:
   - Ekspor data absensi harian, mingguan, atau bulanan
   - Format Excel (.xlsx) dengan data: Nama, Tanggal, Waktu, Status, Catatan

4. **QR Code untuk Absensi**:
   - QR code dinamis untuk masing-masing pengguna
   - Kepala Sekolah memindai QR code guru
   - Guru memindai QR code murid

## Instalasi dan Penggunaan

### Prasyarat
- Node.js (versi 16 atau lebih tinggi)
- npm atau yarn
- Expo CLI (opsional)

### Instalasi

1. Clone atau unduh proyek ini
2. Masuk ke direktori proyek: `cd AttendanceApp`
3. Install dependensi: `npm install`
4. Jalankan aplikasi:
   - Untuk Android: `npx expo start --android`
   - Untuk iOS: `npx expo start --ios` (memerlukan Xcode)
   - Untuk Web: `npx expo start --web`

### Akun Demo

- Kepala Sekolah: 
  - Email: `kepsek@example.com`
  - Password: `password`

- Guru: 
  - Email: `guru@example.com`
  - Password: `password`

- Murid: 
  - Email: `murid@example.com`
  - Password: `password`

## Struktur Aplikasi

```
app/
├── _layout.tsx              # Navigasi utama aplikasi
├── index.tsx               # Halaman utama (redirect ke login)
├── login.tsx               # Halaman login
├── kepsek.tsx              # Dashboard kepala sekolah
├── guru.tsx                # Dashboard guru
├── murid.tsx               # Dashboard murid
├── scan.tsx                # Layar pemindai QR
├── export.tsx              # Layar ekspor data
└── (tabs)/                 # Direktori default dari Expo
```

## Teknologi yang Digunakan

- React Native
- Expo
- Expo Router (navigasi)
- Expo Camera & Barcode Scanner (QR scanning)
- React Native QRCode SVG
- Firebase (untuk database - mock data dalam demo)
- XLSX (untuk ekspor Excel)
- AsyncStorage (untuk menyimpan data lokal)

## Konfigurasi Firebase

Untuk menggunakan Firebase secara nyata, Anda perlu:

1. Buat proyek Firebase di https://firebase.google.com/
2. Tambahkan konfigurasi ke `firebaseConfig.js`
3. Ganti implementasi mock di `services/firebase.js` dengan implementasi Firebase sebenarnya

## Catatan Pengembangan

Aplikasi ini saat ini menggunakan mock data untuk simulasi. Dalam lingkungan produksi, Anda perlu mengganti implementasi layanan Firebase dengan koneksi Firebase sebenarnya.

## Lisensi

Proyek ini dibuat untuk keperluan demonstrasi dan pembelajaran.