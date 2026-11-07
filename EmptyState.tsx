import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Feather name={icon} size={26} color={colors.sage} />
      </View>
      <Text style={[typography.heading, { color: colors.textPrimary, textAlign: 'center' }]}>{title}</Text>
      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
