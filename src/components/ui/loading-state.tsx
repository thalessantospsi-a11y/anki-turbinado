import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando informações...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
      <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {message}
      </p>
    </div>
  );
}
