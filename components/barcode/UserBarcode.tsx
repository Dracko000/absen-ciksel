import { useEffect, useRef } from 'react';

interface UserBarcodeProps {
  userId: string;
  name: string;
  role: string;
}

const UserBarcode: React.FC<UserBarcodeProps> = ({ userId, name, role }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // For this implementation we'll simulate a barcode using a canvas
    // In a real implementation, you'd use a library like jsbarcode
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a simple simulation of a barcode
    ctx.fillStyle = '#000';
    
    // Draw a simple pattern to represent barcode
    const pattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1];
    const barWidth = canvas.width / pattern.length;
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === 1) {
        ctx.fillRect(i * barWidth, 0, barWidth - 1, canvas.height);
      }
    }
    
    // Add user info text below the barcode
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${name} (${role})`, canvas.width / 2, canvas.height + 15);
    ctx.fillText(userId, canvas.width / 2, canvas.height + 30);
  }, [userId, name, role]);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={60}
        className="border border-gray-300 p-2 bg-white"
      />
      <div className="mt-2 text-center">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-600">{role}</div>
        <div className="text-sm text-gray-500 font-mono">{userId}</div>
      </div>
    </div>
  );
};

export default UserBarcode;