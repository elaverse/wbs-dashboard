import type { WbsTask } from '../types/wbs';

async function fetchApi(
  apiBase: string,
  endpoint: string,
  token: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const params = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  });
  const res = await fetch(`${apiBase}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`API 오류: ${res.status}`);
  const json = await res.json();
  return json?.data ?? json;
}

export async function loadWbs(apiBase: string, token: string): Promise<WbsTask[]> {
  if (typeof window !== 'undefined' && window.wbsApi) {
    return window.wbsApi.load(apiBase, token) as Promise<WbsTask[]>;
  }
  const data = await fetchApi(apiBase, '/common/app/itsm/jsonDownload', token, {
    jsonFileName: 'wbs',
  });
  return Array.isArray(data) ? (data as WbsTask[]) : [];
}

export async function saveWbs(
  apiBase: string,
  token: string,
  tasks: WbsTask[]
): Promise<void> {
  if (typeof window !== 'undefined' && window.wbsApi) {
    await window.wbsApi.save(apiBase, token, tasks);
    return;
  }
  await fetchApi(apiBase, '/common/app/itsm/jsonUpload', token, {
    jsonFileName: 'wbs',
    data: tasks,
  });
}
