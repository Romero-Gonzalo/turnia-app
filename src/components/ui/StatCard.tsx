import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
  animationDelay?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-amber-400',
  trend,
  className,
  animationDelay,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 flex flex-col gap-4 animate-slide-up opacity-0 [animation-fill-mode:forwards] hover:border-zinc-700/60 transition-all duration-300',
        animationDelay,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            {title}
          </span>
          <span className="text-3xl font-bold text-zinc-100 tracking-tight leading-none">
            {value}
          </span>
        </div>
        <div className={cn('p-2.5 rounded-lg bg-zinc-800/60', iconColor.replace('text-', 'bg-').replace('-400', '-500/10').replace('-500/10', '-500/10'))}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <span className="text-xs text-zinc-500">{subtitle}</span>
        )}
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend.positive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
