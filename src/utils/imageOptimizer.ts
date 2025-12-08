/**
 * Image optimization utility for Supabase Storage images
 * Applies transformations for better performance: WebP format, quality reduction, and resizing
 */

interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  width: 1080,
  quality: 80,
  format: 'webp'
};

/**
 * Checks if a URL is from Supabase Storage
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage') || url.includes('supabase.in/storage');
}

/**
 * Optimizes an image URL by adding transformation parameters for Supabase Storage images
 * For external URLs, returns the original URL unchanged
 * 
 * @param url - The original image URL
 * @param options - Optimization options (width, quality, format)
 * @returns The optimized URL with transformation parameters
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return '';
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Only apply transformations to Supabase Storage URLs
  if (isSupabaseStorageUrl(url)) {
    const separator = url.includes('?') ? '&' : '?';
    const params = new URLSearchParams({
      width: String(mergedOptions.width),
      quality: String(mergedOptions.quality),
      format: mergedOptions.format || 'webp'
    });
    return `${url}${separator}${params.toString()}`;
  }
  
  // Return external URLs unchanged
  return url;
}

/**
 * Get optimized image props for consistent lazy loading
 */
export function getOptimizedImageProps(
  url: string | null | undefined,
  alt: string,
  options: ImageOptimizationOptions = {}
): React.ImgHTMLAttributes<HTMLImageElement> {
  return {
    src: optimizeImageUrl(url, options),
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    width: options.width || DEFAULT_OPTIONS.width,
    height: options.width ? Math.round(options.width * 0.5625) : 608, // 16:9 aspect ratio
  };
}

/**
 * Preset sizes for common use cases
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 320, quality: 75 },
  card: { width: 480, quality: 80 },
  hero: { width: 1920, quality: 85 },
  tile: { width: 400, quality: 80 },
} as const;
