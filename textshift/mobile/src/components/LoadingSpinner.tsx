import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';

interface Props {
  message?: string;
  color?: string;
}

export function LoadingSpinner({ message, color }: Props) {
  const { theme } = useThemeStore();
  const spinnerColor = color || theme.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={spinnerColor} />
      {message && <Text style={[styles.text, { color: theme.textSecondary }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
  },
});
