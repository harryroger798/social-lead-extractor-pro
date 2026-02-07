import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { scanApi } from '../api/client';
import { colors } from '../theme/colors';
import type { Scan } from '../types';

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  ai_detection: { icon: 'shield-checkmark', color: '#10B981', label: 'AI Detection' },
  humanize: { icon: 'sparkles', color: '#8B5CF6', label: 'Humanizer' },
  plagiarism: { icon: 'search', color: '#3B82F6', label: 'Plagiarism' },
};

const filterOptions = [
  { value: '', label: 'All' },
  { value: 'ai_detection', label: 'Detection' },
  { value: 'humanize', label: 'Humanize' },
  { value: 'plagiarism', label: 'Plagiarism' },
];

export default function HistoryScreen() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const loadScans = useCallback(async (p = 1, refresh = false) => {
    try {
      const data = await scanApi.getHistory(p, 20, filter || undefined);
      if (refresh || p === 1) {
        setScans(data.scans);
      } else {
        setScans((prev) => [...prev, ...data.scans]);
      }
      setTotal(data.total);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadScans(1, true);
  }, [loadScans]);

  const onRefresh = () => {
    setRefreshing(true);
    loadScans(1, true);
  };

  const loadMore = () => {
    if (scans.length < total) {
      loadScans(page + 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderScan = ({ item }: { item: Scan }) => {
    const config = typeConfig[item.scan_type] || typeConfig.ai_detection;
    const isExpanded = expanded === item.id;

    return (
      <TouchableOpacity
        style={styles.scanCard}
        onPress={() => setExpanded(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.scanHeader}>
          <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={18} color={config.color} />
          </View>
          <View style={styles.scanInfo}>
            <Text style={styles.scanType}>{config.label}</Text>
            <Text style={styles.scanDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.scanMeta}>
            {item.scan_type === 'ai_detection' && item.ai_probability !== null && (
              <Text style={[styles.scanScore, { color: item.ai_probability >= 0.7 ? colors.dark.danger : colors.dark.primary }]}>
                {Math.round(item.ai_probability * 100)}% AI
              </Text>
            )}
            {item.scan_type === 'plagiarism' && item.plagiarism_score !== null && (
              <Text style={[styles.scanScore, { color: item.plagiarism_score >= 50 ? colors.dark.danger : colors.dark.primary }]}>
                {Math.round(item.plagiarism_score)}% match
              </Text>
            )}
            {item.scan_type === 'humanize' && (
              <Text style={[styles.scanScore, { color: colors.dark.purple }]}>Done</Text>
            )}
          </View>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.dark.textMuted} />
        </View>

        {isExpanded && (
          <View style={styles.scanExpanded}>
            <Text style={styles.expandLabel}>Input:</Text>
            <Text style={styles.expandText} numberOfLines={5}>{item.input_text}</Text>
            {item.output_text && (
              <>
                <Text style={styles.expandLabel}>Output:</Text>
                <Text style={styles.expandText} numberOfLines={5}>{item.output_text}</Text>
              </>
            )}
            <View style={styles.expandActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  Clipboard.setStringAsync(item.output_text || item.input_text);
                  Alert.alert('Copied!');
                }}
              >
                <Ionicons name="copy" size={16} color={colors.dark.primary} />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
              <Text style={styles.creditsUsed}>{item.credits_used} credits</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.totalText}>{total} scans</Text>
      </View>

      <View style={styles.filterRow}>
        {filterOptions.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={scans}
        renderItem={renderScan}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.dark.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={48} color={colors.dark.textMuted} />
              <Text style={styles.emptyText}>No scan history yet</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.dark.text },
  totalText: { fontSize: 13, color: colors.dark.textMuted },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.dark.surface, borderWidth: 1, borderColor: colors.dark.border,
  },
  filterActive: { backgroundColor: colors.dark.primary + '20', borderColor: colors.dark.primary },
  filterText: { fontSize: 13, color: colors.dark.textSecondary },
  filterTextActive: { color: colors.dark.primary, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  scanCard: {
    backgroundColor: colors.dark.surface, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.dark.border, overflow: 'hidden',
  },
  scanHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  typeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scanInfo: { flex: 1 },
  scanType: { fontSize: 14, fontWeight: '600', color: colors.dark.text },
  scanDate: { fontSize: 11, color: colors.dark.textMuted, marginTop: 2 },
  scanMeta: { marginRight: 4 },
  scanScore: { fontSize: 13, fontWeight: '700' },
  scanExpanded: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.dark.border },
  expandLabel: { fontSize: 12, fontWeight: '600', color: colors.dark.textSecondary, marginTop: 10, marginBottom: 4 },
  expandText: { fontSize: 13, color: colors.dark.text, lineHeight: 20 },
  expandActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: colors.dark.primary, fontSize: 13, fontWeight: '500' },
  creditsUsed: { fontSize: 12, color: colors.dark.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.dark.textMuted, fontSize: 15, marginTop: 12 },
});
