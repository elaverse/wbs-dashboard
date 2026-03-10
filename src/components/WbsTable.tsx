import { useMemo, useCallback } from 'react';
import type { WbsTask } from '../types/wbs';
import type { WbsFilter } from '../types/filter';
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from '../data/wbsData';
import { exportToExcel } from '../utils/excelExport';

interface WbsTableProps {
  tasks: WbsTask[];
  filter: WbsFilter;
  onFilterChange: (f: WbsFilter) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onTasksChange: (tasks: WbsTask[] | ((prev: WbsTask[]) => WbsTask[])) => void;
  onAddClick: () => void;
  onLoadClick: () => void;
  onSaveClick: () => void;
  onDeleteClick: () => void;
  loading?: boolean;
  saving?: boolean;
  theme?: 'default' | 'light';
  title?: string;
  tabFilter?: (t: WbsTask) => boolean;
  plannerLabel?: string;
  foPmLabel?: string;
  boPmLabel?: string;
}

export function WbsTable({
  tasks,
  filter,
  onFilterChange,
  selectedIds,
  onSelectionChange,
  onTasksChange,
  onAddClick,
  onLoadClick,
  onSaveClick,
  onDeleteClick,
  loading = false,
  saving = false,
  theme = 'default',
  title = 'WBS 목록',
  tabFilter,
  plannerLabel = '기획자',
  foPmLabel = 'FO PM',
  boPmLabel = 'BO PM',
}: WbsTableProps) {
  const isDark = theme === 'default';
  const bg = isDark ? '#2d2d2d' : '#fff';
  const bgHeader = isDark ? '#1a1a1a' : '#fafafa';
  const bgFilter = isDark ? '#333' : '#f9f9f9';
  const borderColor = isDark ? '#444' : '#eee';
  const textColor = isDark ? '#fff' : '#333';
  const textMuted = isDark ? '#aaa' : '#555';
  const inputBg = isDark ? '#2d2d2d' : undefined;
  const inputBorder = isDark ? '#555' : '#ddd';
  const rowChecked = isDark ? '#404040' : '#f5f5f5';
  const selectedBar = isDark ? '#1a3a5c' : '#e3f2fd';
  const selectedText = isDark ? '#90caf9' : '#1976d2';
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (tabFilter) list = list.filter(tabFilter);
    return list.filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.category && t.category !== filter.category) return false;
      if (filter.task && !t.task?.includes(filter.task)) return false;
      if (filter.planner && !t.planner?.includes(filter.planner)) return false;
      if (filter.foPm && !t.foPm?.includes(filter.foPm)) return false;
      if (filter.boPm && !t.boPm?.includes(filter.boPm)) return false;
      return true;
    });
  }, [tasks, filter, tabFilter]);

  const toId = (v: string | number | undefined, fallback: string) =>
    v != null ? String(v) : fallback;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(
        new Set(filteredTasks.filter((t) => t.id != null).map((t) => toId(t.id, '')))
      );
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (!id || id.startsWith('_')) return;
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onDeleteClick();
  };

  const updateTask = useCallback(
    (taskId: string, key: keyof WbsTask, value: unknown) => {
      if (!taskId || taskId.startsWith('_')) return;
      const idStr = toId(taskId, '');
      if (!idStr) return;
      onTasksChange((prevTasks) => {
        const origIdx = prevTasks.findIndex(
          (x) => x.id != null && toId(x.id, '') === idStr
        );
        if (origIdx < 0) return prevTasks;
        const next = [...prevTasks];
        next[origIdx] = { ...next[origIdx], [key]: value };
        return next;
      });
    },
    [onTasksChange]
  );

  const handleExport = () => exportToExcel(filteredTasks);

  return (
    <div style={{ background: bg, borderRadius: 8, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${borderColor}`, color: textColor }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleExport}
            style={{ padding: '8px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            엑셀 다운로드
          </button>
          <button
            onClick={onLoadClick}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#ff9800',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '조회 중...' : '조회'}
          </button>
          <button
            onClick={onSaveClick}
            disabled={saving}
            style={{
              padding: '8px 16px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 14,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={onDeleteClick}
            disabled={saving || selectedIds.size === 0}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: saving || selectedIds.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: 14,
              opacity: saving || selectedIds.size === 0 ? 0.6 : 1,
            }}
          >
            {saving ? '삭제 중...' : '삭제'}
          </button>
          <button
            onClick={onAddClick}
            style={{ padding: '8px 16px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            업무 추가
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: '12px 20px', background: bgFilter, borderBottom: `1px solid ${borderColor}`, color: textColor }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>조회 조건</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: textMuted }}>상태</span>
          <select
            value={filter.status ?? ''}
            onChange={(e) => onFilterChange({ ...filter, status: e.target.value || undefined })}
            style={{ padding: '6px 10px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, minWidth: 100, background: inputBg, color: textColor }}
          >
            <option value="">전체</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: textMuted }}>카테고리</span>
          <select
            value={filter.category ?? ''}
            onChange={(e) => onFilterChange({ ...filter, category: e.target.value || undefined })}
            style={{ padding: '6px 10px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, minWidth: 100, background: inputBg, color: textColor }}
          >
            <option value="">전체</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: textMuted }}>업무</span>
          <input
            value={filter.task ?? ''}
            onChange={(e) => onFilterChange({ ...filter, task: e.target.value || undefined })}
            placeholder="검색"
            style={{ padding: '6px 10px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, minWidth: 100, background: inputBg, color: textColor }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: textMuted }}>{plannerLabel}</span>
          <input
            value={filter.planner ?? ''}
            onChange={(e) => onFilterChange({ ...filter, planner: e.target.value || undefined })}
            placeholder="검색"
            style={{ padding: '6px 10px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, minWidth: 90, background: inputBg, color: textColor }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: textMuted }}>{foPmLabel}</span>
          <input
            value={filter.foPm ?? ''}
            onChange={(e) => onFilterChange({ ...filter, foPm: e.target.value || undefined })}
            placeholder="검색"
            style={{ padding: '6px 10px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, minWidth: 90, background: inputBg, color: textColor }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: textMuted }}>{boPmLabel}</span>
          <input
            value={filter.boPm ?? ''}
            onChange={(e) => onFilterChange({ ...filter, boPm: e.target.value || undefined })}
            placeholder="검색"
            style={{ padding: '6px 10px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, minWidth: 90, background: inputBg, color: textColor }}
          />
        </div>
      </div>
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px', background: selectedBar, borderBottom: `1px solid ${borderColor}` }}>
          <span style={{ fontSize: 13, color: selectedText }}>{selectedIds.size}개 선택됨</span>
          <button
            onClick={handleBulkDelete}
            style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
          >
            선택 삭제
          </button>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center', padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>
                <input
                  type="checkbox"
                  checked={filteredTasks.length > 0 && filteredTasks.every((t) => t.id != null && selectedIds.has(toId(t.id, '')))}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
              </th>
              <th style={{ width: 100, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>카테고리</th>
              <th style={{ minWidth: 260, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>업무</th>
              <th style={{ width: 105, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>시작일</th>
              <th style={{ width: 105, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>종료예정일</th>
              <th style={{ width: 105, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>종료일</th>
              <th style={{ width: 90, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>상태</th>
              <th style={{ width: 70, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>{plannerLabel}</th>
              <th style={{ width: 70, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>{foPmLabel}</th>
              <th style={{ width: 70, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>{boPmLabel}</th>
              <th style={{ width: 55, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>MM</th>
              <th style={{ minWidth: 200, padding: '10px 12px', background: bgHeader, fontWeight: 600, fontSize: 13, color: textMuted, borderBottom: `1px solid ${borderColor}` }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t, idx) => {
              const id = toId(t.id, `_${idx}`);
              const isRowChecked = !id.startsWith('_') && selectedIds.has(id);
              return (
                <tr
                  key={id}
                  style={{ background: isRowChecked ? rowChecked : undefined, borderBottom: `1px solid ${borderColor}`, color: textColor }}
                >
                  <td style={{ width: 40, textAlign: 'center', padding: '10px 12px' }}>
                    {!id.startsWith('_') && (
                      <input
                        type="checkbox"
                        checked={isRowChecked}
                        onChange={(e) => handleSelectOne(id, e.target.checked)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    )}
                  </td>
                  <td style={{ width: 100, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <select
                        value={t.category ?? ''}
                        onChange={(e) => updateTask(id, 'category', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      >
                        {t.category && !(CATEGORY_OPTIONS as readonly string[]).includes(t.category) && (
                          <option value={t.category}>{t.category}</option>
                        )}
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{t.category || '-'}</span>
                    )}
                  </td>
                  <td style={{ minWidth: 260, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        value={t.task ?? ''}
                        onChange={(e) => updateTask(id, 'task', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.task || '-'}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        type="date"
                        value={t.start ?? ''}
                        onChange={(e) => updateTask(id, 'start', e.target.value || null)}
                        style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.start || '-'}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        type="date"
                        value={t.plannedEnd ?? ''}
                        onChange={(e) => updateTask(id, 'plannedEnd', e.target.value || null)}
                        style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.plannedEnd || '-'}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        type="date"
                        value={t.end ?? ''}
                        onChange={(e) => updateTask(id, 'end', e.target.value || null)}
                        style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.end || '-'}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <select
                        value={t.status}
                        onChange={(e) => updateTask(id, 'status', e.target.value)}
                        style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{t.status || '-'}</span>
                    )}
                  </td>
                  <td style={{ width: 70, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        value={t.planner ?? ''}
                        onChange={(e) => updateTask(id, 'planner', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.planner || '-'}</span>
                    )}
                  </td>
                  <td style={{ width: 70, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        value={t.foPm ?? ''}
                        onChange={(e) => updateTask(id, 'foPm', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.foPm || '-'}</span>
                    )}
                  </td>
                  <td style={{ width: 70, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        value={t.boPm ?? ''}
                        onChange={(e) => updateTask(id, 'boPm', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.boPm || '-'}</span>
                    )}
                  </td>
                  <td style={{ width: 55, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        type="number"
                        min={0}
                        value={t.mm ?? 0}
                        onChange={(e) => updateTask(id, 'mm', Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.mm ?? '-'}</span>
                    )}
                  </td>
                  <td style={{ minWidth: 200, padding: '10px 12px', fontSize: 14 }}>
                    {isRowChecked ? (
                      <input
                        value={t.note ?? ''}
                        onChange={(e) => updateTask(id, 'note', e.target.value || undefined)}
                        placeholder="비고"
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${inputBorder}`, borderRadius: 4, fontSize: 13, background: inputBg, color: textColor }}
                      />
                    ) : (
                      <span>{t.note || '-'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: textMuted }}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
