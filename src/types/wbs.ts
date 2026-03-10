export interface WbsTask {
  id?: string;
  category: string;
  task: string;
  plannedStart: string;
  plannedEnd?: string | null;
  start: string | null;
  end: string | null;
  planner: string;
  developer: string;
  /** @deprecated use foPm, boPm - 기존 데이터 호환용 */
  pm?: string;
  foPm: string;
  boPm: string;
  status: string;
  mm: number;
  note?: string;
}
