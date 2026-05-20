import { useState, useEffect, useCallback, type RefObject } from 'react';

interface UseCameraProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export function useCamera({ videoRef }: UseCameraProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Required for iOS Safari to autoplay
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
      }
    } catch (err: any) {
      setHasPermission(false);
      setError(err.name === 'NotAllowedError' 
        ? 'Camera access denied. Please grant permissions in your browser.'
        : 'Failed to access camera. Device may be in use.'
      );
    }
  }, [facingMode, stopCamera, videoRef]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return { stream, error, hasPermission, startCamera, stopCamera, toggleCamera };
}