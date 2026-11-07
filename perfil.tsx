import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Screen } from '../../components/Screen';
import { Avatar } from '../../components/Brand';
import { Button } from '../../components/Buttons';
import { useTasks } from '../../features/tasks/TasksContext';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { exportTasksBackup, importTasksBackup } from '../../storage/taskStorage';

export default function ProfileScreen() {
  const { tasks, clearAll } = useTasks();
  const done = tasks.filter((t) => t.status === 'concluida').length;

  function confirmClear() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Todas as tarefas e o histórico serão removidos deste dispositivo. Esta ação não pode ser desfeita.')) {
        clearAll().catch(() => window.alert('Não foi possível apagar os dados.'));
      }
      return;
    }
    Alert.alert(
      'Apagar todos os dados',
      'Todas as tarefas salvas neste iPhone serão removidas, inclusive o histórico. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: () => {
            clearAll().catch(() =>
              Alert.alert('Não foi possível apagar', 'Tente novamente em instantes.'),
            );
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>
          Perfil
        </Text>

        <View style={[styles.card, shadow.soft, { alignItems: 'center' }]}>
          <Avatar size={84} />
          <Text style={[typography.title, { color: colors.textPrimary }]}>Maria Eduarda</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Seu organizador pessoal
          </Text>
        </View>

        <View style={[styles.card, shadow.soft]}>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>Suas tarefas</Text>
          <Row label="Cadastradas" value={tasks.length} />
          <Row label="Concluídas" value={done} />
          <Row label="Pendentes" value={tasks.length - done} />
        </View>

        {Platform.OS === 'web' ? (
          <View style={[styles.card, shadow.soft]}>
            <Text style={[typography.heading, { color: colors.textPrimary }]}>Adicionar à Tela de Início</Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>No iPhone, abra o DUDA pelo Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”. Depois, abra pelo ícone DUDA para usar em tela cheia.</Text>
          </View>
        ) : null}

        <View style={[styles.card, shadow.soft]}>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>Backup</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Exporte suas tarefas para guardar uma cópia ou importe um backup anterior do DUDA.</Text>
          {Platform.OS === 'web' ? (
            <>
              <Button label="Exportar backup JSON" icon="download" onPress={async () => {
                const content = await exportTasksBackup();
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a'); link.href = url; link.download = 'duda-backup.json'; link.click(); URL.revokeObjectURL(url);
              }} />
              <Button label="Importar backup JSON" icon="upload" variant="secondary" onPress={() => {
                const picker = document.createElement('input'); picker.type = 'file'; picker.accept = 'application/json,.json';
                picker.onchange = async () => {
                  const file = picker.files?.[0]; if (!file) return;
                  try { const count = await importTasksBackup(await file.text()); window.alert(`${count} tarefas importadas. Recarregue o DUDA para atualizar a tela.`); window.location.reload(); }
                  catch (error) { window.alert(error instanceof Error ? error.message : 'Não foi possível importar o backup.'); }
                }; picker.click();
              }} />
            </>
          ) : null}
        </View>

        <View style={[styles.card, shadow.soft]}>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>Dados</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Suas tarefas ficam salvas somente neste dispositivo. Depois do primeiro carregamento, o DUDA pode funcionar sem internet.
          </Text>
          <Button label="Apagar todos os dados" icon="trash-2" variant="danger" onPress={confirmClear} />
        </View>

        <Text style={[typography.caption, { color: colors.naturalGray, textAlign: 'center' }]}>
          DUDA · versão {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text style={[typography.body, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{value}</Text>
    </View>
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
    gap: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
