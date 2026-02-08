import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Platform, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '../components/Button';
import { scanApi } from '../api/client';
import { useThemeStore } from '../store/themeStore';
import { useNavStore } from '../store/navStore';
import type { Scan } from '../types';

export default function DetectorScreen() {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Scan | null>(null);

  const isLowContent = (t: string) => {
    const tokens = (t.toLowerCase().match(/[a-z]+/g) || []);
    if (!tokens.length) return true;
    const real = tokens.filter((w) => w.length >= 3);
    return real.length / tokens.length < 0.7;
  };

  const handleDetect = async () => {
    const wc = text.trim().split(/\s+/).filter(Boolean).length;
    if (!text.trim() || wc < 50) {
      Alert.alert('Error', 'Please enter at least 50 words for reliable detection');
      return;
    }
    if (isLowContent(text)) {
      Alert.alert('Low-content input', 'Your text looks like gibberish/low-content. Please provide meaningful text (\u226570% real words).');
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
    if (prob >= 70) return theme.danger;
    if (prob >= 40) return theme.warning;
    return theme.primary;
  };

  const getScoreLabel = (prob: number) => {
    if (prob >= 70) return 'Likely AI-Generated';
    if (prob >= 40) return 'Mixed / Uncertain';
    return 'Likely Human-Written';
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>AI Detector</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Detect if text was written by AI</Text>

        <View style={[styles.inputCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Paste or type your text here..."
            placeholderTextColor={theme.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.wordCount, { color: theme.textMuted }]}>{wordCount} words</Text>
            <Button title="Detect" onPress={handleDetect} loading={loading} size="sm" disabled={wordCount < 50} />
          </View>
        </View>

        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface, borderColor: theme.primary + '30' }]}>
            <Ionicons name="shield-checkmark" size={40} color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.primary }]}>Analyzing text patterns...</Text>
          </View>
        )}

        {result && result.ai_probability !== null && result.ai_probability !== undefined && (
          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>Detection Result</Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: getScoreColor(result.ai_probability) }]}>
                {Number(result.ai_probability).toFixed(2)}%
              </Text>
              <Text style={[styles.scoreSubtext, { color: theme.textMuted }]}>AI Probability</Text>
            </View>
            <View style={[styles.labelBadge, { backgroundColor: getScoreColor(result.ai_probability) + '20' }]}>
              <Text style={[styles.labelText, { color: getScoreColor(result.ai_probability) }]}>
                {getScoreLabel(result.ai_probability)}
              </Text>
            </View>
            {result.confidence_level && (
              <Text style={[styles.confidence, { color: theme.textMuted }]}>Confidence: {result.confidence_level}</Text>
            )}
            <View style={styles.resultActions}>
              <Button
                title="Copy Text"
                onPress={() => {
                  Clipboard.setStringAsync(text);
                  if (Platform.OS === 'android') ToastAndroid.show('Text copied to clipboard', ToastAndroid.SHORT);
                  else Alert.alert('Copied!', 'Input text copied to clipboard');
                }}
                variant="outline"
                size="sm"
              />
              <Button
                title="Humanize Text"
                onPress={() => {
                  useNavStore.getState().setHumanizerText(text);
                  navigation.navigate('HumanizerTab');
                }}
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
  subtitle: { fontSize: 14, marginBottom: 20 },
  inputCard: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16,
  },
  textInput: { fontSize: 15, padding: 16, minHeight: 200, lineHeight: 22 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  wordCount: { fontSize: 12 },
  loadingCard: {
    borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1,
  },
  loadingText: { marginTop: 12, fontSize: 15 },
  resultCard: {
    borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1,
  },
  resultTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  scoreCircle: { alignItems: 'center', marginBottom: 16 },
  scoreValue: { fontSize: 48, fontWeight: '800' },
  scoreSubtext: { fontSize: 13, marginTop: 4 },
  labelBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  labelText: { fontSize: 14, fontWeight: '600' },
  confidence: { fontSize: 13, marginTop: 12 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
});
