import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Platform, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { creditsApi } from '../api/client';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const toolCards: { id: 'Detector' | 'Humanizer' | 'Plagiarism' | 'Tools'; icon: keyof typeof Ionicons.glyphMap; color: string; title: string; desc: string }[] = [
  { id: 'Detector', icon: 'shield-checkmark', color: '#10B981', title: 'AI Detector', desc: 'Detect AI-generated text' },
  { id: 'Humanizer', icon: 'sparkles', color: '#8B5CF6', title: 'Humanizer', desc: 'Make AI text human-like' },
  { id: 'Plagiarism', icon: 'search', color: '#3B82F6', title: 'Plagiarism', desc: 'Check for plagiarism' },
  { id: 'Tools', icon: 'construct', color: '#F59E0B', title: 'Writing Tools', desc: '12+ writing tools' },
];

const quickLinks: { id: 'History' | 'Subscription' | 'PromoCode'; icon: keyof typeof Ionicons.glyphMap; title: string; color: string }[] = [
  { id: 'History', icon: 'time', title: 'Scan History', color: '#06B6D4' },
  { id: 'Subscription', icon: 'diamond', title: 'Upgrade Plan', color: '#F59E0B' },
  { id: 'PromoCode', icon: 'gift', title: 'Redeem Promo Code', color: '#EC4899' },
];

export default function HomeScreen({ navigation }: Props) {
  const { user, refreshUser } = useAuthStore();
  const { theme } = useThemeStore();
  const [credits, setCredits] = useState<{ balance: number; tier: string } | null>(null);
  const [stats, setStats] = useState<{ total_scans: number; scans_today: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [bal, usage] = await Promise.all([
        creditsApi.getBalance(),
        creditsApi.getUsageStats(),
      ]);
      setCredits(bal);
      setStats(usage);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshUser()]);
    setRefreshing(false);
  };

  const tier = user?.subscription_tier || 'Free';
  const tierColor = {
    Free: theme.textMuted,
    Starter: theme.primary,
    Pro: theme.purple,
    Enterprise: '#F59E0B',
  }[tier] || theme.textMuted;

  const creditsDisplay = credits?.balance === -1 ? 'Unlimited' : (credits?.balance?.toLocaleString() || '0');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {user?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={[styles.avatarBtn, { backgroundColor: theme.primary + '15' }]}
          >
            <Ionicons name="person" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: tierColor }]} />
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>PLAN</Text>
              <Text style={[styles.statValue, { color: tierColor }]} numberOfLines={1} adjustsFontSizeToFit>
                {tier}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>CREDITS</Text>
              <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {creditsDisplay}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: theme.info }]} />
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>TODAY</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats?.scans_today || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.toolGrid}>
            {toolCards.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: theme.surface }]}
                onPress={() => navigation.navigate(tool.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '15' }]}>
                  <Ionicons name={tool.icon as keyof typeof Ionicons.glyphMap} size={26} color={tool.color} />
                </View>
                <View style={styles.toolTextWrap}>
                  <Text style={[styles.toolTitle, { color: theme.text }]}>{tool.title}</Text>
                  <Text style={[styles.toolDesc, { color: theme.textMuted }]}>{tool.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Links</Text>
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={[styles.linkCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate(link.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: link.color + '15' }]}>
                <Ionicons name={link.icon} size={20} color={link.color} />
              </View>
              <Text style={[styles.linkText, { color: theme.text }]}>{link.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, paddingBottom: 20,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 14 },
  name: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  statsCard: {
    borderRadius: 16, padding: 18, marginBottom: 24,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 6 },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statDivider: { width: 1, height: 36, marginHorizontal: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  toolGrid: { gap: 10 },
  toolCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14,
  },
  toolIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  toolTextWrap: { flex: 1, marginLeft: 14 },
  toolTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  toolDesc: { fontSize: 12 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  linkIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  linkText: { flex: 1, fontSize: 15, marginLeft: 12, fontWeight: '500' },
});
