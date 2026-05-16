import { cn, getStatusColors, getStatusLabel, getStatusDot } from '@/utils';
import type { AppointmentStatus } from '@/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  return (
    <span className={cn('badge', getStatusColors(status))}>
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', getStatusDot(status))} />
      )}
      {getStatusLabel(status)}
    </span>
  );
}
