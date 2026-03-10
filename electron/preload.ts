import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('wbsApi', {
  load: (apiBase: string, token: string) => ipcRenderer.invoke('wbs:load', apiBase, token),
  save: (apiBase: string, token: string, tasks: unknown[]) =>
    ipcRenderer.invoke('wbs:save', apiBase, token, tasks),
});
