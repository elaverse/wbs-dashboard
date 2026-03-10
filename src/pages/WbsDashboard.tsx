import { useState, useCallback, useMemo } from 'react';
import type { WbsTask } from '../types/wbs';
import type { WbsFilter } from '../types/filter';
import { WbsTable } from '../components/WbsTable';
import { GanttChart } from '../components/GanttChart';
import { TaskAddModal } from '../components/TaskAddModal';
import { loadWbs, saveWbs } from '../services/wbsApi';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://example.com';
const TOKEN = import.meta.env.VITE_API_TOKEN ?? '';

function normalizeTask(t: WbsTask & { pm?: string }, i: number): WbsTask {
  const foPm = t.foPm ?? (t as { pm?: string }).pm ?? '';
  const boPm = t.boPm ?? '';
  const planner = t.planner ?? '';
  return {
    ...t,
    id: t.id ?? `task-${Date.now()}-${i}`,
    planner,
    foPm,
    boPm,
  };
}

function ensureIds(tasks: (WbsTask & { pm?: string })[]): WbsTask[] {
  return tasks.map(normalizeTask);
}

type WbsTab = 'dev' | 'rd';

export function WbsDashboard() {
  const { theme, toggleTheme, bgPage, bgCard } = useTheme();
  const [activeTab, setActiveTab] = useState<WbsTab>('dev');
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
    setSelectedIds(new Set());
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

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    if (!confirm(`선택한 ${selectedIds.size}개 항목을 삭제하고 클라우드에 저장하시겠습니까?`)) return;
    const next = tasks.filter((t) => !t.id || !selectedIds.has(t.id));
    setTasks(next);
    setSelectedIds(new Set());
    setSaving(true);
    setError(null);
    try {
      await saveWbs(API_BASE, TOKEN, next);
      alert('삭제되었습니다.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
      setTasks(tasks);
    } finally {
      setSaving(false);
    }
  }, [tasks, selectedIds]);

  const handleAddTask = useCallback(
    async (task: WbsTask) => {
      const withId = ensureIds([{ ...task }])[0];
      const lastMatchingIndex = tasks.reduce(
        (idx, t, i) => (t.category === task.category ? i : idx),
        -1
      );
      const insertIndex = lastMatchingIndex >= 0 ? lastMatchingIndex + 1 : tasks.length;
      const newTasks = [
        ...tasks.slice(0, insertIndex),
        withId,
        ...tasks.slice(insertIndex),
      ];
      setTasks(newTasks);
      setSaving(true);
      setError(null);
      try {
        await saveWbs(API_BASE, TOKEN, newTasks);
        alert('추가되었습니다.');
      } catch (e) {
        setError(e instanceof Error ? e.message : '추가 실패');
        setTasks(tasks);
      } finally {
        setSaving(false);
      }
    },
    [tasks]
  );

  const textColor = theme === 'default' ? '#ffffff' : '#333';

  const ganttTasks = useMemo(() => {
    const tabFilter = activeTab === 'dev'
      ? (t: WbsTask) => t.category !== '기술개발(R&D)'
      : (t: WbsTask) => t.category === '기술개발(R&D)';
    return tasks.filter(tabFilter).filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.category && t.category !== filter.category) return false;
      if (filter.task && !t.task?.includes(filter.task)) return false;
      if (filter.planner && !t.planner?.includes(filter.planner)) return false;
      if (filter.foPm && !t.foPm?.includes(filter.foPm)) return false;
      if (filter.boPm && !t.boPm?.includes(filter.boPm)) return false;
      return true;
    });
  }, [tasks, filter, activeTab]);

  return (
    <div style={{ minHeight: '100vh', padding: 24, fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif', background: bgPage, color: textColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>WBS Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: textColor }}>
            <span>테마</span>
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'light'}
              onClick={toggleTheme}
              style={{
                width: 48,
                height: 24,
                borderRadius: 12,
                border: theme === 'default' ? '2px solid #555' : '2px solid #ccc',
                background: theme === 'default' ? '#333' : '#fff',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: theme === 'default' ? 2 : 26,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: theme === 'default' ? '#888' : '#2196f3',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            <span style={{ fontSize: 13 }}>{theme === 'default' ? '검은색' : '흰색'}</span>
          </label>
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
        <div style={{ padding: '12px 16px', marginBottom: 16, background: theme === 'default' ? '#5c2a2a' : '#ffebee', color: '#ff8a80', borderRadius: 6, fontSize: 14 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: theme === 'default' ? '1px solid #444' : '1px solid #eee' }}>
        <button
          type="button"
          onClick={() => setActiveTab('dev')}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            background: activeTab === 'dev' ? (theme === 'default' ? '#333' : '#e3f2fd') : 'transparent',
            color: activeTab === 'dev' ? (theme === 'default' ? '#fff' : '#1976d2') : textColor,
            border: 'none',
            borderBottom: activeTab === 'dev' ? `2px solid ${theme === 'default' ? '#2196f3' : '#1976d2'}` : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          개발 WBS목록
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rd')}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            background: activeTab === 'rd' ? (theme === 'default' ? '#333' : '#e3f2fd') : 'transparent',
            color: activeTab === 'rd' ? (theme === 'default' ? '#fff' : '#1976d2') : textColor,
            border: 'none',
            borderBottom: activeTab === 'rd' ? `2px solid ${theme === 'default' ? '#2196f3' : '#1976d2'}` : '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          R&D목록
        </button>
      </div>
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
          {activeTab === 'dev' && (
            <WbsTable
              tasks={tasks}
              filter={filter}
              onFilterChange={setFilter}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onTasksChange={setTasks}
              onAddClick={() => setModalOpen(true)}
              onLoadClick={load}
              onSaveClick={save}
              onDeleteClick={handleDelete}
              loading={loading}
              saving={saving}
              theme={theme}
              title="개발 WBS목록"
              tabFilter={(t) => t.category !== '기술개발(R&D)'}
            />
          )}
          {activeTab === 'rd' && (
            <WbsTable
              tasks={tasks}
              filter={filter}
              onFilterChange={setFilter}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onTasksChange={setTasks}
              onAddClick={() => setModalOpen(true)}
              onLoadClick={load}
              onSaveClick={save}
              onDeleteClick={handleDelete}
              loading={loading}
              saving={saving}
              theme={theme}
              title="R&D목록"
              tabFilter={(t) => t.category === '기술개발(R&D)'}
            />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {activeTab === 'dev' && (
            <GanttChart
              tasks={ganttTasks}
              theme={theme}
              title="개발 WBS 간트 차트"
            />
          )}
          {activeTab === 'rd' && (
            <GanttChart
              tasks={ganttTasks}
              theme={theme}
              title="R&D 간트 차트"
            />
          )}
        </div>
      </div>
      <TaskAddModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddTask}
        theme={theme}
        defaultCategory={activeTab === 'rd' ? '기술개발(R&D)' : undefined}
      />
    </div>
  );
}
