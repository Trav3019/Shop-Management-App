import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const scannedRef = useRef(false);

  useEffect(() => {
    scannedRef.current = false;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) {
          setErrorMsg('No camera found on this device.');
          setStatus('error');
          return;
        }

        // Prefer back camera on mobile
        const back = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        const deviceId = back?.deviceId ?? devices[0].deviceId;

        if (!videoRef.current) return;
        setStatus('scanning');

        await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (result && !scannedRef.current) {
            scannedRef.current = true;
            if (navigator.vibrate) navigator.vibrate(100);
            onScan(result.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            // Ignore NotFoundException — fires every frame when no barcode visible
          }
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
          setErrorMsg('Camera permission denied. Please allow camera access and try again.');
        } else {
          setErrorMsg(`Camera error: ${msg}`);
        }
        setStatus('error');
      }
    })();

    return () => {
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [onScan]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <CameraOff size={40} className="text-gray-300" />
        <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        <p className="text-xs text-gray-400">Use the Manual Entry tab instead.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-sm rounded-xl overflow-hidden bg-black aspect-[4/3]">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
        {status === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
            <Loader2 size={28} className="text-white animate-spin" />
            <span className="text-white text-xs">Starting camera…</span>
          </div>
        )}
        {status === 'scanning' && (
          <>
            {/* Scan-line overlay */}
            <div className="absolute inset-x-6 inset-y-6 border-2 border-[#367C2B] rounded-lg pointer-events-none" />
            <div className="absolute inset-x-6 top-1/2 h-0.5 bg-[#367C2B]/70 animate-pulse pointer-events-none" />
          </>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Camera size={13} />
        <span>Point camera at a barcode or QR code</span>
      </div>
    </div>
  );
}
