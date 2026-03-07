import { Loader2 } from 'lucide-react';

export default function Spinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-accent animate-spin-slow" />
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  );
}
