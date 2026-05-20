import React from 'react';
import { Button } from '@/components/ui/Button';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex h-screen items-center justify-center p-6 text-center glass-panel">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">System Anomaly Detected</h2>
          <Button onClick={() => window.location.reload()}>Refresh Workspace</Button>
        </div>
      </div>
    );
    return this.props.children;
  }
}