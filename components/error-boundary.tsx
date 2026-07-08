'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

/**
 * React Error Boundary that catches unhandled rendering errors.
 * Renders a friendly error UI with a retry action.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production this would go to an error monitoring service (e.g. Sentry)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-text-primary">Something went wrong</h3>
            <p className="text-xs text-text-secondary max-w-xs">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-outline/20 bg-surface px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-container transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for inline error + retry display (non-boundary).
 */
export function ErrorDisplay({
  error,
  onRetry,
  message,
}: {
  error?: Error | null;
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[20vh] gap-3 p-6 text-center">
      <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center">
        <AlertTriangle className="h-5 w-5 text-error" />
      </div>
      <p className="text-xs text-text-secondary max-w-xs">
        {message || error?.message || 'Failed to load data. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-lg border border-outline/20 bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-container transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
