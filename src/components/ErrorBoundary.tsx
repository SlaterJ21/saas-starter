'use client';

import * as Sentry from '@sentry/nextjs';
import {useEffect} from 'react';

export default function ErrorBoundary({
                                          error,
                                          reset,
                                      }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to Sentry with request context
        Sentry.captureException(error, {
            tags: {
                error_boundary: 'true',
            },
        });
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Something went wrong!
                    </h2>

                    <p className="text-gray-600 mb-4">
                        We've been notified and will look into it.
                    </p>

                    {error.digest && (
                        <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 px-3 py-2 rounded">
                            Error ID: {error.digest}
                        </p>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={reset}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            Try Again
                        </button>

                        <a
                            href="/"
                            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
                        >
                            Go Home
                        </a>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-6 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                Error Details (Dev Only)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                {error.message}
                                {'\n\n'}
                                {error.stack}
              </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}