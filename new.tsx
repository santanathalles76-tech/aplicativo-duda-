import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TaskForm } from '../../features/tasks/TaskForm';
import { useTasks } from '../../features/tasks/TasksContext';

export default function NewTaskScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { addTask } = useTasks();

  return (
    <TaskForm
      defaultDate={date}
      submitLabel="Salvar tarefa"
      onSubmit={(input) => {
        addTask(input);
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}
