import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { useThemeStore } from '../../store/themeStore';
import type { ThemeColors } from '../../theme/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
}

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.form}>
            <Text style={styles.icon}>📧</Text>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.description}>
              If an account with {email} exists, we've sent a password reset link.
            </Text>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="outline" />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.description}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />

          <Button
            title="Back to Login"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  form: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
});
