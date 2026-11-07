import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateTimeField } from '../../components/DateTimeField';
import type { Priority, Task, TaskInput } from '../../types';
import { colors, MIN_TOUCH, priorityColors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Buttons';
import { isValidDateKey, parseDateKey, timeKey, toDateKey } from '../../utils/date';
import { DEFAULT_CATEGORIES } from './categories';
import { taskFormSchema } from './schema';
import { PRIORITY_LABEL } from './taskLogic';

interface Props {
  initial?: Task;
  defaultDate?: string;
  submitLabel: string;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const PRIORITIES: Priority[] = ['alta', 'media', 'baixa'];

function timeToDate(time: string | null): Date {
  const d = new Date();
  if (time) {
    const [h, m] = time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d;
}

export function TaskForm({ initial, defaultDate, submitLabel, onSubmit, onCancel, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ?? (defaultDate && isValidDateKey(defaultDate) ? defaultDate : toDateKey(new Date())),
  );
  const [dueTime, setDueTime] = useState<string | null>(initial?.dueTime ?? null);
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? DEFAULT_CATEGORIES[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit() {
    const result = taskFormSchema.safeParse({ title, description, dueDate, dueTime, priority, categoryId });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit({ ...result.data, title: result.data.title.trim(), description: result.data.description.trim() });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Título" error={errors.title}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="O que precisa ser feito?"
            placeholderTextColor={colors.naturalGray}
            maxLength={120}
            accessibilityLabel="Título da tarefa"
            style={[styles.input, errors.title ? styles.inputError : null]}
            returnKeyType="done"
          />
        </Field>

        <Field label="Descrição (opcional)" error={errors.description}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Detalhes, observações…"
            placeholderTextColor={colors.naturalGray}
            multiline
            maxLength={500}
            accessibilityLabel="Descrição da tarefa"
            style={[styles.input, styles.multiline]}
          />
        </Field>

        <Field label="Data" error={errors.dueDate}>
          <View style={styles.pickerRow}>
            <DateTimeField value={parseDateKey(dueDate)} mode="date" onChange={(date) => setDueDate(toDateKey(date))} />
          </View>
        </Field>

        <Field label="Horário" error={errors.dueTime}>
          <View style={styles.pickerRow}>
            <Text style={[typography.body, { color: colors.textPrimary }]}>Definir horário</Text>
            <Switch
              value={dueTime !== null}
              onValueChange={(on) => setDueTime(on ? timeKey(new Date()) : null)}
              trackColor={{ true: colors.sage, false: colors.border }}
              accessibilityLabel="Definir horário"
            />
          </View>
          {dueTime !== null ? (
            <View style={[styles.pickerRow, { marginTop: spacing.sm }]}>
              <DateTimeField value={timeToDate(dueTime)} mode="time" onChange={(date) => setDueTime(timeKey(date))} />
            </View>
          ) : null}
        </Field>

        <Field label="Prioridade">
          <View style={styles.chipRow}>
            {PRIORITIES.map((p) => {
              const selected = priority === p;
              return (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Prioridade ${PRIORITY_LABEL[p].toLowerCase()}`}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.chip,
                    selected && { backgroundColor: colors.lightGreen, borderColor: priorityColors[p] },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: priorityColors[p] }]} />
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{PRIORITY_LABEL[p]}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Categoria" error={errors.categoryId}>
          <View style={styles.chipRow}>
            {DEFAULT_CATEGORIES.map((c) => {
              const selected = categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Categoria ${c.name}`}
                  onPress={() => setCategoryId(c.id)}
                  style={[styles.chip, selected && { backgroundColor: colors.lightGreen, borderColor: c.color }]}
                >
                  <Feather name={c.icon as never} size={15} color={c.color} />
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <View style={styles.buttons}>
          <Button label={submitLabel} icon="check" onPress={handleSubmit} />
          <Button label="Cancelar" variant="secondary" onPress={onCancel} />
          {onDelete ? <Button label="Excluir tarefa" icon="trash-2" variant="danger" onPress={onDelete} /> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={[typography.label, { color: colors.textSecondary, textTransform: 'uppercase' }]}>{label}</Text>
      {children}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: '#9C5D50' }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl * 2 },
  field: { gap: spacing.sm },
  input: {
    minHeight: MIN_TOUCH + 4,
    backgroundColor: colors.softWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.blush },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  pickerRow: {
    minHeight: MIN_TOUCH + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.softWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softWhite,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  buttons: { gap: spacing.md, marginTop: spacing.sm },
});
