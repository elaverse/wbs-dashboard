import { useMemo } from 'react';
import type { WbsTask } from '../types/wbs';
import type { WbsFilter } from '../types/filter';
import { StatusBadge } from './StatusBadge';
import { STATUS_OPTIONS } from '../data/wbsData';
import { exportToExcel } from '../utils/excelExport';

interface WbsTableProps {
  tasks: WbsTask[];
  filter: WbsFilter;
  onFilterChange: (f: WbsFilter) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onTasksChange: (tasks: WbsTask[]) => void;
  onAddClick: () => void;
}

export function WbsTable({
  tasks,
  filter,
  onFilterChange,
  selectedIds,
  onSelectionChange,
  onTasksChange,
  onAddClick,
}: WbsTableProps) {
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.category && !t.category?.includes(filter.category)) return false;
      if (filter.task && !t.task?.includes(filter.task)) return false;
      return true;
    });
  }, [tasks, filter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(filteredTasks.filter((t) => t.id).map((t) => t.id!)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id: string | undefined, checked: boolean) => {
    if (!id) return;
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개 항목을 삭제하시겠습니까?`)) return;
    const next = tasks.filter((t) => !t.id || !selectedIds.has(t.id));
    onTasksChange(next);
    onSelectionChange(new Set());
  };

  const updateTask = (idx: number, key: keyof WbsTask, value: unknown) => {
    const t = filteredTasks[idx];
    const origIdx = tasks.findIndex((x) => x === t);
    if (origIdx < 0) return;
    const next = [...tasks];
    next[origIdx] = { ...next[origIdx], [key]: value };
    onTasksChange(next);
  };

  const handleExport = () => exportToExcel(filteredTasks);

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>WBS 목록</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleExport}
            style={{ padding: '8px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            엑셀 다운로드
          </button>
          <button
            onClick={onAddClick}
            style={{ padding: '8px 16px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
          >
            업무 추가
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '12px 20px', background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#555' }}>상태</span>
          <select
            value={filter.status ?? ''}
            onChange={(e) => onFilterChange({ ...filter, status: e.target.value || undefined })}
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, minWidth: 100 }}
          >
            <option value="">전체</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#555' }}>업무</span>
          <input
            value={filter.task ?? ''}
            onChange={(e) => onFilterChange({ ...filter, task: e.target.value || undefined })}
            placeholder="검색"
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, minWidth: 100 }}
          />
        </div>
      </div>
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px', background: '#e3f2fd', borderBottom: '1px solid #eee' }}>
          <span style={{ fontSize: 13, color: '#1976d2' }}>{selectedIds.size}개 선택됨</span>
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
              <th style={{ width: 40, textAlign: 'center', padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>
                <input
                  type="checkbox"
                  checked={filteredTasks.length > 0 && filteredTasks.every((t) => t.id && selectedIds.has(t.id))}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
              </th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>카테고리</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>업무</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>계획시작</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>계획종료</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>상태</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>기획자</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>개발자</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>PM</th>
              <th style={{ padding: '10px 12px', background: '#fafafa', fontWeight: 600, fontSize: 13, color: '#555' }}>MM</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t, idx) => {
              const id = t.id ?? `_${idx}`;
              const isRowChecked = id.startsWith('_') ? false : selectedIds.has(id);
              return (
                <tr
                  key={id}
                  style={{ background: isRowChecked ? '#f5f5f5' : undefined, borderBottom: '1px solid #eee' }}
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
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      value={t.category}
                      onChange={(e) => updateTask(idx, 'category', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      value={t.task}
                      onChange={(e) => updateTask(idx, 'task', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      type="date"
                      value={t.plannedStart ?? ''}
                      onChange={(e) => updateTask(idx, 'plannedStart', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      type="date"
                      value={t.plannedEnd ?? ''}
                      onChange={(e) => updateTask(idx, 'plannedEnd', e.target.value || null)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <select
                      value={t.status}
                      onChange={(e) => updateTask(idx, 'status', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      value={t.planner}
                      onChange={(e) => updateTask(idx, 'planner', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      value={t.developer}
                      onChange={(e) => updateTask(idx, 'developer', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      value={t.pm}
                      onChange={(e) => updateTask(idx, 'pm', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>
                    <input
                      type="number"
                      min={0}
                      value={t.mm ?? 0}
                      onChange={(e) => updateTask(idx, 'mm', Number(e.target.value) || 0)}
                      style={{ width: '100%', minWidth: 60, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
