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
  theme?: 'default' | 'light';
  title?: string;
}

function parseDate(s: string | null | undefined): number {
  if (!s) return NaN;
  return new Date(s).getTime();
}

export function GanttChart({ tasks, theme = 'default', title = '간트 차트' }: GanttChartProps) {
  const isDark = theme === 'default';
  const bg = isDark ? '#2d2d2d' : '#fff';
  const bgSidebar = isDark ? '#1a1a1a' : '#fafafa';
  const borderColor = isDark ? '#444' : '#eee';
  const textColor = isDark ? '#fff' : '#333';
  const textMuted = isDark ? '#aaa' : '#555';
  const rowBorder = isDark ? '#333' : '#f0f0f0';
  const { minTs, maxTs, weeks } = useMemo(() => {
    const dates = tasks.flatMap((t) => [
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
      const start = parseDate(t.start);
      const end = parseDate(t.end);
      return !isNaN(start) && !isNaN(end);
    }),
    [tasks]
  );

  const range = maxTs - minTs || 1;
  const ROW_HEIGHT = 36;

  if (validTasks.length === 0) {
    return (
      <div style={{ background: bg, borderRadius: 8, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <h2 style={{ padding: '16px 20px', fontSize: 18, fontWeight: 600, borderBottom: `1px solid ${borderColor}`, color: textColor }}>{title}</h2>
        <div style={{ padding: 40, textAlign: 'center', color: textMuted }}>표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div style={{ background: bg, borderRadius: 8, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <h2 style={{ padding: '16px 20px', fontSize: 18, fontWeight: 600, borderBottom: `1px solid ${borderColor}`, color: textColor }}>{title}</h2>
      <div style={{ display: 'flex', minHeight: 200 }}>
        <div style={{ flex: '0 0 220px', borderRight: `1px solid ${borderColor}`, background: bgSidebar, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 12, fontWeight: 600, color: textMuted, borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
            업무
          </div>
          {validTasks.map((t, i) => (
            <div
              key={i}
              style={{
                height: ROW_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                fontSize: 13,
                borderBottom: `1px solid ${borderColor}`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                color: textColor,
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
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.task || '(제목 없음)'}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowX: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: ROW_HEIGHT, display: 'flex', borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
            {weeks.map((w, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: textMuted,
                }}
              >
                {w}
              </div>
            ))}
          </div>
          {validTasks.map((t, i) => {
            const start = parseDate(t.start);
            const end = parseDate(t.end);
            const barStart = Math.min(start, end);
            const barEnd = Math.max(start, end);
            const left = ((barStart - minTs) / range) * 100;
            const width = Math.max(((barEnd - barStart) / range) * 100, 0.5);
            const color = STATUS_COLORS[t.status] ?? '#757575';
            return (
              <div
                key={i}
                style={{
                  height: ROW_HEIGHT,
                  position: 'relative',
                  borderBottom: `1px solid ${rowBorder}`,
                  flexShrink: 0,
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
