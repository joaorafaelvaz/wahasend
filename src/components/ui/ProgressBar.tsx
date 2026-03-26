"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export default function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-text-muted mb-1.5">
        <span>{value} de {max}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
