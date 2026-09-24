'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-lg mx-auto my-8">
          <Card className="p-6 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {this.props.fallbackTitle || 'Ocorreu uma instabilidade nesta seção'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {this.props.fallbackMessage ||
                  'Os dados locais permanecem preservados. Tente recarregar este componente.'}
              </p>
            </div>

            {this.state.error && (
              <p className="text-[11px] font-mono text-red-600/80 bg-red-100/50 dark:bg-red-950/50 p-2 rounded-lg truncate">
                {this.state.error.message}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="font-bold text-xs gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar Novamente
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
