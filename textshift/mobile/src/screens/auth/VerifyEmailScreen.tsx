import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/Button';
import { authApi } from '../../api/client';
import { useThemeStore } from '../../store/themeStore';
import type { ThemeColors } from '../../theme/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyEmailPending'>;
  route: RouteProp<RootStackParamList, 'VerifyEmailPending'>;
}

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      const result = await authApi.resendVerification(email);
      if (result.already_verified) {
        Alert.alert('Already Verified', 'Your email is already verified. You can log in now.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Sent', 'Verification email has been resent.');
      }
    } catch {
      Alert.alert('Error', 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>📬</Text>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.description}>
            We've sent a verification link to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
          <Text style={styles.note}>
            Please check your inbox and click the verification link to activate your account.
          </Text>

          <Button title="Resend Email" onPress={handleResend} loading={loading} variant="outline" />

          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            variant="secondary"
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
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  email: {
    color: theme.primary,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
});
