import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { paymentApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { ThemeColors } from '../theme/colors';
import type { PricingPlan, RegionInfo } from '../types';

export default function SubscriptionScreen() {
  const { theme } = useThemeStore();
  const styles = getStyles(theme);
  const { user, refreshUser } = useAuthStore();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [region, setRegion] = useState<RegionInfo | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [billingCycle]);

  const loadData = async () => {
    setLoading(true);
    try {
      const regionData = await paymentApi.detectRegion();
      setRegion(regionData);
      const plansData = await paymentApi.getPlans(billingCycle, regionData.country_code);
      setPlans(plansData.plans || []);
    } catch {
      try {
        const plansData = await paymentApi.getPlans(billingCycle);
        setPlans(plansData.plans || []);
      } catch {
        Alert.alert('Error', 'Failed to load pricing plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    setPurchasing(plan.id);
    try {
      const country = region?.country_code || '';
      const order = await paymentApi.createOrder(plan.id, billingCycle, country);

      if (order.approval_url) {
        await Linking.openURL(order.approval_url);
        Alert.alert(
          'Complete Payment',
          'After completing payment in the browser, come back and pull to refresh to see your updated subscription.',
          [{ text: 'OK', onPress: () => refreshUser() }]
        );
      } else {
        Alert.alert('Error', 'Failed to create payment order');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Payment failed';
      Alert.alert('Error', message);
    } finally {
      setPurchasing(null);
    }
  };

  const symbol = region?.symbol || '$';
  const isIndia = region?.country_code === 'IN';

  const tierColors: Record<string, string> = {
    starter: theme.primary,
    pro: theme.purple,
    enterprise: '#F59E0B',
  };

  const tierFeatures: Record<string, string[]> = {
    starter: [
      '1,000 credits/month',
      'AI Detection',
      'AI Humanizer',
      'Plagiarism Checker',
      'Basic Writing Tools',
      'Email Support',
    ],
    pro: [
      '5,000 credits/month',
      'All Starter features',
      'Advanced Writing Tools',
      'Unlimited scans',
      'Priority Processing',
      'Priority Support',
    ],
    enterprise: [
      'Unlimited credits',
      'All Pro features',
      'API Access',
      'Bulk Processing',
      'Custom Integrations',
      'Dedicated Support',
    ],
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Upgrade Your Plan</Text>
        <Text style={styles.subtitle}>
          Current: <Text style={{ color: theme.primary, fontWeight: '600' }}>{user?.subscription_tier || 'Free'}</Text>
          {isIndia && <Text style={styles.regionBadge}> (India pricing)</Text>}
        </Text>

        <View style={styles.cycleToggle}>
          <TouchableOpacity
            style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text style={[styles.cycleText, billingCycle === 'monthly' && styles.cycleTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cycleBtn, billingCycle === 'yearly' && styles.cycleBtnActive]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text style={[styles.cycleText, billingCycle === 'yearly' && styles.cycleTextActive]}>Yearly</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 17%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {plans.map((plan) => {
          const planKey = plan.id.toLowerCase().replace(/_.*/, '');
          const tierColor = tierColors[planKey] || theme.primary;
          const features = tierFeatures[planKey] || [];
          const isCurrentTier = user?.subscription_tier?.toLowerCase() === planKey;

          return (
            <View key={plan.id} style={[styles.planCard, { borderColor: tierColor + '40' }]}>
              <View style={[styles.planHeader, { backgroundColor: tierColor + '10' }]}>
                <Text style={[styles.planName, { color: tierColor }]}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceSymbol}>{symbol}</Text>
                  <Text style={styles.priceValue}>{plan.price.toLocaleString()}</Text>
                  <Text style={styles.pricePeriod}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
                </View>
                {billingCycle === 'yearly' && plan.monthly_equivalent && (
                  <Text style={styles.monthlyEquiv}>{symbol}{plan.monthly_equivalent.toLocaleString()}/mo equivalent</Text>
                )}
              </View>

              <View style={styles.planBody}>
                {features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={tierColor} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.planFooter}>
                {isCurrentTier ? (
                  <Button title="Current Plan" onPress={() => {}} variant="secondary" disabled />
                ) : (
                  <Button
                    title={purchasing === plan.id ? 'Processing...' : `Subscribe to ${plan.name}`}
                    onPress={() => handleSubscribe(plan)}
                    loading={purchasing === plan.id}
                    disabled={purchasing !== null}
                    style={{ backgroundColor: tierColor }}
                  />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 20 },
  regionBadge: { color: theme.warning, fontSize: 12 },
  cycleToggle: {
    flexDirection: 'row', backgroundColor: theme.surface, borderRadius: 14,
    padding: 4, marginBottom: 20, borderWidth: 1, borderColor: theme.border,
  },
  cycleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  cycleBtnActive: { backgroundColor: theme.primary },
  cycleText: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
  cycleTextActive: { color: '#FFF', fontWeight: '600' },
  saveBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveText: { fontSize: 10, color: '#FFF', fontWeight: '700' },
  planCard: {
    backgroundColor: theme.surface, borderRadius: 20, marginBottom: 16,
    borderWidth: 1, overflow: 'hidden',
  },
  planHeader: { padding: 20, alignItems: 'center' },
  planName: { fontSize: 20, fontWeight: '700', marginBottom: 8, textTransform: 'capitalize' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  priceSymbol: { fontSize: 18, fontWeight: '600', color: theme.text, marginTop: 4 },
  priceValue: { fontSize: 42, fontWeight: '800', color: theme.text },
  pricePeriod: { fontSize: 14, color: theme.textMuted, marginTop: 24 },
  monthlyEquiv: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  planBody: { padding: 20, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: theme.text, flex: 1 },
  planFooter: { paddingHorizontal: 20, paddingBottom: 20 },
});
