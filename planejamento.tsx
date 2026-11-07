import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { TaskCard } from '../../components/TaskCard';
import { EmptyState } from '../../components/EmptyState';
import { AddButton } from '../../components/Buttons';
import { useTasks } from '../../features/tasks/TasksContext';
import { isOverdue, PRIORITY_LABEL, sortTasks, tasksForDate } from '../../features/tasks/taskLogic';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { useNow } from '../../hooks/useNow';
import {
  addDays,
  dayOfMonth,
  formatFullDate,
  monthName,
  startOfWeek,
  toDateKey,
  weekdayShort,
} from '../../utils/date';
import type { Priority } from '../../types';
import { colors, MIN_TOUCH, priorityColors, radius, spacing, typography } from '../../theme';

type Filter = Priority | 'todas';
const FILTERS: Filter[] = ['todas', 'alta', 'media', 'baixa'];

export default function PlanningScreen() {
  const router = useRouter();
  const now = useNow();
  const todayKey = toDateKey(now);
  const { tasks, toggleTaskStatus } = useTasks();
  const confirmDelete = useConfirmDelete();

  const [selected, setSelected] = useState(todayKey);
  const [filter, setFilter] = useState<Filter>('todas');

  const weekStart = startOfWeek(selected);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const dayTasks = useMemo(() => {
    const list = tasksForDate(tasks, selected);
    const filtered = filter === 'todas' ? list : list.filter((t) => t.priority === filter);
    const pending = sortTasks(filtered.filter((t) => t.status === 'pendente'));
    const done = sortTasks(filtered.filter((t) => t.status === 'concluida'));
    return [...pending, ...done];
  }, [tasks, selected, filter]);

  const hasTasks = (key: string) => tasks.some((t) => t.dueDate === key);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>
          Planejamento
        </Text>

        <View style={styles.weekHeader}>
          <NavButton icon="chevron-left" label="Semana anterior" onPress={() => setSelected(addDays(selected, -7))} />
          <Text style={[typography.heading, { color: colors.textPrimary, textTransform: 'capitalize' }]}>
            {monthName(weekStart === selected ? selected : addDays(weekStart, 3))}
          </Text>
          <NavButton icon="chevron-right" label="Próxima semana" onPress={() => setSelected(addDays(selected, 7))} />
        </View>

        <View style={styles.weekRow}>
          {weekDays.map((key) => {
            const isSelected = key === selected;
            const isToday = key === todayKey;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${formatFullDate(key)}${isToday ? ', hoje' : ''}`}
                onPress={() => setSelected(key)}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
              >
                <Text style={[typography.caption, { color: isSelected ? colors.cream : colors.textSecondary }]}>
                  {weekdayShort(key)}
                </Text>
                <Text
                  style={[
                    typography.bodyStrong,
                    { color: isSelected ? colors.cream : colors.textPrimary },
                    isToday && !isSelected && { color: colors.forest, textDecorationLine: 'underline' },
                  ]}
                >
                  {dayOfMonth(key)}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: hasTasks(key) ? (isSelected ? colors.cream : colors.sage) : 'transparent' },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        {selected !== todayKey ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar para hoje"
            onPress={() => setSelected(todayKey)}
            style={styles.todayButton}
          >
            <Feather name="corner-up-left" size={15} color={colors.forest} />
            <Text style={[typography.caption, { color: colors.forest, fontWeight: '600' }]}>Hoje</Text>
          </Pressable>
        ) : null}

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={f === 'todas' ? 'Todas as prioridades' : `Prioridade ${PRIORITY_LABEL[f]}`}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, active && { backgroundColor: colors.lightGreen, borderColor: colors.sage }]}
              >
                {f !== 'todas' ? <View style={[styles.dot, { backgroundColor: priorityColors[f] }]} /> : null}
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: active ? '700' : '400' }]}>
                  {f === 'todas' ? 'Todas' : PRIORITY_LABEL[f]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.heading, { color: colors.textPrimary }]}>{formatFullDate(selected)}</Text>

        {dayTasks.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={filter === 'todas' ? 'Nada planejado neste dia' : 'Nenhuma tarefa com esta prioridade'}
            message={
              filter === 'todas'
                ? 'Toque em “Nova tarefa” para adicionar algo a esta data.'
                : 'Escolha “Todas” para ver as demais tarefas do dia.'
            }
          />
        ) : (
          <View style={styles.list}>
            {dayTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                overdue={isOverdue(t, now)}
                onToggle={(x) => toggleTaskStatus(x.id)}
                onEdit={(x) => router.push({ pathname: '/tasks/[id]', params: { id: x.id } })}
                onDelete={confirmDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddButton onPress={() => router.push({ pathname: '/tasks/new', params: { date: selected } })} />
    </Screen>
  );
}

function NavButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.navButton}>
      <Feather name={icon} size={22} color={colors.forest} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dayCell: {
    flex: 1,
    minHeight: 68,
    borderRadius: radius.md,
    backgroundColor: colors.softWhite,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCellSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  todayButton: {
    alignSelf: 'flex-start',
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterChip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softWhite,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  list: { gap: spacing.md },
});
