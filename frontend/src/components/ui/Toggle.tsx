import { cn } from '@/lib/utils';

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export default function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
        enabled ? 'bg-accent' : 'bg-border'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200',
          enabled ? 'left-5.5' : 'left-0.5'
        )}
        style={{ left: enabled ? '22px' : '2px' }}
      />
    </button>
  );
}
