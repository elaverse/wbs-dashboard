const STORAGE_KEY_BASE = 'wbs_api_base';
const STORAGE_KEY_TOKEN = 'wbs_api_token';
const DEFAULT_BASE = 'https://dev.e-cloud.ai:8443';

export function getApiConfig(): { apiBase: string; token: string } {
  if (typeof window === 'undefined') {
    return {
      apiBase: import.meta.env?.VITE_API_BASE ?? DEFAULT_BASE,
      token: import.meta.env?.VITE_API_TOKEN ?? '',
    };
  }
  const storedBase = localStorage.getItem(STORAGE_KEY_BASE);
  const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  return {
    apiBase: storedBase ?? import.meta.env?.VITE_API_BASE ?? DEFAULT_BASE,
    token: storedToken ?? import.meta.env?.VITE_API_TOKEN ?? '',
  };
}

export function setApiConfig(apiBase: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_BASE, apiBase);
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
}
