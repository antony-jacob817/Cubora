import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real production app, you would log this to Sentry or Datadog
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] glass-panel border-red-500/20 text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Module Crash Detected</h2>
          <p className="text-gray-400 max-w-md mb-8">
            The neural engine encountered an unexpected anomaly while rendering this workspace.
          </p>
          <Button 
            variant="secondary" 
            className="gap-2 hover:bg-white/10"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4" /> Reboot Workspace
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}