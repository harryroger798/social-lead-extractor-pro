// Lazy Image Component (Speed Optimization #18, #32)
// Implements lazy loading with blur placeholder and Intersection Observer

import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  rootMargin?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  aspectRatio,
  objectFit = 'cover',
  rootMargin = '50px',
  threshold = 0.1,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-800',
        aspectRatio && `aspect-[${aspectRatio}]`,
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Placeholder/blur background */}
      {!isLoaded && !error && (
        <div
          className={cn(
            'absolute inset-0 skeleton',
            placeholder && 'bg-cover bg-center blur-sm'
          )}
          style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Responsive Image with srcset (Mobile Optimization #8)
interface ResponsiveImageProps extends Omit<LazyImageProps, 'srcSet'> {
  srcSet?: {
    src: string;
    width: number;
  }[];
  sizes?: string;
}

export function ResponsiveImage({
  src,
  srcSet,
  sizes = '100vw',
  alt,
  ...props
}: ResponsiveImageProps) {
  const srcSetString = srcSet
    ?.map(({ src, width }) => `${src} ${width}w`)
    .join(', ');

  return (
    <LazyImage
      src={src}
      alt={alt}
      {...props}
      srcSet={srcSetString}
      sizes={sizes}
    />
  );
}

// Avatar with lazy loading
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export function LazyAvatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = fallback || alt.charAt(0).toUpperCase();

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-medium',
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
    />
  );
}

export default LazyImage;
