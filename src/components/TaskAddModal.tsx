import { useState, useCallback } from 'react';
import type { WbsTask } from '../types/wbs';
import { defaultTask, STATUS_OPTIONS } from '../data/wbsData';
import { validateTask } from '../utils/validation';

interface TaskAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (task: WbsTask) => void | Promise<void>;
}

export function TaskAddModal({ isOpen, onClose, onConfirm }: TaskAddModalProps) {
  const [form, setForm] = useState<WbsTask>(defaultTask);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback((key: keyof WbsTask, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const err = validateTask(form);
      if (err) {
        alert(err);
        return;
      }
      setSubmitting(true);
      try {
        await onConfirm(form);
        setForm(defaultTask);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    [form, onConfirm, onClose]
  );

  const handleCancel = useCallback(() => {
    setForm(defaultTask);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          width: '90%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ padding: '20px 24px 16px', fontSize: 18, fontWeight: 600, borderBottom: '1px solid #eee' }}>
          업무 추가
        </h2>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>카테고리</label>
              <input
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>업무</label>
              <input
                value={form.task}
                onChange={(e) => update('task', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>상태</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>예정일</label>
              <input
                type="date"
                value={form.plannedStart}
                onChange={(e) => update('plannedStart', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>시작일</label>
              <input
                type="date"
                value={form.start ?? ''}
                onChange={(e) => update('start', e.target.value || null)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>종료일</label>
              <input
                type="date"
                value={form.end ?? ''}
                onChange={(e) => update('end', e.target.value || null)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>PM</label>
              <input
                value={form.pm}
                onChange={(e) => update('pm', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>MM</label>
              <input
                type="number"
                min={0}
                value={form.mm}
                onChange={(e) => update('mm', Number(e.target.value) || 0)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>비고</label>
            <input
              value={form.note ?? ''}
              onChange={(e) => update('note', e.target.value || undefined)}
              placeholder="비고"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #eee' }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '10px 20px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
