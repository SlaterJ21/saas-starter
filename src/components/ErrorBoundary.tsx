'use client';

import {Component, ReactNode} from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-red-700 text-sm">
                            {this.state.error?.message || 'An error occurred'}
                        </p>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}