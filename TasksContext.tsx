import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Task, TaskInput } from '../../types';
import { clearTasks, loadTasks, saveTasks } from '../../storage/taskStorage';
import { generateId } from '../../utils/id';
import { createTask, toggleTask, updateTask } from './taskLogic';

interface TasksContextValue {
  tasks: Task[];
  loaded: boolean;
  /** Mensagem amigável quando a leitura ou gravação falha. */
  error: string | null;
  addTask: (input: TaskInput) => void;
  editTask: (id: string, input: TaskInput) => void;
  removeTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  clearAll: () => Promise<void>;
  getTask: (id: string) => Task | undefined;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  // Carrega do armazenamento local uma única vez.
  useEffect(() => {
    let cancelled = false;
    loadTasks()
      .then((stored) => {
        if (!cancelled) setTasks(stored);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar suas tarefas.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Grava a cada mudança, em fila, para que gravações nunca se atropelem.
  useEffect(() => {
    if (!loaded) return;
    writeQueue.current = writeQueue.current
      .then(() => saveTasks(tasks))
      .then(() => setError(null))
      .catch(() => setError('Não foi possível salvar suas tarefas. Tente novamente.'));
  }, [tasks, loaded]);

  const addTask = useCallback((input: TaskInput) => {
    setTasks((prev) => [...prev, createTask(input, generateId(), new Date())]);
  }, []);

  const editTask = useCallback((id: string, input: TaskInput) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? updateTask(t, input, new Date()) : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? toggleTask(t, new Date()) : t)));
  }, []);

  const clearAll = useCallback(async () => {
    setTasks([]);
    await writeQueue.current;
    await clearTasks();
  }, []);

  const getTask = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const value = useMemo(
    () => ({ tasks, loaded, error, addTask, editTask, removeTask, toggleTaskStatus, clearAll, getTask }),
    [tasks, loaded, error, addTask, editTask, removeTask, toggleTaskStatus, clearAll, getTask],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks deve ser usado dentro de TasksProvider');
  return ctx;
}
