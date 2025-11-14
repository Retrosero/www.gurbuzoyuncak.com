import { useState, useEffect, useRef, useCallback } from 'react';

// Touch and gesture management hook
export const useTouchGestures = (elementRef) => {
  const [isSwipeLeft, setIsSwipeLeft] = useState(false);
  const [isSwipeRight, setIsSwipeRight] = useState(false);
  const [isSwipeUp, setIsSwipeUp] = useState(false);
  const [isSwipeDown, setIsSwipeDown] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.target.touches[0].clientX,
      y: e.target.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.target.touches[0].clientX,
      y: e.target.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    setIsSwipeLeft(isLeftSwipe);
    setIsSwipeRight(isRightSwipe);
    setIsSwipeUp(isUpSwipe);
    setIsSwipeDown(isDownSwipe);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, touchStart, touchEnd]);

  return {
    isSwipeLeft,
    isSwipeRight,
    isSwipeUp,
    isSwipeDown,
    resetGestures: () => {
      setIsSwipeLeft(false);
      setIsSwipeRight(false);
      setIsSwipeUp(false);
      setIsSwipeDown(false);
    }
  };
};

// Device detection hook
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    screenSize: { width: 0, height: 0 },
    orientation: 'portrait'
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouchDevice,
        screenSize: { width, height },
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// Pull to refresh hook
export const usePullToRefresh = (onRefresh) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;

    const touch = e.touches[0];
    const pullThreshold = 100;
    const distance = Math.min(touch.clientY / 2, pullThreshold);
    
    setPullDistance(distance);

    if (distance >= pullThreshold) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= 100 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  };

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

// Virtual scroll hook for performance
export const useVirtualScroll = (data, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    Math.ceil((scrollTop + containerHeight) / itemHeight),
    data.length - 1
  );

  const visibleItems = data.slice(visibleStartIndex, visibleEndIndex + 1);
  const offsetY = visibleStartIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    visibleStartIndex,
    visibleEndIndex,
    totalHeight: data.length * itemHeight,
    setScrollTop
  };
};

// Swipe actions hook for mobile tables
export const useSwipeActions = () => {
  const [activeSwipe, setActiveSwipe] = useState(null);

  const swipeHandlers = {
    onTouchStart: (e, itemId) => {
      setActiveSwipe(itemId);
    },
    onTouchMove: (e, itemId) => {
      // Prevent horizontal scroll when swiping
      if (activeSwipe === itemId) {
        e.preventDefault();
      }
    },
    onTouchEnd: () => {
      // Auto close after delay
      setTimeout(() => setActiveSwipe(null), 3000);
    }
  };

  return {
    activeSwipe,
    setActiveSwipe,
    swipeHandlers
  };
};

// Mobile-optimized form validation
export const useMobileForm = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, rules) => {
    const errors = [];
    
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${name} alanı zorunludur`);
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${name} en az ${rules.minLength} karakter olmalıdır`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`${name} en fazla ${rules.maxLength} karakter olabilir`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(`${name} formatı geçersiz`);
    }

    return errors;
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleChange = (fieldName, value, rules) => {
    const fieldErrors = validateField(fieldName, value, rules);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));
  };

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    handleChange,
    clearErrors: () => setErrors({}),
    clearTouched: () => setTouched({})
  };
};

// Long press handler for mobile interactions
export const useLongPress = (callback, duration = 500) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const timer = useRef(null);

  const start = useCallback(() => {
    setIsLongPress(false);
    timer.current = setTimeout(() => {
      setIsLongPress(true);
      callback();
    }, duration);
  }, [callback, duration]);

  const stop = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setTimeout(() => setIsLongPress(false), 150); // Prevent rapid triggering
  }, []);

  return { isLongPress, start, stop };
};

// Mobile keyboard detection
export const useMobileKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;
      const keyboardHeight = documentHeight - height;
      
      setKeyboardHeight(keyboardHeight);
      setIsKeyboardOpen(keyboardHeight > 150);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { keyboardHeight, isKeyboardOpen };
};