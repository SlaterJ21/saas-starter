'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
    pageLoadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
}

export default function PerformanceMonitor() {
    const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
    const [showMetrics, setShowMetrics] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
            return;
        }

        const getMetrics = () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            const newMetrics: Partial<PerformanceMetrics> = {
                pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
            };

            // Get Web Vitals
            if ('PerformanceObserver' in window) {
                // First Contentful Paint
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            setMetrics(prev => ({
                                ...prev,
                                firstContentfulPaint: entry.startTime,
                            }));
                        }
                    }
                });
                paintObserver.observe({ entryTypes: ['paint'] });

                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1] as any;
                    setMetrics(prev => ({
                        ...prev,
                        largestContentfulPaint: lastEntry.startTime,
                    }));
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Cumulative Layout Shift
                let clsScore = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries() as any[]) {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    }
                    setMetrics(prev => ({
                        ...prev,
                        cumulativeLayoutShift: clsScore,
                    }));
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries() as any[]) {
                        setMetrics(prev => ({
                            ...prev,
                            firstInputDelay: entry.processingStart - entry.startTime,
                        }));
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            }

            setMetrics(newMetrics);
        };

        // Wait for page to fully load
        if (document.readyState === 'complete') {
            getMetrics();
        } else {
            window.addEventListener('load', getMetrics);
            return () => window.removeEventListener('load', getMetrics);
        }
    }, []);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const getScoreColor = (metric: keyof PerformanceMetrics, value: number) => {
        const thresholds: Record<keyof PerformanceMetrics, [number, number]> = {
            pageLoadTime: [2000, 4000],
            domContentLoaded: [1500, 3000],
            firstContentfulPaint: [1800, 3000],
            largestContentfulPaint: [2500, 4000],
            cumulativeLayoutShift: [0.1, 0.25],
            firstInputDelay: [100, 300],
        };

        const [good, needsImprovement] = thresholds[metric];

        if (value <= good) return 'text-green-600 bg-green-50';
        if (value <= needsImprovement) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition font-semibold text-sm"
            >
                ⚡ Performance
            </button>

            {showMetrics && (
                <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-2xl border-2 border-purple-200 p-4 w-80">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-purple-900">Performance Metrics</h3>
                        <button
                            onClick={() => setShowMetrics(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-2 text-sm">
                        {metrics.pageLoadTime && (
                            <Metric
                                label="Page Load"
                                value={`${Math.round(metrics.pageLoadTime)}ms`}
                                colorClass={getScoreColor('pageLoadTime', metrics.pageLoadTime)}
                            />
                        )}

                        {metrics.domContentLoaded && (
                            <Metric
                                label="DOM Loaded"
                                value={`${Math.round(metrics.domContentLoaded)}ms`}
                                colorClass={getScoreColor('domContentLoaded', metrics.domContentLoaded)}
                            />
                        )}

                        {metrics.firstContentfulPaint && (
                            <Metric
                                label="FCP"
                                value={`${Math.round(metrics.firstContentfulPaint)}ms`}
                                colorClass={getScoreColor('firstContentfulPaint', metrics.firstContentfulPaint)}
                            />
                        )}

                        {metrics.largestContentfulPaint && (
                            <Metric
                                label="LCP"
                                value={`${Math.round(metrics.largestContentfulPaint)}ms`}
                                colorClass={getScoreColor('largestContentfulPaint', metrics.largestContentfulPaint)}
                            />
                        )}

                        {metrics.cumulativeLayoutShift !== undefined && (
                            <Metric
                                label="CLS"
                                value={metrics.cumulativeLayoutShift.toFixed(3)}
                                colorClass={getScoreColor('cumulativeLayoutShift', metrics.cumulativeLayoutShift)}
                            />
                        )}

                        {metrics.firstInputDelay && (
                            <Metric
                                label="FID"
                                value={`${Math.round(metrics.firstInputDelay)}ms`}
                                colorClass={getScoreColor('firstInputDelay', metrics.firstInputDelay)}
                            />
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        <p className="mb-1">Score Guide:</p>
                        <div className="flex gap-2">
                            <span className="text-green-600">● Good</span>
                            <span className="text-yellow-600">● Needs Improvement</span>
                            <span className="text-red-600">● Poor</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Metric({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{label}:</span>
            <span className={`px-2 py-1 rounded font-mono font-semibold ${colorClass}`}>
        {value}
      </span>
        </div>
    );
}