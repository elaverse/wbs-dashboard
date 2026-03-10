/// <reference types="vite/client" />

interface WbsApi {
  load: (apiBase: string, token: string) => Promise<unknown[]>;
  save: (apiBase: string, token: string, tasks: unknown[]) => Promise<void>;
}

interface Window {
  wbsApi?: WbsApi;
}
