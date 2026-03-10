import { useMemo } from 'react';
import type { WbsTask } from '../types/wbs';
import { STATUS_OPTIONS } from '../data/wbsData';

const STATUS_COLORS: Record<string, string> = {
  검토: '#9e9e9e',
  기획: '#2196f3',
  개발: '#4caf50',
  테스트: '#ff9800',
  이행: '#9c27b0',
};

interface GanttChartProps {
  tasks: WbsTask[];
}

function parseDate(s: string | null | undefined): number {
  if (!s) return NaN;
  return new Date(s).getTime();
}

export function GanttChart({ tasks }: GanttChartProps) {
  const { minTs, maxTs, weeks } = useMemo(() => {
    const dates = tasks.flatMap((t) => [
      parseDate(t.plannedStart),
      parseDate(t.plannedEnd),
      parseDate(t.start),
      parseDate(t.end),
    ]).filter((x) => !isNaN(x));
    const minTs = dates.length ? Math.min(...dates) : Date.now();
    const maxTs = dates.length ? Math.max(...dates) : Date.now() + 7 * 24 * 60 * 60 * 1000;
    const range = maxTs - minTs || 1;
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weekCount = Math.ceil(range / weekMs) || 1;
    const weeks = Array.from({ length: weekCount }, (_, i) => {
      const d = new Date(minTs + i * weekMs);
      return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    });
    return { minTs, maxTs, weeks, range };
  }, [tasks]);

  const validTasks = useMemo(
    () => tasks.filter((t) => {
      const start = parseDate(t.plannedStart) || parseDate(t.start);
      const end = parseDate(t.plannedEnd) || parseDate(t.end) || start;
      return !isNaN(start);
    }),
    [tasks]
  );

  const range = maxTs - minTs || 1;

  if (validTasks.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <h2 style={{ padding: '16px 20px', fontSize: 18, fontWeight: 600, borderBottom: '1px solid #eee' }}>간트 차트</h2>
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <h2 style={{ padding: '16px 20px', fontSize: 18, fontWeight: 600, borderBottom: '1px solid #eee' }}>간트 차트</h2>
      <div style={{ display: 'flex', minHeight: 200 }}>
        <div style={{ flex: '0 0 220px', borderRight: '1px solid #eee', background: '#fafafa' }}>
          <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#555', borderBottom: '1px solid #eee' }}>
            업무
          </div>
          {validTasks.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                fontSize: 13,
                borderBottom: '1px solid #eee',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STATUS_COLORS[t.status] ?? '#757575',
                }}
              />
              {t.task || '(제목 없음)'}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowX: 'auto', minWidth: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            {weeks.map((w, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 60,
                  padding: '10px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#555',
                  textAlign: 'center',
                }}
              >
                {w}
              </div>
            ))}
          </div>
          {validTasks.map((t, i) => {
            const start = parseDate(t.plannedStart) || parseDate(t.start);
            const end = parseDate(t.plannedEnd) || parseDate(t.end) || start + 24 * 60 * 60 * 1000;
            const left = ((start - minTs) / range) * 100;
            const width = Math.max(((end - start) / range) * 100, 1);
            const color = STATUS_COLORS[t.status] ?? '#757575';
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  height: 36,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    height: 24,
                    borderRadius: 4,
                    minWidth: 4,
                    left: `${left}%`,
                    width: `${width}%`,
                    background: color,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
