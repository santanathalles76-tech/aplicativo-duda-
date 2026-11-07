import React from 'react';
import NativeDateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme';

export function DateTimeField({ value, mode, onChange }: { value: Date; mode: 'date' | 'time'; onChange: (date: Date) => void }) {
  return <NativeDateTimePicker value={value} mode={mode} display="compact" locale="pt-BR" accentColor={colors.sage} onChange={(_, date) => { if (date) onChange(date); }} />;
}
