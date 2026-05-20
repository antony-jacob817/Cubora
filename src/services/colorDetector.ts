import { OpenCVLoader } from './opencvLoader';

export type CubeColor = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O' | 'UNKNOWN';

export interface GridSample {
  x: number; // Percent coordinates relative to frame grid boundary [0, 1]
  y: number;
}

export class ColorDetector {
  /**
   * Processes a video snapshot frame, maps HSV blocks, equalizes ambient exposure values, 
   * and classifies colors for the 3x3 puzzle face matrix grid configuration.
   */
  static async processVideoFrame(
    videoElement: HTMLVideoElement,
    gridPoints: GridSample[]
  ): Promise<CubeColor[]> {
    await OpenCVLoader.load();
    const cv = (window as any).cv;

    // 1. Capture stream frame vector geometry
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not instantiate extraction context allocation.');
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const src = cv.imread(canvas);
    const dst = new cv.Mat();

    // 2. Normalize Lighting: Convert to HSV -> Equalize Value (Brightness) -> Convert Back
    cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB);
    cv.cvtColor(dst, dst, cv.COLOR_RGB2HSV);

    const hsvPlanes = new cv.MatVector();
    cv.split(dst, hsvPlanes);
    
    // Equalize the V (Value/Brightness) layer channel matrix
    cv.equalizeHist(hsvPlanes.get(2), hsvPlanes.get(2));
    cv.merge(hsvPlanes, dst);

    const detectedColors: CubeColor[] = [];
    const width = canvas.width;
    const height = canvas.height;

    // 3. Coordinate mapping over the 3x3 processing block configuration arrays
    for (const point of gridPoints) {
      const pixelX = Math.floor(point.x * width);
      const pixelY = Math.floor(point.y * height);

      // Sample a small 5x5 structural neighborhood region window to avoid individual trace noise artifacts
      const roi = dst.roi(new cv.Rect(pixelX - 2, pixelY - 2, 5, 5));
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
    hsvPlanes.delete();

    return detectedColors;
  }

  /**
   * Translates normalized OpenCV HSV boundaries down into discrete sticker outputs.
   * OpenCV Hue configuration scope is maps explicitly between [0, 180].
   */
  private static classifyHSV(h: number, s: number, v: number): CubeColor {
    // White detection: Low saturation metrics relative to baseline brightness windows
    if (s < 50 && v > 140) return 'W';

    // Yellow range profile
    if (h >= 20 && h < 38) {
      return s > 100 ? 'Y' : 'W';
    }
    // Orange vs Red boundary sorting optimization thresholds
    if (h >= 0 && h < 10) {
      return s > 150 && v > 150 ? 'O' : 'R';
    }
    if (h >= 10 && h < 20) return 'O';
    if (h >= 165 && h <= 180) return 'R';

    // Green parameters
    if (h >= 38 && h < 85) return 'G';
    
    // Blue parameters
    if (h >= 85 && h < 130) return 'B';

    return 'UNKNOWN';
  }
}