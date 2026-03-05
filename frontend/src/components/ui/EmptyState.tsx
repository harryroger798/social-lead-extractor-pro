interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold text-text-secondary">{title}</h3>
        <p className="text-sm text-text-muted mt-1 max-w-xs">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
