/**
 * OpenCV.js Runtime Loader
 * 
 * Handles loading the OpenCV WASM runtime from CDN with:
 * - Cached script race condition protection
 * - Timeout fallback (15s) to prevent indefinite hangs
 * - Idempotent loading (safe to call multiple times)
 * - Deterministic state tracking
 */
export type OpenCVLoadState = 'idle' | 'loading' | 'ready' | 'error';

export class OpenCVLoader {
  private static state: OpenCVLoadState = 'idle';
  private static loadPromise: Promise<void> | null = null;

  static getState(): OpenCVLoadState {
    return this.state;
  }

  static load(): Promise<void> {
    // Already initialized — resolve immediately
    if (this.state === 'ready') return Promise.resolve();

    // Loading in progress — return existing promise
    if (this.loadPromise) return this.loadPromise;

    this.state = 'loading';

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const TIMEOUT_MS = 15_000;

      // Utility to finalize in ready state
      const markReady = () => {
        if (OpenCVLoader.state === 'ready') return; // Guard against double-fire
        OpenCVLoader.state = 'ready';
        resolve();
      };

      const markError = (msg: string) => {
        OpenCVLoader.state = 'error';
        OpenCVLoader.loadPromise = null; // Allow retry
        reject(new Error(msg));
      };

      // Timeout guard — prevent indefinite waiting if WASM never initializes
      const timeout = setTimeout(() => {
        if (OpenCVLoader.state !== 'ready') {
          markError('OpenCV.js initialization timed out after 15 seconds.');
        }
      }, TIMEOUT_MS);

      const clearTimeoutOnReady = () => clearTimeout(timeout);

      // --- CHECK 1: cv is already fully ready (cached from a previous session/page) ---
      const cv = (window as any).cv;
      if (cv && typeof cv.Mat === 'function') {
        clearTimeoutOnReady();
        markReady();
        return;
      }

      // --- CHECK 2: cv object exists but WASM not initialized (script was loaded, runtime pending) ---
      if (cv && typeof cv.onRuntimeInitialized !== 'undefined') {
        const origCallback = cv.onRuntimeInitialized;
        cv.onRuntimeInitialized = () => {
          if (typeof origCallback === 'function') origCallback();
          clearTimeoutOnReady();
          markReady();
        };
        return;
      }

      // --- CHECK 3: Script tag already exists in DOM (e.g. from a failed previous attempt) ---
      const existingScript = document.querySelector('script[src*="opencv.js"]');
      if (existingScript) {
        // Wait for the runtime to become ready
        const poll = setInterval(() => {
          const cvCheck = (window as any).cv;
          if (cvCheck && typeof cvCheck.Mat === 'function') {
            clearInterval(poll);
            clearTimeoutOnReady();
            markReady();
          }
        }, 200);
        return;
      }

      // --- FRESH LOAD: Inject script tag ---
      const script = document.createElement('script');
      script.src = '/opencv.js';
      script.async = true;
      script.type = 'text/javascript';

      script.onload = () => {
        const cvLoaded = (window as any).cv;

        if (!cvLoaded) {
          clearTimeoutOnReady();
          markError('OpenCV script loaded but cv global is undefined.');
          return;
        }

        // cv might already be ready (in newer builds, onRuntimeInitialized fires synchronously)
        if (typeof cvLoaded.Mat === 'function') {
          clearTimeoutOnReady();
          markReady();
          return;
        }

        // Standard path — wait for WASM to compile
        cvLoaded.onRuntimeInitialized = () => {
          clearTimeoutOnReady();
          markReady();
        };
      };

      script.onerror = () => {
        clearTimeoutOnReady();
        markError('Failed to download OpenCV.js from CDN. Check your network connection.');
      };

      document.body.appendChild(script);
    });

    return this.loadPromise;
  }
}