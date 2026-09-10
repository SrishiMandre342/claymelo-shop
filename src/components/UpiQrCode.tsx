'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface UpiQrCodeProps {
  value: string;
  size?: number;
}

export default function UpiQrCode({ value, size = 200 }: UpiQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#1F2937', // crisp charcoal
          light: '#FFFFFF',
        },
      }, (error) => {
        if (error) console.error('QR code generation error:', error);
      });
    }
  }, [value, size]);

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-color)',
    }}>
      <canvas ref={canvasRef} />
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
        Scan with PhonePe, GPay, or Paytm
      </span>
    </div>
  );
}
