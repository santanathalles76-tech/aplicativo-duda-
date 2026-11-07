import React from 'react';
import { colors } from '../theme';

export function DateTimeField({ value, mode, onChange }: { value: Date; mode: 'date' | 'time'; onChange: (date: Date) => void }) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const inputValue = mode === 'date'
    ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
    : `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  return <input aria-label={mode === 'date' ? 'Data da tarefa' : 'Horário da tarefa'} type={mode} value={inputValue}
    onChange={(event) => {
      const next = new Date(value);
      if (mode === 'date') { const [y, m, d] = event.currentTarget.value.split('-').map(Number); if (y && m && d) next.setFullYear(y, m - 1, d); }
      else { const [h, m] = event.currentTarget.value.split(':').map(Number); if (Number.isFinite(h) && Number.isFinite(m)) next.setHours(h, m, 0, 0); }
      onChange(next);
    }}
    style={{ minHeight: 44, border: `1px solid ${colors.border}`, borderRadius: 10, background: colors.softWhite, color: colors.textPrimary, padding: '8px 12px', fontSize: 16, width: '100%', maxWidth: 220 }} />;
}
