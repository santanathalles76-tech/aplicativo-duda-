import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Task } from '../../types';
import { colors, MIN_TOUCH, radius, shadow, spacing, typography } from '../../theme';
import { getCategory } from '../../features/tasks/categories';
import { PriorityBadge } from '../PriorityBadge';

interface Props {
  task: Task;
  overdue?: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, overdue, onToggle, onEdit, onDelete }: Props) {
  const done = task.status === 'concluida';
  const category = getCategory(task.categoryId);

  return (
    <View style={[styles.card, shadow.soft, done && styles.cardDone]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? `Reabrir tarefa ${task.title}` : `Concluir tarefa ${task.title}`}
        onPress={() => onToggle(task)}
        hitSlop={4}
        style={styles.checkArea}
      >
        <View style={[styles.check, done && styles.checkDone]}>
          {done ? <Feather name="check" size={16} color={colors.cream} /> : null}
        </View>
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[typography.bodyStrong, { color: colors.textPrimary }, done && styles.titleDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Feather name={category.icon as never} size={13} color={category.color} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{category.name}</Text>
          </View>
          {task.dueTime ? (
            <View style={styles.meta}>
              <Feather name="clock" size={13} color={overdue ? colors.blush : colors.naturalGray} />
              <Text style={[typography.caption, { color: overdue ? '#9C5D50' : colors.textSecondary }]}>
                {task.dueTime}
              </Text>
            </View>
          ) : null}
          {overdue ? (
            <Text style={[typography.caption, { color: '#9C5D50' }]}>Atrasada</Text>
          ) : null}
        </View>

        <PriorityBadge priority={task.priority} />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar tarefa ${task.title}`}
          onPress={() => onEdit(task)}
          style={styles.iconButton}
        >
          <Feather name="edit-2" size={18} color={colors.forest} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir tarefa ${task.title}`}
          onPress={() => onDelete(task)}
          style={styles.iconButton}
        >
          <Feather name="trash-2" size={18} color="#9C5D50" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.softWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
  },
  cardDone: { opacity: 0.7 },
  checkArea: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.sage },
  content: { flex: 1, gap: spacing.sm, paddingTop: spacing.sm, alignItems: 'flex-start' },
  titleDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actions: { flexDirection: 'column' },
  iconButton: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
});
