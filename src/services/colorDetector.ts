import { OpenCVLoader } from './opencvLoader';

export type CubeColor = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O' | 'UNKNOWN';

export interface CompleteCubeState {
  F: CubeColor[];
  R: CubeColor[];
  B: CubeColor[];
  L: CubeColor[];
  U: CubeColor[];
  D: CubeColor[];
}

export interface GridSample {
  x: number; // Percent coordinates relative to frame grid boundary [0, 1]
  y: number;
}

export class ColorDetector {
  /**
   * Processes a video snapshot frame, maps HSV blocks, equalizes ambient exposure values, 
   * and classifies colors for the 3x3 puzzle face matrix using robust Hue bounds.
   */
  static async processVideoFrame(
    videoElement: HTMLVideoElement,
    gridPoints: GridSample[]
  ): Promise<CubeColor[]> {
    await OpenCVLoader.load();
    const cv = (window as any).cv;

    // 1. Capture stream frame vector geometry (Cropped to HUD Center Box)
    const vWidth = videoElement.videoWidth;
    const vHeight = videoElement.videoHeight;
    
    const cropSize = Math.floor(Math.min(vWidth, vHeight) * 0.65);
    const startX = Math.floor((vWidth - cropSize) / 2);
    const startY = Math.floor((vHeight - cropSize) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not instantiate extraction context allocation.');
    
    // Extract ONLY the center square
    ctx.drawImage(
      videoElement, 
      startX, startY, cropSize, cropSize, 
      0, 0, cropSize, cropSize            
    );

    const src = cv.imread(canvas);
    const dst = new cv.Mat();

    // 2. Normalize Lighting (Convert to HSV)
    cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB);
    cv.cvtColor(dst, dst, cv.COLOR_RGB2HSV);

    const hsvPlanes = new cv.MatVector();
    cv.split(dst, hsvPlanes);
    
    const p0 = hsvPlanes.get(0); // Hue (Color type)
    const p1 = hsvPlanes.get(1); // Saturation (Vibrancy)
    const p2 = hsvPlanes.get(2); // Value (Brightness)

    // Equalize the V (Value/Brightness) layer channel matrix to fix bad room lighting
    cv.equalizeHist(p2, p2);
    cv.merge(hsvPlanes, dst);

    const detectedColors: CubeColor[] = [];
    const width = canvas.width; 
    const height = canvas.height; 

    // 3. Coordinate mapping over the 3x3 processing block
    for (const point of gridPoints) {
      const pixelX = Math.floor(point.x * width);
      const pixelY = Math.floor(point.y * height);

      // Widened the sample region to 7x7 to better ignore sticker glare or scratches
      const roi = dst.roi(new cv.Rect(pixelX - 3, pixelY - 3, 7, 7));
      const meanColor = cv.mean(roi); // Returns [H, S, V, A]

      const h = meanColor[0];
      const s = meanColor[1];
      const v = meanColor[2];

      detectedColors.push(this.classifyHSV(h, s, v));
      roi.delete();
    }

    // Explicit native webassembly heap cleanup passes
    src.delete();
    dst.delete();
    p0.delete();
    p1.delete();
    p2.delete();
    hsvPlanes.delete();

    return detectedColors;
  }

  /**
   * Translates OpenCV HSV boundaries down into discrete sticker outputs.
   * OpenCV Hue is mapped between [0, 180]. Saturation/Value are [0, 255].
   */
  private static classifyHSV(h: number, s: number, v: number): CubeColor {
    // White detection: Low saturation, relatively high brightness
    if (s < 60 && v > 100) return 'W';

    // Black/Dark noise safety catch (edge cases inside the cube mechanisms)
    if (v < 40) return 'W';

    // Red vs Orange Boundary: The trickiest part of CV color mapping.
    // Red wraps around the 0 and 180 marks on the OpenCV Hue wheel.
    if (h >= 0 && h <= 12) {
      // If the hue is in the ambiguous zone, we use brightness/vibrancy to decide.
      // Orange reflects much more light (higher V) and is intensely saturated.
      if (h > 7 && v > 160 && s > 150) return 'O';
      return 'R'; // Otherwise, it's dark enough to be Red
    }
    
    // Solid Orange zone
    if (h > 12 && h <= 25) return 'O';
    
    // Solid Yellow zone
    if (h > 25 && h <= 45) return 'Y';
    
    // Solid Green zone (Broadened to catch both pale and deep greens safely)
    if (h > 45 && h <= 85) return 'G';
    
    // Solid Blue zone
    if (h > 85 && h <= 140) return 'B';
    
    // Solid Red zone (Wrapping around the top of the color wheel)
    if (h > 140 && h <= 180) return 'R';

    return 'W';
  }
}