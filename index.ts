export type Priority = 'alta' | 'media' | 'baixa';
export type TaskStatus = 'pendente' | 'concluida';

export interface Task {
  id: string;
  title: string;
  description: string;
  /** Data local no formato YYYY-MM-DD. */
  dueDate: string;
  /** Horário local HH:mm, ou null quando não definido. */
  dueTime: string | null;
  priority: Priority;
  categoryId: string;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string | null;
  priority: Priority;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  /** Nome de ícone da família Feather. */
  icon: string;
  color: string;
}

export interface DaySummary {
  total: number;
  done: number;
  pending: number;
  /** 0–100. */
  percent: number;
}
