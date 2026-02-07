import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { scanApi } from '../api/client';
import { colors } from '../theme/colors';
import type { Scan } from '../types';

export default function DetectorScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);

  const handleDetect = async () => {
    if (!text.trim() || text.trim().length < 50) {
      Alert.alert('Error', 'Please enter at least 50 characters');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await scanApi.detectAI(text.trim());
      setResult(data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Detection failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (prob: number) => {
    if (prob >= 0.7) return colors.dark.danger;
    if (prob >= 0.4) return colors.dark.warning;
    return colors.dark.primary;
  };

  const getScoreLabel = (prob: number) => {
    if (prob >= 0.7) return 'Likely AI-Generated';
    if (prob >= 0.4) return 'Mixed / Uncertain';
    return 'Likely Human-Written';
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>AI Detector</Text>
        <Text style={styles.subtitle}>Detect if text was written by AI</Text>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Paste or type your text here..."
            placeholderTextColor={colors.dark.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.wordCount}>{wordCount} words</Text>
            <Button title="Detect" onPress={handleDetect} loading={loading} size="sm" disabled={wordCount < 10} />
          </View>
        </View>

        {loading && (
          <View style={styles.loadingCard}>
            <Ionicons name="shield-checkmark" size={40} color={colors.dark.primary} />
            <Text style={styles.loadingText}>Analyzing text patterns...</Text>
          </View>
        )}

        {result && result.ai_probability !== null && result.ai_probability !== undefined && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Detection Result</Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: getScoreColor(result.ai_probability) }]}>
                {Math.round(result.ai_probability * 100)}%
              </Text>
              <Text style={styles.scoreSubtext}>AI Probability</Text>
            </View>
            <View style={[styles.labelBadge, { backgroundColor: getScoreColor(result.ai_probability) + '20' }]}>
              <Text style={[styles.labelText, { color: getScoreColor(result.ai_probability) }]}>
                {getScoreLabel(result.ai_probability)}
              </Text>
            </View>
            {result.confidence_level && (
              <Text style={styles.confidence}>Confidence: {result.confidence_level}</Text>
            )}
            <Button
              title="Copy Result"
              onPress={() => {
                Clipboard.setStringAsync(`AI Probability: ${Math.round(result.ai_probability! * 100)}% - ${getScoreLabel(result.ai_probability!)}`);
                Alert.alert('Copied!');
              }}
              variant="outline"
              size="sm"
              style={{ marginTop: 12 }}
            />
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
  textInput: {
    color: colors.dark.text, fontSize: 15, padding: 16, minHeight: 200,
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  wordCount: { fontSize: 12, color: colors.dark.textMuted },
  loadingCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: colors.dark.primary + '30',
  },
  loadingText: { color: colors.dark.primary, marginTop: 12, fontSize: 15 },
  resultCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: colors.dark.border,
  },
  resultTitle: { fontSize: 18, fontWeight: '600', color: colors.dark.text, marginBottom: 16 },
  scoreCircle: { alignItems: 'center', marginBottom: 16 },
  scoreValue: { fontSize: 48, fontWeight: '800' },
  scoreSubtext: { fontSize: 13, color: colors.dark.textMuted, marginTop: 4 },
  labelBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  labelText: { fontSize: 14, fontWeight: '600' },
  confidence: { fontSize: 13, color: colors.dark.textMuted, marginTop: 12 },
});
