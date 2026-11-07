import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { ProgressCard } from '../../components/ProgressCard';
import { EmptyState } from '../../components/EmptyState';
import { useTasks } from '../../features/tasks/TasksContext';
import { DEFAULT_CATEGORIES } from '../../features/tasks/categories';
import {
  aggregateRate,
  completedByCategory,
  recentDayStats,
  summarize,
  tasksForDate,
} from '../../features/tasks/taskLogic';
import { useNow } from '../../hooks/useNow';
import { toDateKey, weekdayShort } from '../../utils/date';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const BAR_MAX = 90;

export default function ProgressScreen() {
  const now = useNow();
  const todayKey = toDateKey(now);
  const { tasks } = useTasks();

  const today = useMemo(() => summarize(tasksForDate(tasks, todayKey)), [tasks, todayKey]);
  const week = useMemo(() => recentDayStats(tasks, todayKey, 7), [tasks, todayKey]);
  const weekRate = useMemo(() => aggregateRate(week), [week]);
  const byCategory = useMemo(() => completedByCategory(tasks), [tasks]);
  const totalDone = tasks.filter((t) => t.status === 'concluida').length;

  const categoryRows = DEFAULT_CATEGORIES.filter((c) => (byCategory[c.id] ?? 0) > 0);
  const maxCat = Math.max(1, ...categoryRows.map((c) => byCategory[c.id]));

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>
          Progresso
        </Text>

        {tasks.length === 0 ? (
          <EmptyState
            icon="bar-chart-2"
            title="Seu progresso aparece aqui"
            message="Assim que você criar e concluir tarefas, os números do dia e da semana serão mostrados com calma, sem cobranças."
          />
        ) : (
          <>
            <ProgressCard summary={today} title="Hoje" />

            <View style={[styles.card, shadow.soft]}>
              <View style={styles.rowBetween}>
                <Text style={[typography.heading, { color: colors.textPrimary }]}>Últimos 7 dias</Text>
                <Text style={[typography.bodyStrong, { color: colors.forest }]}>
                  {weekRate === null ? '—' : `${weekRate}%`}
                </Text>
              </View>

              <View style={styles.bars}>
                {week.map((d) => (
                  <View
                    key={d.dateKey}
                    accessible
                    accessibilityLabel={
                      d.percent === null
                        ? `${weekdayShort(d.dateKey)}: sem tarefas programadas`
                        : `${weekdayShort(d.dateKey)}: ${d.done} de ${d.total} concluídas`
                    }
                    style={styles.barCol}
                  >
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: d.percent === null ? 3 : Math.max(4, (d.percent / 100) * BAR_MAX),
                            backgroundColor: d.percent === null ? colors.border : colors.sage,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        typography.caption,
                        { color: d.dateKey === todayKey ? colors.forest : colors.textSecondary },
                        d.dateKey === todayKey && { fontWeight: '700' },
                      ]}
                    >
                      {weekdayShort(d.dateKey)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Dias sem tarefas programadas não entram na conta.
              </Text>
            </View>

            <View style={[styles.card, shadow.soft]}>
              <View style={styles.rowBetween}>
                <Text style={[typography.heading, { color: colors.textPrimary }]}>Concluídas por categoria</Text>
                <Text style={[typography.bodyStrong, { color: colors.forest }]}>{totalDone}</Text>
              </View>

              {categoryRows.length === 0 ? (
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  Nenhuma tarefa concluída ainda.
                </Text>
              ) : (
                categoryRows.map((c) => (
                  <View key={c.id} style={styles.catRow}>
                    <View style={styles.catLabel}>
                      <Feather name={c.icon as never} size={14} color={c.color} />
                      <Text style={[typography.caption, { color: colors.textPrimary }]} numberOfLines={1}>
                        {c.name}
                      </Text>
                    </View>
                    <View style={styles.catTrack}>
                      <View
                        style={[
                          styles.catFill,
                          { width: `${(byCategory[c.id] / maxCat) * 100}%`, backgroundColor: c.color },
                        ]}
                      />
                    </View>
                    <Text style={[typography.caption, { color: colors.textPrimary, width: 24, textAlign: 'right' }]}>
                      {byCategory[c.id]}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 },
  card: {
    backgroundColor: colors.softWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: spacing.sm },
  barTrack: { height: BAR_MAX, width: 18, justifyContent: 'flex-end', borderRadius: radius.pill, backgroundColor: colors.lightGreen, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: radius.pill },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  catLabel: { width: 130, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catTrack: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.lightGreen, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: radius.pill },
});
