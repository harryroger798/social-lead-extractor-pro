import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

  const tierColor = {
    Free: theme.textMuted,
    Starter: theme.primary,
    Pro: theme.purple,
    Enterprise: '#F59E0B',
  }[user?.subscription_tier || 'Free'] || theme.textMuted;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: theme.text }]}>{user?.full_name || user?.email?.split('@')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.avatarBtn}>
            <Ionicons name="person-circle" size={40} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: tierColor }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Plan</Text>
            <Text style={[styles.statValue, { color: tierColor }]}>{user?.subscription_tier || 'Free'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Credits</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {credits?.balance === -1 ? 'Unlimited' : (credits?.balance?.toLocaleString() || '0')}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Scans Today</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats?.scans_today || 0}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.toolGrid}>
            {toolCards.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => navigation.navigate(tool.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                  <Ionicons name={tool.icon as keyof typeof Ionicons.glyphMap} size={28} color={tool.color} />
                </View>
                <Text style={[styles.toolTitle, { color: theme.text }]}>{tool.title}</Text>
                <Text style={[styles.toolDesc, { color: theme.textMuted }]}>{tool.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Links</Text>
          <TouchableOpacity style={[styles.linkCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('History')}>
            <Ionicons name="time" size={22} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.text }]}>Scan History</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('Subscription')}>
            <Ionicons name="card" size={22} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.text }]}>Upgrade Plan</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('PromoCode')}>
            <Ionicons name="gift" size={22} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.text }]}>Redeem Promo Code</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  greeting: { fontSize: 14 },
  name: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  avatarBtn: { padding: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16,
    borderWidth: 1, alignItems: 'center',
  },
  statLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard: {
    width: '48%', borderRadius: 16, padding: 16,
    borderWidth: 1,
  },
  toolIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  toolTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  toolDesc: { fontSize: 12 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1,
  },
  linkText: { flex: 1, fontSize: 15, marginLeft: 12, fontWeight: '500' },
});
