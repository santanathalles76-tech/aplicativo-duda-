import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

export function Logo() {
  return (
    <Text accessibilityRole="header" style={[typography.brand, { color: colors.forest }]}>
      DUDA
    </Text>
  );
}

export function Avatar({ size = 44 }: { size?: number }) {
  return (
    <View
      accessible
      accessibilityLabel="Avatar de Maria Eduarda"
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.46 }]}>D</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  letter: { color: colors.cream, fontWeight: '700', fontFamily: typography.title.fontFamily },
});
