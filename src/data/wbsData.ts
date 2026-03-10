import type { WbsTask } from '../types/wbs';

const today = new Date().toISOString().slice(0, 10);

export const STATUS_OPTIONS = ['검토', '기획', '개발', '테스트', '이행'] as const;

export const defaultTask: WbsTask = {
  category: '',
  task: '',
  plannedStart: today,
  plannedEnd: null,
  start: today,
  end: null,
  planner: '',
  developer: '',
  pm: '',
  status: '기획',
  mm: 0,
};
