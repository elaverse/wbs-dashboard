import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { WbsTask } from '../types/wbs';
import type { WbsFilter } from '../types/filter';
import { WbsTable } from '../components/WbsTable';
import { GanttChart } from '../components/GanttChart';
import { TaskAddModal } from '../components/TaskAddModal';
import { loadWbs, saveWbs } from '../services/wbsApi';
import { useTheme } from '../contexts/ThemeContext';
import { ApiConfigModal } from '../components/ApiConfigModal';
import { getApiConfig } from '../config/apiConfig';

function normalizeTask(t: WbsTask & { pm?: string }, i: number): WbsTask {
  const foPm = t.foPm ?? (t as { pm?: string }).pm ?? '';
  const boPm = t.boPm ?? '';
  const planner = t.planner ?? '';
  const id = t.id != null ? String(t.id) : `task-${Date.now()}-${i}`;
  return {
    ...t,
    id,
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
  const [configOpen, setConfigOpen] = useState(false);
  const [apiConfig, setApiConfigState] = useState(getApiConfig);
  const tasksRef = useRef<WbsTask[]>([]);

  const refreshApiConfig = useCallback(() => {
    setApiConfigState(getApiConfig());
  }, []);

  const setTasksAndRef = useCallback((arg: WbsTask[] | ((prev: WbsTask[]) => WbsTask[])) => {
    setTasks((prev) => {
      const next = typeof arg === 'function' ? arg(prev) : arg;
      tasksRef.current = next;
      return next;
    });
  }, []);

  const toId = (v: string | number | undefined) =>
    v != null ? String(v) : '';

  const load = useCallback(async () => {
    const { apiBase, token } = getApiConfig();
    if (!token) {
      setError('API 토큰이 설정되지 않았습니다. 상단 "설정" 버튼에서 입력하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());
    try {
      const data = await loadWbs(apiBase, token);
      setTasksAndRef(ensureIds(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패');
      setTasksAndRef([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    const { apiBase, token } = apiConfig;
    if (!token) {
      setError('API 토큰이 설정되지 않았습니다. 상단 "설정" 버튼에서 입력하세요.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const latestTasks = tasksRef.current;
      await saveWbs(apiBase, token, latestTasks);
      alert('저장되었습니다.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }, [apiConfig]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    if (!confirm(`선택한 ${selectedIds.size}개 항목을 삭제하고 클라우드에 저장하시겠습니까?`)) return;
    const current = tasksRef.current;
    const next = current.filter(
      (t) => !t.id || !selectedIds.has(toId(t.id))
    );
    setTasksAndRef(next);
    setSelectedIds(new Set());
    const { apiBase, token } = apiConfig;
    if (!token) {
      setError('API 토큰이 설정되지 않았습니다.');
      setTasksAndRef(current);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveWbs(apiBase, token, next);
      alert('삭제되었습니다.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
      setTasksAndRef(current);
    } finally {
      setSaving(false);
    }
  }, [selectedIds]);

  const handleAddTask = useCallback(
    async (task: WbsTask) => {
      const current = tasksRef.current;
      const withId = ensureIds([{ ...task }])[0];
      const lastMatchingIndex = current.reduce(
        (idx, t, i) => (t.category === task.category ? i : idx),
        -1
      );
      const insertIndex = lastMatchingIndex >= 0 ? lastMatchingIndex + 1 : current.length;
      const newTasks = [
        ...current.slice(0, insertIndex),
        withId,
        ...current.slice(insertIndex),
      ];
      const { apiBase, token } = apiConfig;
      if (!token) {
        setError('API 토큰이 설정되지 않았습니다.');
        return;
      }
      setTasksAndRef(newTasks);
      setSaving(true);
      setError(null);
      try {
        await saveWbs(apiBase, token, newTasks);
        alert('추가되었습니다.');
      } catch (e) {
        setError(e instanceof Error ? e.message : '추가 실패');
        setTasksAndRef(current);
      } finally {
        setSaving(false);
      }
    },
    [apiConfig]
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
    <div style={{ minHeight: '100vh', padding: 24, paddingBottom: error ? 60 : 24, fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif', background: bgPage, color: textColor }}>
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
            onClick={() => setConfigOpen(true)}
            style={{
              padding: '10px 20px',
              background: theme === 'default' ? '#555' : '#e0e0e0',
              color: textColor,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            설정
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
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: theme === 'default' ? '1px solid #444' : '1px solid #eee' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('dev'); setSelectedIds(new Set()); }}
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
          onClick={() => { setActiveTab('rd'); setSelectedIds(new Set()); }}
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
              onTasksChange={setTasksAndRef}
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
              onTasksChange={setTasksAndRef}
              onAddClick={() => setModalOpen(true)}
              onLoadClick={load}
              onSaveClick={save}
              onDeleteClick={handleDelete}
              loading={loading}
              saving={saving}
              theme={theme}
              title="R&D목록"
              tabFilter={(t) => t.category === '기술개발(R&D)'}
              plannerLabel="설계자"
              foPmLabel="FO개발자"
              boPmLabel="BO개발자"
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
      <ApiConfigModal
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        onSave={() => { refreshApiConfig(); load(); }}
        theme={theme}
      />
      <TaskAddModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddTask}
        theme={theme}
        defaultCategory={activeTab === 'rd' ? '기술개발(R&D)' : undefined}
        plannerLabel={activeTab === 'rd' ? '설계자' : undefined}
        foPmLabel={activeTab === 'rd' ? 'FO개발자' : undefined}
        boPmLabel={activeTab === 'rd' ? 'BO개발자' : undefined}
      />
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 20px 12px 20px',
            background: theme === 'default' ? '#5c2a2a' : '#ffebee',
            color: '#ff8a80',
            fontSize: 14,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            zIndex: 1000,
          }}
        >
          <span style={{ flex: 1 }}>서버 오류: {error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 4,
              color: '#ff8a80',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
