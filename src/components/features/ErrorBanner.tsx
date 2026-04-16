import { AlertTriangle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 backdrop-blur-sm">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-destructive">Симуляцид алдаа гарлаа</p>
        <p className="text-xs text-destructive/70 mt-1 font-mono break-all">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-destructive/60 hover:text-destructive transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
