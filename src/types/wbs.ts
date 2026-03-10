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
  pm: string;
  status: string;
  mm: number;
  note?: string;
}
