import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { scanApi } from '../api/client';
import { colors } from '../theme/colors';
import type { Scan } from '../types';

export default function HumanizerScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);
  const [sentenceMode, setSentenceMode] = useState(false);
  const [preservedIndices, setPreservedIndices] = useState<Set<number>>(new Set());

  const sentences = useMemo(() => {
    if (!text.trim()) return [];
    return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [text.trim()];
  }, [text]);

  const toggleSentence = (index: number) => {
    setPreservedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleHumanize = async () => {
    if (!text.trim() || text.trim().length < 50) {
      Alert.alert('Error', 'Please enter at least 50 characters');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const indices = sentenceMode ? Array.from(preservedIndices) : undefined;
      const data = await scanApi.humanize(text.trim(), indices);
      setResult(data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Humanization failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>AI Humanizer</Text>
        <Text style={styles.subtitle}>Transform AI text to sound natural</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, sentenceMode && styles.toggleActive]}
            onPress={() => setSentenceMode(!sentenceMode)}
          >
            <Ionicons name={sentenceMode ? 'toggle' : 'toggle-outline'} size={20} color={sentenceMode ? colors.dark.primary : colors.dark.textMuted} />
            <Text style={[styles.toggleText, sentenceMode && styles.toggleTextActive]}>
              Sentence Mode {sentenceMode ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {sentenceMode && sentences.length > 0 ? (
          <View style={styles.inputCard}>
            <Text style={styles.sentenceHint}>Tap sentences to preserve them (won't be humanized)</Text>
            {sentences.map((sentence, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.sentenceItem, preservedIndices.has(idx) && styles.sentencePreserved]}
                onPress={() => toggleSentence(idx)}
              >
                <Ionicons
                  name={preservedIndices.has(idx) ? 'lock-closed' : 'lock-open'}
                  size={16}
                  color={preservedIndices.has(idx) ? colors.dark.warning : colors.dark.textMuted}
                />
                <Text style={[styles.sentenceText, preservedIndices.has(idx) && styles.sentencePreservedText]}>
                  {sentence}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.inputFooter}>
              <Text style={styles.wordCount}>{preservedIndices.size} preserved</Text>
              <Button title="Humanize" onPress={handleHumanize} loading={loading} size="sm" disabled={wordCount < 10} />
            </View>
          </View>
        ) : (
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Paste your AI-generated text here..."
              placeholderTextColor={colors.dark.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.inputFooter}>
              <Text style={styles.wordCount}>{wordCount} words</Text>
              <Button title="Humanize" onPress={handleHumanize} loading={loading} size="sm" disabled={wordCount < 10} />
            </View>
          </View>
        )}

        {loading && (
          <View style={[styles.loadingCard, { borderColor: colors.dark.purple + '30' }]}>
            <Ionicons name="sparkles" size={40} color={colors.dark.purple} />
            <Text style={[styles.loadingText, { color: colors.dark.purple }]}>Humanizing your text...</Text>
          </View>
        )}

        {result && result.output_text && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Humanized Text</Text>
            <Text style={styles.resultText}>{result.output_text}</Text>
            <View style={styles.resultActions}>
              <Button
                title="Copy"
                onPress={() => {
                  Clipboard.setStringAsync(result.output_text || '');
                  Alert.alert('Copied!');
                }}
                variant="outline"
                size="sm"
              />
              <Button
                title="Re-detect"
                onPress={() => {
                  setText(result.output_text || '');
                  setResult(null);
                }}
                variant="secondary"
                size="sm"
              />
            </View>
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
  subtitle: { fontSize: 14, color: colors.dark.textSecondary, marginBottom: 16 },
  toggleRow: { marginBottom: 12 },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dark.surface,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: colors.dark.border, gap: 8,
  },
  toggleActive: { borderColor: colors.dark.primary },
  toggleText: { fontSize: 14, color: colors.dark.textMuted },
  toggleTextActive: { color: colors.dark.primary },
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
  sentenceHint: { fontSize: 12, color: colors.dark.textMuted, padding: 12, paddingBottom: 4 },
  sentenceItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.dark.border, gap: 8,
  },
  sentencePreserved: { backgroundColor: colors.dark.warning + '10' },
  sentenceText: { flex: 1, fontSize: 14, color: colors.dark.text, lineHeight: 20 },
  sentencePreservedText: { color: colors.dark.warning },
  loadingCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 32,
    alignItems: 'center', borderWidth: 1,
  },
  loadingText: { marginTop: 12, fontSize: 15 },
  resultCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.dark.border,
  },
  resultTitle: { fontSize: 18, fontWeight: '600', color: colors.dark.text, marginBottom: 12 },
  resultText: { fontSize: 15, color: colors.dark.text, lineHeight: 24, marginBottom: 16 },
  resultActions: { flexDirection: 'row', gap: 12 },
});
