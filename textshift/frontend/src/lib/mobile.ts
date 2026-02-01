// Mobile Optimization Utilities
// Mobile/Screen Optimizations #1-55

import { useEffect, useState, useCallback, useRef } from 'react';

// Detect if device is mobile (Mobile Optimization #28)
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

// Detect if device is tablet
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(
    typeof window !== 'undefined' 
      ? window.innerWidth >= 768 && window.innerWidth < 1024 
      : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTablet;
}

// Detect touch device (Mobile Optimization #16)
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

// Detect device orientation (Mobile Optimization #34)
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined'
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange, { passive: true });
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}

// Detect safe area insets (Mobile Optimization #29)
export function useSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const [insets, setInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  useEffect(() => {
    const computeInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
      });
    };

    // Set CSS variables for safe area insets
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');

    computeInsets();
    window.addEventListener('resize', computeInsets, { passive: true });
    return () => window.removeEventListener('resize', computeInsets);
  }, []);

  return insets;
}

// Swipe gesture detection (Mobile Optimization #18)
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
): {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
} {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }

    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return { onTouchStart, onTouchEnd };
}

// Pull to refresh (Mobile Optimization #19)
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  threshold: number = 80
): {
  pullDistance: number;
  isRefreshing: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
} {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    setPullDistance(Math.min(distance, threshold * 1.5));
  }, [isRefreshing, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}

// Long press detection (Mobile Optimization #23)
export function useLongPress(
  onLongPress: () => void,
  duration: number = 500
): {
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
} {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(onLongPress, duration);
  }, [onLongPress, duration]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
  };
}

// Virtual keyboard detection (Mobile Optimization #31)
export function useVirtualKeyboard(): {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
} {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const initialHeight = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);

  useEffect(() => {
    const handleResize = () => {
      const heightDiff = initialHeight.current - window.innerHeight;
      const isOpen = heightDiff > 150; // Threshold for keyboard detection
      setIsKeyboardOpen(isOpen);
      setKeyboardHeight(isOpen ? heightDiff : 0);
    };

    // Use visualViewport API if available
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize, { passive: true });
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return { isKeyboardOpen, keyboardHeight };
}

// Prevent zoom on double tap (Mobile Optimization #21)
export function preventDoubleTapZoom(element: HTMLElement): () => void {
  let lastTouchEnd = 0;
  
  const handler = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  };

  element.addEventListener('touchend', handler, { passive: false });
  return () => element.removeEventListener('touchend', handler);
}

// Haptic feedback (Mobile Optimization #27)
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if ('vibrate' in navigator) {
    const durations = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(durations[type]);
  }
}

// Share API (Mobile Optimization #44)
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// Check if share API is available
export function canShare(): boolean {
  return 'share' in navigator;
}

// Detect reduced motion preference (Mobile Optimization #55)
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Detect dark mode preference
export function usePrefersDarkMode(): boolean {
  const [prefersDark, setPrefersDark] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersDark;
}

// Network status detection (Mobile Optimization #45)
export function useNetworkStatus(): {
  isOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
} {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: null as string | null,
    downlink: null as number | null,
    rtt: null as number | null,
  });

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as Navigator & {
        connection?: {
          effectiveType: string;
          downlink: number;
          rtt: number;
        };
      }).connection;

      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
      });
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    const connection = (navigator as Navigator & {
      connection?: EventTarget;
    }).connection;
    
    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return status;
}

// Scroll lock for modals (Mobile Optimization #30)
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
}

// Viewport height fix for mobile browsers (Mobile Optimization #33)
export function useViewportHeight(): void {
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH, { passive: true });
    return () => window.removeEventListener('resize', setVH);
  }, []);
}

// PWA install prompt (Mobile Optimization #46)
export function usePWAInstallPrompt(): {
  canInstall: boolean;
  promptInstall: () => Promise<boolean>;
} {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt) return false;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    return outcome === 'accepted';
  };

  return {
    canInstall: !!installPrompt,
    promptInstall,
  };
}

// Type for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Responsive breakpoint values
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Get current breakpoint
export function useCurrentBreakpoint(): keyof typeof breakpoints {
  const [breakpoint, setBreakpoint] = useState<keyof typeof breakpoints>('xs');

  useEffect(() => {
    const getBreakpoint = (): keyof typeof breakpoints => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) return '2xl';
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    };

    const handleResize = () => setBreakpoint(getBreakpoint());
    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
