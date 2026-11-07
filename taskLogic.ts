/**
 * Regras de negócio das tarefas — funções puras, sem React e sem armazenamento.
 */
import type { DaySummary, Priority, Task, TaskInput } from '../../types/index.ts';
import { addDays, isValidDateKey, isValidTime, timeKey, toDateKey } from '../../utils/date.ts';

export const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };
export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export function createTask(input: TaskInput, id: string, now: Date): Task {
  const iso = now.toISOString();
  return {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    priority: input.priority,
    categoryId: input.categoryId,
    status: 'pendente',
    completedAt: null,
    createdAt: iso,
    updatedAt: iso,
  };
}

export function updateTask(task: Task, input: TaskInput, now: Date): Task {
  return {
    ...task,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    priority: input.priority,
    categoryId: input.categoryId,
    updatedAt: now.toISOString(),
  };
}

/** Conclui uma tarefa pendente ou reabre uma concluída. */
export function toggleTask(task: Task, now: Date): Task {
  const iso = now.toISOString();
  return task.status === 'concluida'
    ? { ...task, status: 'pendente', completedAt: null, updatedAt: iso }
    : { ...task, status: 'concluida', completedAt: iso, updatedAt: iso };
}

/**
 * Ordenação automática: prioridade alta primeiro; depois por horário
 * (tarefas sem horário ao final); depois por data de criação.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    if (a.dueTime !== b.dueTime) {
      if (a.dueTime === null) return 1;
      if (b.dueTime === null) return -1;
      return a.dueTime < b.dueTime ? -1 : 1;
    }
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
}

export function tasksForDate(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((t) => t.dueDate === dateKey);
}

export function summarize(tasks: Task[]): DaySummary {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'concluida').length;
  return {
    total,
    done,
    pending: total - done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

/** Pendente e já vencida (dia anterior, ou hoje com horário já passado). */
export function isOverdue(task: Task, now: Date): boolean {
  if (task.status !== 'pendente') return false;
  const today = toDateKey(now);
  if (task.dueDate < today) return true;
  return task.dueDate === today && task.dueTime !== null && task.dueTime < timeKey(now);
}

/** Pendentes de dias anteriores a hoje. */
export function overdueFromPreviousDays(tasks: Task[], now: Date): Task[] {
  const today = toDateKey(now);
  return tasks.filter((t) => t.status === 'pendente' && t.dueDate < today);
}

export interface DayStat {
  dateKey: string;
  total: number;
  done: number;
  /** null quando não há tarefas programadas no dia (não conta como 0%). */
  percent: number | null;
}

/** Estatísticas dos últimos `days` dias, terminando em `endKey`. */
export function recentDayStats(tasks: Task[], endKey: string, days = 7): DayStat[] {
  const stats: DayStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = addDays(endKey, -i);
    const s = summarize(tasksForDate(tasks, key));
    stats.push({
      dateKey: key,
      total: s.total,
      done: s.done,
      percent: s.total === 0 ? null : s.percent,
    });
  }
  return stats;
}

/** Taxa de conclusão agregada, considerando apenas dias com tarefas. */
export function aggregateRate(stats: DayStat[]): number | null {
  const total = stats.reduce((n, s) => n + s.total, 0);
  if (total === 0) return null;
  const done = stats.reduce((n, s) => n + s.done, 0);
  return Math.round((done / total) * 100);
}

/** Quantidade de tarefas concluídas por categoria. */
export function completedByCategory(tasks: Task[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of tasks) {
    if (t.status === 'concluida') out[t.categoryId] = (out[t.categoryId] ?? 0) + 1;
  }
  return out;
}

/** Validação defensiva de dados lidos do armazenamento. */
export function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    t.id.length > 0 &&
    typeof t.title === 'string' &&
    t.title.trim().length > 0 &&
    typeof t.description === 'string' &&
    isValidDateKey(t.dueDate) &&
    (t.dueTime === null || isValidTime(t.dueTime)) &&
    (t.priority === 'alta' || t.priority === 'media' || t.priority === 'baixa') &&
    typeof t.categoryId === 'string' &&
    (t.status === 'pendente' || t.status === 'concluida') &&
    (t.completedAt === null || typeof t.completedAt === 'string') &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}
