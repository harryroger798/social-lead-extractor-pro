import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { toolsApi } from '../api/client';
import { colors } from '../theme/colors';

type ToolId = 'grammar' | 'summarize' | 'paraphrase' | 'translate' | 'readability' | 'tone' | 'word_count' | 'style' | 'improve' | 'citation' | 'export';

const toolsList: { id: ToolId; name: string; icon: string; color: string; desc: string }[] = [
  { id: 'grammar', name: 'Grammar Check', icon: 'checkmark-circle', color: '#10B981', desc: 'Fix grammar errors' },
  { id: 'summarize', name: 'Summarize', icon: 'document-text', color: '#F59E0B', desc: 'Summarize long text' },
  { id: 'paraphrase', name: 'Paraphrase', icon: 'repeat', color: '#06B6D4', desc: 'Rewrite content' },
  { id: 'translate', name: 'Translate', icon: 'language', color: '#EF4444', desc: 'Translate text' },
  { id: 'readability', name: 'Readability', icon: 'book', color: '#3B82F6', desc: 'Analyze readability' },
  { id: 'tone', name: 'Tone Detect', icon: 'volume-high', color: '#8B5CF6', desc: 'Detect writing tone' },
  { id: 'word_count', name: 'Word Count', icon: 'text', color: '#6B7280', desc: 'Count words & chars' },
  { id: 'style', name: 'Style Analysis', icon: 'brush', color: '#6366F1', desc: 'Analyze writing style' },
  { id: 'improve', name: 'Content Improve', icon: 'sparkles', color: '#EC4899', desc: 'Enhance content' },
  { id: 'citation', name: 'Citation Gen', icon: 'bookmark', color: '#F97316', desc: 'Generate citations' },
  { id: 'export', name: 'Export', icon: 'download', color: '#14B8A6', desc: 'Export to formats' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
];

const paraphraseModes = ['standard', 'fluency', 'creative', 'formal', 'simple'];

export default function ToolsScreen() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<Record<string, unknown> | null>(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [paraphraseMode, setParaphraseMode] = useState('standard');

  const handleRun = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    setLoading(true);
    setResultData(null);
    try {
      let data: Record<string, unknown>;
      switch (activeTool) {
        case 'grammar': data = await toolsApi.grammar(text.trim()); break;
        case 'summarize': data = await toolsApi.summarize(text.trim()); break;
        case 'paraphrase': data = await toolsApi.paraphrase(text.trim(), paraphraseMode); break;
        case 'translate': data = await toolsApi.translate(text.trim(), sourceLang, targetLang); break;
        case 'readability': data = await toolsApi.readability(text.trim(), true); break;
        case 'tone': data = await toolsApi.toneDetect(text.trim()); break;
        case 'word_count': data = await toolsApi.wordCount(text.trim()); break;
        case 'style': data = await toolsApi.styleAnalysis(text.trim()); break;
        case 'improve': data = await toolsApi.contentImprove(text.trim()); break;
        case 'citation': data = await toolsApi.citation(text.trim()); break;
        case 'export': data = await toolsApi.exportText(text.trim(), 'markdown'); break;
        default: return;
      }
      setResultData(data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Operation failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const getOutputText = (): string => {
    if (!resultData) return '';
    const r = resultData as Record<string, string | number | boolean | null>;
    if (r.corrected_text) return String(r.corrected_text);
    if (r.summary) return String(r.summary);
    if (r.paraphrased_text) return String(r.paraphrased_text);
    if (r.translated_text) return String(r.translated_text);
    if (r.adjusted_text) return String(r.adjusted_text);
    if (r.improved_text) return String(r.improved_text);
    if (r.citation) return String(r.citation);
    if (r.content) return String(r.content);
    return '';
  };

  const getStatsText = (): string[] => {
    if (!resultData) return [];
    const lines: string[] = [];
    const r = resultData as Record<string, unknown>;
    if (r.word_count !== undefined) lines.push(`Words: ${r.word_count}`);
    if (r.character_count !== undefined) lines.push(`Characters: ${r.character_count}`);
    if (r.sentence_count !== undefined) lines.push(`Sentences: ${r.sentence_count}`);
    if (r.reading_time_minutes !== undefined) lines.push(`Reading time: ${Number(r.reading_time_minutes).toFixed(1)} min`);
    if (r.flesch_reading_ease !== undefined) lines.push(`Flesch Score: ${Number(r.flesch_reading_ease).toFixed(1)}`);
    if (r.reading_level) lines.push(`Reading Level: ${r.reading_level}`);
    if (r.primary_tone) lines.push(`Tone: ${r.primary_tone}`);
    if (r.primary_confidence !== undefined) lines.push(`Confidence: ${(Number(r.primary_confidence) * 100).toFixed(0)}%`);
    if (r.style_type) lines.push(`Style: ${r.style_type}`);
    if (r.vocabulary_level) lines.push(`Vocabulary: ${r.vocabulary_level}`);
    if (r.error_count !== undefined) lines.push(`Errors found: ${r.error_count}`);
    if (r.compression_ratio !== undefined) lines.push(`Compression: ${(Number(r.compression_ratio) * 100).toFixed(0)}%`);
    return lines;
  };

  if (!activeTool) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Writing Tools</Text>
          <Text style={styles.subtitle}>12+ tools to enhance your writing</Text>
          <View style={styles.toolGrid}>
            {toolsList.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => { setActiveTool(tool.id); setResultData(null); setText(''); }}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                  <Ionicons name={tool.icon as keyof typeof Ionicons.glyphMap} size={24} color={tool.color} />
                </View>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentTool = toolsList.find((t) => t.id === activeTool);
  const outputText = getOutputText();
  const statsLines = getStatsText();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setActiveTool(null)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.dark.primary} />
          <Text style={styles.backText}>All Tools</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{currentTool?.name}</Text>

        {activeTool === 'translate' && (
          <View style={styles.langRow}>
            <View style={styles.langPicker}>
              <Text style={styles.langLabel}>From</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {languages.map((l) => (
                  <TouchableOpacity
                    key={l.code}
                    style={[styles.langChip, sourceLang === l.code && styles.langChipActive]}
                    onPress={() => setSourceLang(l.code)}
                  >
                    <Text style={[styles.langChipText, sourceLang === l.code && styles.langChipTextActive]}>{l.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.langPicker}>
              <Text style={styles.langLabel}>To</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {languages.map((l) => (
                  <TouchableOpacity
                    key={l.code}
                    style={[styles.langChip, targetLang === l.code && styles.langChipActive]}
                    onPress={() => setTargetLang(l.code)}
                  >
                    <Text style={[styles.langChipText, targetLang === l.code && styles.langChipTextActive]}>{l.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {activeTool === 'paraphrase' && (
          <View style={styles.modeRow}>
            <Text style={styles.langLabel}>Mode</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {paraphraseModes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.langChip, paraphraseMode === m && styles.langChipActive]}
                  onPress={() => setParaphraseMode(m)}
                >
                  <Text style={[styles.langChipText, paraphraseMode === m && styles.langChipTextActive]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder={`Enter text for ${currentTool?.name?.toLowerCase()}...`}
            placeholderTextColor={colors.dark.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.wordCount}>{text.trim().split(/\s+/).filter(Boolean).length} words</Text>
            <Button title="Run" onPress={handleRun} loading={loading} size="sm" disabled={!text.trim()} />
          </View>
        </View>

        {statsLines.length > 0 && (
          <View style={styles.statsCard}>
            {statsLines.map((line, i) => (
              <View key={i} style={styles.statRow}>
                <Text style={styles.statText}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {outputText.length > 0 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Result</Text>
            <Text style={styles.resultText}>{outputText}</Text>
            <Button
              title="Copy"
              onPress={() => { Clipboard.setStringAsync(outputText); Alert.alert('Copied!'); }}
              variant="outline"
              size="sm"
              style={{ alignSelf: 'flex-start', marginTop: 12 }}
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
  title: { fontSize: 28, fontWeight: '700', color: colors.dark.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.dark.textSecondary, marginBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  backText: { color: colors.dark.primary, fontSize: 15, fontWeight: '500' },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard: {
    width: '47%', backgroundColor: colors.dark.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.dark.border,
  },
  toolIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  toolName: { fontSize: 15, fontWeight: '600', color: colors.dark.text, marginBottom: 2 },
  toolDesc: { fontSize: 12, color: colors.dark.textMuted },
  inputCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, borderWidth: 1,
    borderColor: colors.dark.border, overflow: 'hidden', marginBottom: 16,
  },
  textInput: { color: colors.dark.text, fontSize: 15, padding: 16, minHeight: 160, lineHeight: 22 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  wordCount: { fontSize: 12, color: colors.dark.textMuted },
  langRow: { marginBottom: 16, gap: 12 },
  langPicker: { gap: 6 },
  langLabel: { fontSize: 13, color: colors.dark.textSecondary, fontWeight: '500', marginBottom: 4 },
  langChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: colors.dark.surface, borderWidth: 1, borderColor: colors.dark.border,
  },
  langChipActive: { backgroundColor: colors.dark.primary + '20', borderColor: colors.dark.primary },
  langChipText: { fontSize: 13, color: colors.dark.textSecondary },
  langChipTextActive: { color: colors.dark.primary, fontWeight: '600' },
  modeRow: { marginBottom: 16 },
  statsCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: colors.dark.border,
  },
  statRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.dark.border },
  statText: { fontSize: 14, color: colors.dark.text },
  resultCard: {
    backgroundColor: colors.dark.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.dark.border,
  },
  resultTitle: { fontSize: 18, fontWeight: '600', color: colors.dark.text, marginBottom: 12 },
  resultText: { fontSize: 15, color: colors.dark.text, lineHeight: 24 },
});
