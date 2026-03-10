import type { WbsTask } from '../types/wbs';

export async function loadWbs(apiBase: string, token: string): Promise<WbsTask[]> {
  if (typeof window !== 'undefined' && window.wbsApi) {
    return window.wbsApi.load(apiBase, token);
  }
  return [];
}

export async function saveWbs(
  apiBase: string,
  token: string,
  tasks: WbsTask[]
): Promise<void> {
  if (typeof window !== 'undefined' && window.wbsApi) {
    await window.wbsApi.save(apiBase, token, tasks);
  }
}
