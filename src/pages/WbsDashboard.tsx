import { useState, useCallback } from 'react';
import type { WbsTask } from '../types/wbs';
import type { WbsFilter } from '../types/filter';
import { WbsTable } from '../components/WbsTable';
import { GanttChart } from '../components/GanttChart';
import { TaskAddModal } from '../components/TaskAddModal';
import { loadWbs, saveWbs } from '../services/wbsApi';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://example.com';
const TOKEN = import.meta.env.VITE_API_TOKEN ?? '';

function ensureIds(tasks: WbsTask[]): WbsTask[] {
  return tasks.map((t, i) => ({
    ...t,
    id: t.id ?? `task-${Date.now()}-${i}`,
  }));
}

export function WbsDashboard() {
  const [tasks, setTasks] = useState<WbsTask[]>([]);
  const [filter, setFilter] = useState<WbsFilter>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadWbs(API_BASE, TOKEN);
      setTasks(ensureIds(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await saveWbs(API_BASE, TOKEN, tasks);
      alert('저장되었습니다.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }, [tasks]);

  const handleAddTask = useCallback((task: WbsTask) => {
    const withId = ensureIds([{ ...task }])[0];
    setTasks((prev) => [...prev, withId]);
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: 24, fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif', background: '#f5f5f5', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>WBS Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '10px 20px',
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
            onClick={load}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '로딩...' : '새로고침'}
          </button>
        </div>
      </div>
      {error && (
        <div style={{ padding: '12px 16px', marginBottom: 16, background: '#ffebee', color: '#c62828', borderRadius: 6, fontSize: 14 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {['검토', '기획', '개발', '테스트', '이행'].map((s) => (
          <span
            key={s}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              color: '#fff',
              fontSize: 12,
              background: s === '검토' ? '#9e9e9e' : s === '기획' ? '#2196f3' : s === '개발' ? '#4caf50' : s === '테스트' ? '#ff9800' : '#9c27b0',
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <WbsTable
            tasks={tasks}
            filter={filter}
            onFilterChange={setFilter}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onTasksChange={setTasks}
            onAddClick={() => setModalOpen(true)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <GanttChart tasks={tasks} />
        </div>
      </div>
      <TaskAddModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleAddTask} />
    </div>
  );
}
