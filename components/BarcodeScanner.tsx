// components/BarcodeScanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: any) => void;
  scanCompleteCallback?: () => void;
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  scanCompleteCallback,
  fps = 10,
  qrbox = 250,
  aspectRatio = undefined,
  disableFlip = false
}) => {
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const scannerId = 'html5qr-code';

  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasCameraAccess(true);
      } catch (err) {
        console.error('Camera access denied:', err);
        setHasCameraAccess(false);
      }
    };

    checkCameraAccess();
  }, []);

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    if (hasCameraAccess) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        scannerId,
        {
          fps,
          qrbox,
          aspectRatio,
          disableFlip
        },
        false // Use the verbose flag (default true) as per the library
      );

      html5QrcodeScanner.render(
        (decodedText: string) => {
          onScanSuccess(decodedText);
          if (scanCompleteCallback) {
            // Stop the scanner after a successful scan
            html5QrcodeScanner?.clear().catch((error) => {
              console.error('Failed to stop scanner: ', error);
            });
          }
        },
        (errorMessage) => {
          if (onScanError) {
            onScanError(errorMessage);
          } else {
            console.warn(`QR code scan error: ${errorMessage}`);
          }
        }
      );
    }

    // Cleanup function
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((error) => {
          console.error('Failed to clear html5QrcodeScanner: ', error);
        });
      }
    };
  }, [hasCameraAccess, onScanSuccess, onScanError, scanCompleteCallback, fps, qrbox, aspectRatio, disableFlip]);

  if (hasCameraAccess === false) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded">
        <p>Akses kamera ditolak. Silakan aktifkan izin kamera untuk menggunakan fitur ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div 
        id={scannerId} 
        className="flex justify-center items-center"
      ></div>
    </div>
  );
};

export default BarcodeScanner;