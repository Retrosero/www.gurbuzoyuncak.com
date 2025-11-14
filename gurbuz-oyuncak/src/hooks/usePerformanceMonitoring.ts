import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  pageSize?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  performanceScore?: number;
  resourceTimings?: any;
}

interface PerformanceInsights {
  score: number;
  rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  recommendations: string[];
}

export const usePerformanceMonitoring = (pageUrl: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageUrl) return;

    const startTime = performance.now();

    const measurePerformance = async () => {
      try {
        // Wait for page to fully load
        await new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true));
          }
        });

        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);

        // Get Core Web Vitals if available
        let firstContentfulPaint: number | undefined;
        let largestContentfulPaint: number | undefined;
        let cumulativeLayoutShift: number | undefined;
        let firstInputDelay: number | undefined;

        // Try to get Navigation Timing API data
        if ('performance' in window && 'getEntriesByType' in performance) {
          const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          if (navigationEntries.length > 0) {
            const navEntry = navigationEntries[0];
            firstContentfulPaint = Math.round(navEntry.responseEnd - navEntry.fetchStart);
          }

          // Get Paint Timing API data
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            firstContentfulPaint = Math.round(fcpEntry.startTime);
          }
        }

        // Get resource timings
        let resourceTimings: any = null;
        if ('performance' in window && 'getEntriesByType' in performance) {
          const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          resourceTimings = resourceEntries.map(entry => ({
            name: entry.name,
            duration: Math.round(entry.duration),
            size: entry.transferSize || 0,
            type: entry.initiatorType
          }));
        }

        // Estimate page size based on DOM
        let pageSize: number | undefined;
        try {
          // This is an approximation - in real scenarios, you'd want to measure actual transfer size
          const domSize = document.documentElement.outerHTML.length;
          const estimatedSize = domSize * 2; // Rough estimate including CSS, JS, etc.
          pageSize = estimatedSize;
        } catch (e) {
          // Ignore size calculation errors
        }

        const performanceMetrics: PerformanceMetrics = {
          loadTime,
          pageSize,
          firstContentfulPaint,
          largestContentfulPaint,
          cumulativeLayoutShift,
          firstInputDelay,
          resourceTimings
        };

        setMetrics(performanceMetrics);

        // Send metrics to backend
        await sendMetricsToBackend(pageUrl, performanceMetrics);

      } catch (error) {
        console.error('Performance measurement error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Start measuring
    measurePerformance();

    // Set up input delay monitoring
    let fidTimeout: NodeJS.Timeout;
    const measureFID = () => {
      let localFID: number | undefined;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            localFID = Math.round((entry as any).processingStart - entry.startTime);
            setMetrics(prev => prev ? { ...prev, firstInputDelay: localFID } : null);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Observer not supported
      }

      // Fallback for FID measurement
      fidTimeout = setTimeout(() => {
        window.addEventListener('click', () => {
          const clickTime = performance.now();
          setTimeout(() => {
            localFID = Math.round(performance.now() - clickTime);
            setMetrics(prev => prev ? { ...prev, firstInputDelay: localFID } : null);
          }, 0);
        }, { once: true });
      }, 0);
    };

    measureFID();

    return () => {
      if (fidTimeout) {
        clearTimeout(fidTimeout);
      }
    };
  }, [pageUrl]);

  const sendMetricsToBackend = async (url: string, metrics: PerformanceMetrics) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/performance-monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          page_url: url,
          load_time: metrics.loadTime,
          page_size: metrics.pageSize,
          first_contentful_paint: metrics.firstContentfulPaint,
          largest_contentful_paint: metrics.largestContentfulPaint,
          cumulative_layout_shift: metrics.cumulativeLayoutShift,
          first_input_delay: metrics.firstInputDelay,
          resource_timings: metrics.resourceTimings,
          user_agent: navigator.userAgent
        })
      });

      if (response.ok) {
        const result = await response.json();
        setInsights(result.insights);
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  };

  return {
    metrics,
    insights,
    loading
  };
};