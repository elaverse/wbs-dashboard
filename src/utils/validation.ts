import type { WbsTask } from '../types/wbs';

export function validateTask(task: WbsTask): string | null {
  if (!task.task?.trim()) return '업무명을 입력하세요.';
  if (!task.plannedEnd?.trim()) return '종료예정일을 입력하세요.';
  return null;
}
