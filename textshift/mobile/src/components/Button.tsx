import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/themeStore';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Button({ title, onPress, loading, disabled, variant = 'primary', size = 'md', style }: Props) {
  const { theme } = useThemeStore();
  const isDisabled = disabled || loading;

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: theme.primary },
    secondary: { backgroundColor: theme.surfaceLight },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary },
    danger: { backgroundColor: theme.danger },
  };

  const textColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: theme.text,
    outline: theme.primary,
    danger: '#FFFFFF',
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.primary : '#FFF'} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColors[variant] }, styles[`textSize_${size}`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
  },
  textSize_sm: {
    fontSize: 14,
  },
  textSize_md: {
    fontSize: 16,
  },
  textSize_lg: {
    fontSize: 18,
  },
});
