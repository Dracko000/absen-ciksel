import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* PWA Theme Color */}
        <meta name="theme-color" content="#3b82f6" />

        {/* PWA Display Settings */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Absensi Sekolah" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* PWA Description */}
        <meta name="application-name" content="Absensi Sekolah" />
        <meta name="description" content="Sistem Absensi Sekolah Berbasis Barcode" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
