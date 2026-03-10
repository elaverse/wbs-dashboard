import type { WbsTask } from '../types/wbs';
import { CATEGORY_OPTIONS } from './categoryData';

const today = new Date().toISOString().slice(0, 10);

export const STATUS_OPTIONS = ['검토', '기획', '개발', '테스트', '이행'] as const;

export { CATEGORY_OPTIONS } from './categoryData';

export const defaultTask: WbsTask = {
  category: CATEGORY_OPTIONS[0],
  task: '',
  plannedStart: today,
  plannedEnd: today,
  start: today,
  end: today,
  planner: '',
  developer: '',
  foPm: '',
  boPm: '',
  status: '기획',
  mm: 0,
};
