import type { WbsTask } from '../types/wbs';
import { STATUS_OPTIONS } from '../data/wbsData';

const STATUS_COLORS: Record<string, string> = {
  검토: '#9e9e9e',
  기획: '#2196f3',
  개발: '#4caf50',
  테스트: '#ff9800',
  이행: '#9c27b0',
};

interface StatusBadgeProps {
  status: WbsTask['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? '#757575';
  return (
    <span
      className="badge"
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: color,
      }}
    >
      {status}
    </span>
  );
}
