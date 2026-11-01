import { invoke } from '@tauri-apps/api/core'

export interface HostInfo {
  platform: string
  app_version: string
  app_data_dir: string
  database_path: string
  sandbox: string
}

export interface DbStatus {
  path: string
  ready: boolean
  tables: number
}

export function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function getHostInfo(): Promise<HostInfo | null> {
  if (!isTauriRuntime()) return null
  try { return await invoke<HostInfo>('host_info') } catch { return null }
}

export async function getDbStatus(): Promise<DbStatus | null> {
  if (!isTauriRuntime()) return null
  try { return await invoke<DbStatus>('db_status') } catch { return null }
}

export async function readLocalText(name: string): Promise<string | null> {
  if (!isTauriRuntime()) return null
  try { return await invoke<string>('read_local_text', { name }) } catch { return null }
}

export async function writeLocalText(name: string, contents: string): Promise<boolean> {
  if (!isTauriRuntime()) return false
  try { await invoke('write_local_text', { name, contents }); return true } catch { return false }
}
