import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types';
import { isValidTask } from '../features/tasks/taskLogic';

const KEY = 'duda:tasks:v1';
const DB_NAME = 'duda-local';
const STORE_NAME = 'app-data';

interface Stored { version: 1; tasks: Task[] }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB indisponível neste navegador.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir armazenamento local.'));
  });
}

async function webGet(): Promise<string | null> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

async function webSet(value: string | null): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      if (value === null) store.delete(KEY); else store.put(value, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Falha ao salvar dados.'));
      tx.onabort = () => reject(tx.error ?? new Error('Gravação cancelada.'));
    });
  } finally { db.close(); }
}

async function getRaw(): Promise<string | null> {
  return Platform.OS === 'web' ? webGet() : AsyncStorage.getItem(KEY);
}
async function setRaw(value: string | null): Promise<void> {
  if (Platform.OS === 'web') return webSet(value);
  if (value === null) return AsyncStorage.removeItem(KEY);
  return AsyncStorage.setItem(KEY, value);
}

/** Lê as tarefas salvas. Registros inválidos são descartados sem derrubar o app. */
export async function loadTasks(): Promise<Task[]> {
  const raw = await getRaw();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (!parsed || !Array.isArray(parsed.tasks)) return [];
    return parsed.tasks.filter(isValidTask);
  } catch { return []; }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const payload: Stored = { version: 1, tasks };
  await setRaw(JSON.stringify(payload));
}

export async function clearTasks(): Promise<void> { await setRaw(null); }

export async function exportTasksBackup(): Promise<string> {
  const tasks = await loadTasks();
  return JSON.stringify({ app: 'DUDA', version: 1, exportedAt: new Date().toISOString(), tasks }, null, 2);
}

export async function importTasksBackup(json: string): Promise<number> {
  const parsed = JSON.parse(json) as Partial<Stored> & { app?: string };
  if (!parsed || !Array.isArray(parsed.tasks)) throw new Error('O arquivo não contém um backup válido do DUDA.');
  const valid = parsed.tasks.filter(isValidTask);
  if (valid.length !== parsed.tasks.length) throw new Error('O backup contém tarefas inválidas. Nenhum dado foi importado.');
  await saveTasks(valid);
  return valid.length;
}
