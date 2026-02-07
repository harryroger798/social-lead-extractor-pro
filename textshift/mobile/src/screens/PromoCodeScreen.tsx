import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { promoApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { ThemeColors } from '../theme/colors';

export default function PromoCodeScreen() {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [promoInfo, setPromoInfo] = useState<{ valid: boolean; description: string; credits?: number } | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const handleValidate = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }
    setValidating(true);
    setPromoInfo(null);
    try {
      const data = await promoApi.validate(code.trim().toUpperCase());
      setPromoInfo(data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid promo code';
      Alert.alert('Invalid Code', message);
    } finally {
      setValidating(false);
    }
  };

  const handleRedeem = async () => {
    setLoading(true);
    try {
      await promoApi.redeem(code.trim().toUpperCase());
      setRedeemed(true);
      await refreshUser();
      Alert.alert('Success', 'Promo code redeemed successfully!');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to redeem code';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setPromoInfo(null);
    setRedeemed(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Promo Code</Text>
        <Text style={styles.subtitle}>Enter a promotional code to get credits</Text>

        {redeemed ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={theme.primary} />
            </View>
            <Text style={styles.successTitle}>Code Redeemed!</Text>
            <Text style={styles.successDesc}>
              {promoInfo?.credits ? `${promoInfo.credits} credits added to your account.` : 'Benefits applied to your account.'}
            </Text>
            <Button title="Redeem Another" onPress={handleReset} variant="outline" style={{ marginTop: 20 }} />
          </View>
        ) : (
          <>
            <View style={styles.inputSection}>
              <TextInput
                label="Promo Code"
                placeholder="Enter your promo code"
                value={code}
                onChangeText={(t) => { setCode(t.toUpperCase()); setPromoInfo(null); }}
                autoCapitalize="characters"
              />
              <Button
                title={promoInfo ? 'Re-validate' : 'Validate Code'}
                onPress={handleValidate}
                loading={validating}
                variant="outline"
                disabled={!code.trim()}
              />
            </View>

            {promoInfo && promoInfo.valid && (
              <View style={styles.promoCard}>
                <Ionicons name="gift" size={32} color={theme.primary} />
                <Text style={styles.promoTitle}>{code.toUpperCase()}</Text>
                <Text style={styles.promoDesc}>{promoInfo.description}</Text>
                {promoInfo.credits && (
                  <Text style={styles.promoCredits}>+{promoInfo.credits.toLocaleString()} credits</Text>
                )}
                <Button
                  title="Redeem Now"
                  onPress={handleRedeem}
                  loading={loading}
                  style={{ marginTop: 16, width: '100%' }}
                />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 20, paddingTop: 16, flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 24 },
  inputSection: {
    backgroundColor: theme.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: theme.border,
  },
  promoCard: {
    backgroundColor: theme.surface, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: theme.primary + '40', marginTop: 16, alignItems: 'center',
  },
  promoTitle: { fontSize: 22, fontWeight: '800', color: theme.primary, marginTop: 8, letterSpacing: 2 },
  promoDesc: { fontSize: 14, color: theme.textSecondary, marginTop: 8, textAlign: 'center' },
  promoCredits: { fontSize: 24, fontWeight: '700', color: theme.primary, marginTop: 8 },
  successCard: {
    backgroundColor: theme.surface, borderRadius: 20, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: theme.primary + '40',
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '700', color: theme.text },
  successDesc: { fontSize: 14, color: theme.textSecondary, marginTop: 8, textAlign: 'center' },
});
