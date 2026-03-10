import type { WbsTask } from '../types/wbs';

export function validateTask(task: WbsTask): string | null {
  if (!task.task?.trim()) return '업무명을 입력하세요.';
  if (!task.plannedStart?.trim()) return '계획 시작일을 입력하세요.';
  return null;
}
