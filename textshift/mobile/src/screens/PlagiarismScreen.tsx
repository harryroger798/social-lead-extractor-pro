import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { scanApi } from '../api/client';
import { colors } from '../theme/colors';
import type { Scan } from '../types';

export default function PlagiarismScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);

  const handleCheck = async () => {
    if (!text.trim() || text.trim().length < 50) {
      Alert.alert('Error', 'Please enter at least 50 characters');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await scanApi.checkPlagiarism(text.trim());
      setResult(data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Plagiarism check failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return colors.dark.danger;
    if (score >= 50) return colors.dark.warning;
    if (score >= 30) return '#F59E0B';
    return colors.dark.primary;
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'HIGH RISK';
    if (score >= 50) return 'MEDIUM RISK';
    if (score >= 30) return 'LOW RISK';
    return 'MINIMAL RISK';
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const sources = result?.results?.sources as Array<{ url: string; title: string; similarity: number }> | undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Plagiarism Checker</Text>
        <Text style={styles.subtitle}>Check text against web sources</Text>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Paste text to check for plagiarism..."
            placeholderTextColor={colors.dark.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.wordCount}>{wordCount} words</Text>
            <Button title="Check" onPress={handleCheck} loading={loading} size="sm" disabled={wordCount < 10} />
          </View>
        </View>

        {loading && (
          <View style={[styles.loadingCard, { borderColor: colors.dark.info + '30' }]}>
            <Ionicons name="globe" size={40} color={colors.dark.info} />
            <Text style={[styles.loadingText, { color: colors.dark.info }]}>Scanning web sources...</Text>
          </View>
        )}

        {result && result.plagiarism_score !== null && result.plagiarism_score !== undefined && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Plagiarism Report</Text>
            <View style={styles.scoreSection}>
              <Text style={[styles.scoreValue, { color: getScoreColor(result.plagiarism_score) }]}>
                {Math.round(result.plagiarism_score)}%
              </Text>
              <View style={[styles.riskBadge, { backgroundColor: getScoreColor(result.plagiarism_score) + '20' }]}>
                <Text style={[styles.riskText, { color: getScoreColor(result.plagiarism_score) }]}>
                  {getRiskLabel(result.plagiarism_score)}
                </Text>
              </View>
            </View>

            {result.sources_found !== null && result.sources_found !== undefined && (
              <Text style={styles.sourcesCount}>{result.sources_found} sources found</Text>
            )}

            {sources && sources.length > 0 && (
              <View style={styles.sourcesSection}>
                <Text style={styles.sourcesTitle}>Matching Sources</Text>
                {sources.map((source, idx) => (
                  <View key={idx} style={styles.sourceItem}>
                    <View style={styles.sourceHeader}>
                      <Text style={styles.sourceTitle} numberOfLines={2}>{source.title || source.url}</Text>
                      <Text style={[styles.sourceSim, { color: getScoreColor(source.similarity * 100) }]}>
                        {Math.round(source.similarity * 100)}%
                      </Text>
                    </View>
                    <Text
                      style={styles.sourceUrl}
                      onPress={() => Linking.openURL(source.url)}
                      numberOfLines={1}
                    >
                      {source.url}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.dark.text },
  subtitle: { fontSize: 14, color: colors.dark.textSecondary, marginBottom: 20 },
  inputCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, borderWidth: 1,
    borderColor: colors.dark.border, overflow: 'hidden', marginBottom: 16,
  },
  textInput: { color: colors.dark.text, fontSize: 15, padding: 16, minHeight: 200, lineHeight: 22 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  wordCount: { fontSize: 12, color: colors.dark.textMuted },
  loadingCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 32,
    alignItems: 'center', borderWidth: 1,
  },
  loadingText: { marginTop: 12, fontSize: 15 },
  resultCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: colors.dark.border,
  },
  resultTitle: { fontSize: 18, fontWeight: '600', color: colors.dark.text, marginBottom: 16, textAlign: 'center' },
  scoreSection: { alignItems: 'center', marginBottom: 16 },
  scoreValue: { fontSize: 48, fontWeight: '800' },
  riskBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  riskText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  sourcesCount: { fontSize: 13, color: colors.dark.textMuted, textAlign: 'center', marginBottom: 16 },
  sourcesSection: { borderTopWidth: 1, borderTopColor: colors.dark.border, paddingTop: 16 },
  sourcesTitle: { fontSize: 15, fontWeight: '600', color: colors.dark.text, marginBottom: 12 },
  sourceItem: {
    backgroundColor: colors.dark.background, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: colors.dark.border,
  },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  sourceTitle: { flex: 1, fontSize: 14, color: colors.dark.text, fontWeight: '500', marginRight: 8 },
  sourceSim: { fontSize: 14, fontWeight: '700' },
  sourceUrl: { fontSize: 12, color: colors.dark.info, textDecorationLine: 'underline' },
});
