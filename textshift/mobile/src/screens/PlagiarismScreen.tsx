import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { scanApi } from '../api/client';
import { useThemeStore } from '../store/themeStore';
import type { Scan } from '../types';

export default function PlagiarismScreen() {
  const { theme } = useThemeStore();
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
    if (score >= 70) return theme.danger;
    if (score >= 50) return theme.warning;
    if (score >= 30) return '#F59E0B';
    return theme.primary;
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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Plagiarism Checker</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Check text against web sources</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Paste text to check for plagiarism..."
            placeholderTextColor={theme.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.wordCount, { color: theme.textMuted }]}>{wordCount} words</Text>
            <Button title="Check" onPress={handleCheck} loading={loading} size="sm" disabled={wordCount < 10} />
          </View>
        </View>

        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface, borderColor: theme.info + '30' }]}>
            <Ionicons name="globe" size={40} color={theme.info} />
            <Text style={[styles.loadingText, { color: theme.info }]}>Scanning web sources...</Text>
          </View>
        )}

        {result && result.plagiarism_score !== null && result.plagiarism_score !== undefined && (
          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>Plagiarism Report</Text>
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
              <Text style={[styles.sourcesCount, { color: theme.textMuted }]}>{result.sources_found} sources found</Text>
            )}

            {sources && sources.length > 0 && (
              <View style={[styles.sourcesSection, { borderTopColor: theme.border }]}>
                <Text style={[styles.sourcesTitle, { color: theme.text }]}>Matching Sources</Text>
                {sources.map((source, idx) => (
                  <View key={idx} style={[styles.sourceItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <View style={styles.sourceHeader}>
                      <Text style={[styles.sourceTitle, { color: theme.text }]} numberOfLines={2}>{source.title || source.url}</Text>
                      <Text style={[styles.sourceSim, { color: getScoreColor(source.similarity * 100) }]}>
                        {Math.round(source.similarity * 100)}%
                      </Text>
                    </View>
                    <Text
                      style={[styles.sourceUrl, { color: theme.info }]}
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
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, marginBottom: 20 },
  inputCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  textInput: { fontSize: 15, padding: 16, minHeight: 200, lineHeight: 22 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  wordCount: { fontSize: 12 },
  loadingCard: { borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1 },
  loadingText: { marginTop: 12, fontSize: 15 },
  resultCard: { borderRadius: 16, padding: 24, borderWidth: 1 },
  resultTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  scoreSection: { alignItems: 'center', marginBottom: 16 },
  scoreValue: { fontSize: 48, fontWeight: '800' },
  riskBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  riskText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  sourcesCount: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  sourcesSection: { borderTopWidth: 1, paddingTop: 16 },
  sourcesTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  sourceItem: { borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  sourceTitle: { flex: 1, fontSize: 14, fontWeight: '500', marginRight: 8 },
  sourceSim: { fontSize: 14, fontWeight: '700' },
  sourceUrl: { fontSize: 12, textDecorationLine: 'underline' },
});
