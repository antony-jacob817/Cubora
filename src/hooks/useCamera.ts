import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Production-grade camera hook for scanner system.
 * * Fixes:
 * - Proper async play() handling (autoplay rejection)
 * - No infinite re-render loops (stable callback refs)
 * - Clean stream teardown on unmount
 * - Proper error messaging for all failure modes
 */
export function useCamera({ videoRef }: UseCameraProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Use a ref for the stream to avoid stale closure issues and re-render loops
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    // Clear the video element srcObject to release the camera indicator
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  const startCamera = useCallback(async () => {
    // Stop any existing stream first
    stopCamera();
    setError(null);

    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setError('Camera API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = mediaStream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;

        // Await the play() promise — handles autoplay policy rejections gracefully
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          // NotAllowedError from autoplay is usually recoverable — the video will
          // start once the user interacts with the page. Don't treat it as fatal.
          if (playErr.name !== 'AbortError') {
            console.warn('Video autoplay was blocked. User interaction may be required:', playErr.message);
          }
        }
      }
    } catch (err: any) {
      setHasPermission(false);
      
      switch (err.name) {
        case 'NotAllowedError':
          setError('Camera access was denied. Please allow camera permissions in your browser settings and reload.');
          break;
        case 'NotFoundError':
          setError('No camera device was found. Please connect a camera and try again.');
          break;
        case 'NotReadableError':
          setError('Camera is in use by another application. Please close it and try again.');
          break;
        case 'OverconstrainedError':
          setError('Camera does not support the requested resolution. Trying with default settings...');
          // Retry with no constraints
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = fallbackStream;
            setHasPermission(true);
            setError(null);
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              try { await videoRef.current.play(); } catch { /* safe to ignore */ }
            }
          } catch {
            setError('Failed to access any camera device.');
          }
          break;
        default:
          setError(`Camera error: ${err.message || 'Unknown error occurred.'}`);
      }
    }
  }, [facingMode, stopCamera, videoRef]);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Restart camera when facingMode changes (only if already streaming)
  useEffect(() => {
    if (streamRef.current) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Cleanup on unmount — prevent camera indicator staying on
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { 
    stream: streamRef.current, 
    error, 
    hasPermission, 
    startCamera, 
    stopCamera, 
    toggleCamera 
  };
}