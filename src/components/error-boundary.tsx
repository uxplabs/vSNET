'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: unknown;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error != null) {
      if (this.props.fallback) return this.props.fallback;
      const msg = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
      return (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          <p className="font-medium">This section failed to load.</p>
          <p className="mt-1 font-mono text-xs break-all">{msg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
