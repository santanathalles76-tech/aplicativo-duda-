import { Alert, Platform } from 'react-native';
import type { Task } from '../types';
import { useTasks } from '../features/tasks/TasksContext';

/** Pede confirmação antes de excluir uma tarefa. */
export function useConfirmDelete() {
  const { removeTask } = useTasks();
  return (task: Task, onDeleted?: () => void) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`Deseja excluir \"${task.title}\"? Esta ação não pode ser desfeita.`)) {
        removeTask(task.id);
        onDeleted?.();
      }
      return;
    }
    Alert.alert('Excluir tarefa', `Deseja excluir "${task.title}"? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          removeTask(task.id);
          onDeleted?.();
        },
      },
    ]);
  };
}
