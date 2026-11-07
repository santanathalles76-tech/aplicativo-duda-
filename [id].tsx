import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TaskForm } from '../../features/tasks/TaskForm';
import { useTasks } from '../../features/tasks/TasksContext';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Buttons';
import { colors, spacing } from '../../theme';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTask, editTask } = useTasks();
  const confirmDelete = useConfirmDelete();
  const task = id ? getTask(String(id)) : undefined;

  if (!task) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, padding: spacing.lg, justifyContent: 'center', gap: spacing.lg }}>
        <EmptyState icon="search" title="Tarefa não encontrada" message="Ela pode ter sido excluída." />
        <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <TaskForm
      initial={task}
      submitLabel="Salvar alterações"
      onSubmit={(input) => {
        editTask(task.id, input);
        router.back();
      }}
      onCancel={() => router.back()}
      onDelete={() => confirmDelete(task, () => router.back())}
    />
  );
}
