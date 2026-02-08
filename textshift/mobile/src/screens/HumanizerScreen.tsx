import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity, Platform, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '../components/Button';
import { scanApi } from '../api/client';
import { useThemeStore } from '../store/themeStore';
import { useNavStore } from '../store/navStore';
import type { Scan } from '../types';

export default function HumanizerScreen() {
  const { theme } = useThemeStore();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);
  const [sentenceMode, setSentenceMode] = useState(false);
  const [preservedIndices, setPreservedIndices] = useState<Set<number>>(new Set());

  const humanizerText = useNavStore((s) => s.humanizerText);

  useEffect(() => {
    if (humanizerText) {
      setText(humanizerText);
      setResult(null);
      useNavStore.getState().setHumanizerText(null);
    }
  }, [humanizerText]);

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

  const isLowContent = (t: string) => {
    const tokens = (t.toLowerCase().match(/[a-z]+/g) || []);
    if (!tokens.length) return true;
    const real = tokens.filter((w) => w.length >= 3);
    return real.length / tokens.length < 0.7;
  };

  const handleHumanize = async () => {
    if (!text.trim() || text.trim().length < 50) {
      Alert.alert('Error', 'Please enter at least 50 characters');
      return;
    }
    if (isLowContent(text)) {
      Alert.alert('Low-content input', 'Your text looks like gibberish/low-content. Please provide meaningful sentences (≥70% real words).');
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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>AI Humanizer</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Transform AI text to sound natural</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: theme.surface, borderColor: theme.border }, sentenceMode && { borderColor: theme.primary }]}
            onPress={() => setSentenceMode(!sentenceMode)}
          >
            <Ionicons name={sentenceMode ? 'toggle' : 'toggle-outline'} size={20} color={sentenceMode ? theme.primary : theme.textMuted} />
            <Text style={[styles.toggleText, { color: sentenceMode ? theme.primary : theme.textMuted }]}>
              Sentence Mode {sentenceMode ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {sentenceMode && sentences.length > 0 ? (
          <View style={[styles.inputCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sentenceHint, { color: theme.textMuted }]}>Tap sentences to preserve them (won't be humanized)</Text>
            {sentences.map((sentence, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.sentenceItem, { borderBottomColor: theme.border }, preservedIndices.has(idx) && { backgroundColor: theme.warning + '10' }]}
                onPress={() => toggleSentence(idx)}
              >
                <Ionicons
                  name={preservedIndices.has(idx) ? 'lock-closed' : 'lock-open'}
                  size={16}
                  color={preservedIndices.has(idx) ? theme.warning : theme.textMuted}
                />
                <Text style={[styles.sentenceText, { color: theme.text }, preservedIndices.has(idx) && { color: theme.warning }]}>
                  {sentence}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.inputFooter}>
              <Text style={[styles.wordCount, { color: theme.textMuted }]}>{preservedIndices.size} preserved</Text>
              <Button title="Humanize" onPress={handleHumanize} loading={loading} size="sm" disabled={wordCount < 10} />
            </View>
          </View>
        ) : (
          <View style={[styles.inputCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder="Paste your AI-generated text here..."
              placeholderTextColor={theme.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.inputFooter}>
              <Text style={[styles.wordCount, { color: theme.textMuted }]}>{wordCount} words</Text>
              <Button title="Humanize" onPress={handleHumanize} loading={loading} size="sm" disabled={wordCount < 10} />
            </View>
          </View>
        )}

        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface, borderColor: theme.purple + '30' }]}>
            <Ionicons name="sparkles" size={40} color={theme.purple} />
            <Text style={[styles.loadingText, { color: theme.purple }]}>Humanizing your text...</Text>
          </View>
        )}

        {result && result.output_text && (
          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>Humanized Text</Text>
            <Text style={[styles.resultText, { color: theme.text }]}>{result.output_text}</Text>
            <View style={styles.resultActions}>
              <Button
                title="Copy"
                onPress={() => {
                  Clipboard.setStringAsync(result.output_text || '');
                  if (Platform.OS === 'android') ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
                  else Alert.alert('Copied!');
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
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 14, marginBottom: 16 },
  toggleRow: { marginBottom: 12 },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start',
    borderWidth: 1, gap: 8,
  },
  toggleText: { fontSize: 14 },
  inputCard: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16,
  },
  textInput: { fontSize: 15, padding: 16, minHeight: 200, lineHeight: 22 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  wordCount: { fontSize: 12 },
  sentenceHint: { fontSize: 12, padding: 12, paddingBottom: 4 },
  sentenceItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, gap: 8,
  },
  sentenceText: { flex: 1, fontSize: 14, lineHeight: 20 },
  loadingCard: {
    borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1,
  },
  loadingText: { marginTop: 12, fontSize: 15 },
  resultCard: {
    borderRadius: 16, padding: 20, borderWidth: 1,
  },
  resultTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  resultText: { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  resultActions: { flexDirection: 'row', gap: 12 },
});
