import { useState, useEffect, useRef } from 'react';

interface BarcodeScannerProps {
  onScan: (decodedText: string, decodedResult: any) => void;
  onError: (errorMessage: string) => void;
  scanCompleteCallback?: (decodedText: string, decodedResult: any) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onScan, 
  onError, 
  scanCompleteCallback 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState('IDLE');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      };

      // Initialize with default config
      scannerRef.current = new Html5Qrcode("qr-reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        onScan,
        onError
      );

      setIsScanning(true);
      setScanningStatus('SCANNING');
      setError(null);
    } catch (err: any) {
      console.error("Error starting scanner: ", err);
      setError("Could not start scanner: " + err.message);
      onError("Could not start scanner: " + err.message);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
        setScanningStatus('STOPPED');
      } catch (err: any) {
        console.error("Error stopping scanner: ", err);
        setError("Could not stop scanner: " + err.message);
        onError("Could not stop scanner: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={videoRef} 
        id="qr-reader" 
        className="w-full max-w-md border-2 border-gray-300 rounded-lg overflow-hidden"
      />
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="mt-4 flex space-x-3">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Stop Scanning
          </button>
        )}
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        Status: {scanningStatus}
      </div>
    </div>
  );
};

export default BarcodeScanner;