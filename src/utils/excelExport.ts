import type { WbsTask } from '../types/wbs';

const HEADERS = [
  '카테고리',
  '업무',
  '시작일',
  '종료예정일',
  '종료일',
  '상태',
  '기획자',
  'FO PM',
  'BO PM',
  'MM',
  '비고',
];

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function rowToCsv(task: WbsTask): string[] {
  return [
    task.category,
    task.task,
    task.start ?? '',
    task.plannedEnd ?? '',
    task.end ?? '',
    task.status,
    task.planner ?? '',
    task.foPm ?? '',
    task.boPm ?? '',
    String(task.mm ?? 0),
    task.note ?? '',
  ].map(escapeCsv);
}

export function exportToExcel(tasks: WbsTask[], filename = 'wbs-목록.csv'): void {
  const rows = [HEADERS, ...tasks.map(rowToCsv)];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
