export class OpenCVLoader {
  private static isLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  static load(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already injected globally
      if ((window as any).cv) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.x/opencv.js';
      script.async = true;
      script.type = 'text/javascript';

      script.onload = () => {
        // OpenCV.js execution configuration hook
        (window as any).cv.onRuntimeInitialized = () => {
          OpenCVLoader.isLoaded = true;
          resolve();
        };
      };

      script.onerror = () => {
        reject(new Error('Failed to download OpenCV.js runtime compiled engine.'));
      };

      document.body.appendChild(script);
    });

    return this.loadPromise;
  }
}