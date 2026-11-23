/**
 * Utility for applying an archival security watermark ("Art By Johar")
 * to artwork photographs before storage.
 */
export async function watermarkImageFile(
  file: File,
  watermarkText = 'Art By Johar'
): Promise<File> {
  return new Promise((resolve) => {
    // Only process standard images
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw original artwork untouched
      ctx.drawImage(img, 0, 0);

      // Proportional font sizing: ~2.4% of shortest edge, clamped between 14px and 48px
      const shortestEdge = Math.min(width, height);
      const fontSize = Math.max(14, Math.min(48, Math.round(shortestEdge * 0.024)));
      const paddingX = Math.round(fontSize * 0.7);
      const paddingY = Math.round(fontSize * 0.38);
      const margin = Math.round(shortestEdge * 0.025);

      // Measure watermark text
      ctx.font = `600 ${fontSize}px "Cinzel", "Cormorant Garamond", Georgia, serif`;
      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;

      // Position in bottom-right corner
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = fontSize + paddingY * 2;
      const boxX = width - boxWidth - margin;
      const boxY = height - boxHeight - margin;

      // Draw subtle dark archival glass pill behind watermark
      ctx.save();
      ctx.fillStyle = 'rgba(6, 10, 16, 0.72)';
      ctx.strokeStyle = 'rgba(213, 133, 31, 0.45)';
      ctx.lineWidth = Math.max(1, Math.round(fontSize * 0.04));

      // Rounded rectangle
      const radius = Math.round(boxHeight * 0.22);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
      } else {
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
      }
      ctx.fill();
      ctx.stroke();

      // Draw watermark text in luminous champagne / parchment with subtle shadow
      ctx.fillStyle = '#f4d9a0';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = Math.round(fontSize * 0.15);
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.textBaseline = 'middle';
      ctx.fillText(watermarkText, boxX + paddingX, boxY + boxHeight / 2);
      ctx.restore();

      // Export as Blob with original MIME type
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const watermarkedFile = new File([blob], file.name, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(watermarkedFile);
        },
        mimeType,
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim();
const BACKEND_ORIGIN = (API_BASE.startsWith('http://') || API_BASE.startsWith('https://'))
  ? API_BASE.replace(/\/api\/?$/, '')
  : '';

/**
 * Ensures artwork URLs append cache-busting tokens for local uploads
 * so clients immediately receive freshly watermarked image binaries.
 */
export function getWatermarkedImageUrl(url?: string | null): string {
  if (!url) return '';
  let fullUrl = url;
  if (url.startsWith('/uploads/') && BACKEND_ORIGIN) {
    fullUrl = `${BACKEND_ORIGIN}${url}`;
  }
  if (fullUrl.includes('/uploads/')) {
    const sep = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${sep}wm=johar_v2`;
  }
  return fullUrl;
}

/**
 * Returns web-optimized lightweight image URL for 3D Gallery and Catalogue Grid
 * to dramatically reduce bandwidth (down from 1.5MB to ~60KB) and eliminate mobile latency.
 */
export function getOptimizedImageUrl(url?: string | null, size: 'thumb' | 'full' = 'thumb'): string {
  if (!url) return '';
  if (size === 'thumb' && url.includes('/uploads/artworks/') && !url.includes('_thumb.')) {
    const dotIdx = url.lastIndexOf('.');
    if (dotIdx !== -1) {
      const base = url.substring(0, dotIdx);
      const ext = url.substring(dotIdx);
      const thumbUrl = `${base}_thumb${ext}`;
      return getWatermarkedImageUrl(thumbUrl);
    }
  }
  return getWatermarkedImageUrl(url);
}
