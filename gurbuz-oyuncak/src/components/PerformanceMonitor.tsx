import React, { useEffect, useState } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface PerformanceMonitorProps {
  pageUrl?: string;
  showInsights?: boolean;
  autoReport?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  pageUrl = typeof window !== 'undefined' ? window.location.pathname : '',
  showInsights = false,
  autoReport = true
}) => {
  const { metrics, insights, loading } = usePerformanceMonitoring(pageUrl);
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development or when explicitly enabled
  const isDevelopment = import.meta.env.DEV;
  const shouldShow = showInsights || isDevelopment;

  useEffect(() => {
    if (shouldShow && !loading && metrics) {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds in development
      if (isDevelopment) {
        const timer = setTimeout(() => setIsVisible(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [shouldShow, loading, metrics, isDevelopment]);

  if (!shouldShow || loading || !metrics) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <>
      {/* Performance Badge */}
      <div
        className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Performans</span>
            {insights && (
              <span className={`text-xs font-bold ${getScoreColor(insights.score)}`}>
                {insights.score}/100
              </span>
            )}
          </div>

          {insights && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getScoreBg(insights.score)}`}></div>
                <span className="text-xs text-gray-600">
                  {insights.rating === 'excellent' && 'Mükemmel'}
                  {insights.rating === 'good' && 'İyi'}
                  {insights.rating === 'needs_improvement' && 'İyileştirme Gerekli'}
                  {insights.rating === 'poor' && 'Kötü'}
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Yükleme:</span>
              <span className="font-medium">{formatTime(metrics.loadTime)}</span>
            </div>
            
            {metrics.firstContentfulPaint && (
              <div className="flex justify-between">
                <span>FCP:</span>
                <span className="font-medium">{formatTime(metrics.firstContentfulPaint)}</span>
              </div>
            )}
            
            {metrics.pageSize && (
              <div className="flex justify-between">
                <span>Boyut:</span>
                <span className="font-medium">{formatSize(metrics.pageSize)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              {showDetails ? 'Gizle' : 'Detay'}
            </button>
            
            {autoReport && (
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Yenile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Performance Panel */}
      {showDetails && (
        <div className="fixed top-20 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Performans Detayları</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Core Web Vitals */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Core Web Vitals</h4>
            <div className="space-y-2">
              {metrics.firstContentfulPaint && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">FCP:</span>
                  <span className={`text-xs font-medium ${
                    metrics.firstContentfulPaint < 1800 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {formatTime(metrics.firstContentfulPaint)}
                  </span>
                </div>
              )}
              
              {metrics.largestContentfulPaint && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">LCP:</span>
                  <span className={`text-xs font-medium ${
                    metrics.largestContentfulPaint < 2500 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {formatTime(metrics.largestContentfulPaint)}
                  </span>
                </div>
              )}
              
              {metrics.cumulativeLayoutShift !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">CLS:</span>
                  <span className={`text-xs font-medium ${
                    metrics.cumulativeLayoutShift < 0.1 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {metrics.cumulativeLayoutShift.toFixed(3)}
                  </span>
                </div>
              )}
              
              {metrics.firstInputDelay && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">FID:</span>
                  <span className={`text-xs font-medium ${
                    metrics.firstInputDelay < 100 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {metrics.firstInputDelay}ms
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Resource Timings */}
          {metrics.resourceTimings && metrics.resourceTimings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">En Yavaş Kaynaklar</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {metrics.resourceTimings
                  .filter((resource: any) => resource.duration > 100)
                  .sort((a: any, b: any) => b.duration - a.duration)
                  .slice(0, 5)
                  .map((resource: any, index: number) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600 truncate" title={resource.name}>
                          {resource.name.split('/').pop()}
                        </span>
                        <span className="font-medium">{formatTime(resource.duration)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights && insights.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Öneriler</h4>
              <div className="space-y-1">
                {insights.recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                    • {recommendation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;