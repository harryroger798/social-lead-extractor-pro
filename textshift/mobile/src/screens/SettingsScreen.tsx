import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { authApi, userSettingsApi } from '../api/client';
import { useThemeStore } from '../store/themeStore';
import type { ThemeColors } from '../theme/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
}

export default function SettingsScreen({ navigation }: Props) {
  const { theme, mode, toggleTheme } = useThemeStore();
  const styles = getStyles(theme);
  const { user, logout, refreshUser } = useAuthStore();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to change password';
      Alert.alert('Error', message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will permanently delete all your scan history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await userSettingsApi.clearHistory();
              Alert.alert('Success', 'History cleared');
            } catch {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'Type DELETE to confirm',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await userSettingsApi.deleteAccount();
                      await logout();
                    } catch {
                      Alert.alert('Error', 'Failed to delete account');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleToggleNotifications = async (value: boolean) => {
    setEmailNotifications(value);
    try {
      await userSettingsApi.updateSettings({ email_notifications: value });
    } catch {
      setEmailNotifications(!value);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={theme.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={[styles.tierBadge, { backgroundColor: theme.primary + '20' }]}>
              <Text style={styles.tierText}>{user?.subscription_tier || 'Free'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Subscription')}>
            <Ionicons name="card" size={22} color={theme.primary} />
            <Text style={styles.settingText}>Manage Subscription</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowPasswordChange(!showPasswordChange)}>
            <Ionicons name="lock-closed" size={22} color={theme.primary} />
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name={showPasswordChange ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {showPasswordChange && (
            <View style={styles.passwordForm}>
              <TextInput
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                isPassword
              />
              <TextInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
              />
              <TextInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />
              <Button title="Update Password" onPress={handleChangePassword} loading={passwordLoading} size="sm" />
            </View>
          )}

          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('PromoCode')}>
            <Ionicons name="gift" size={22} color={theme.primary} />
            <Text style={styles.settingText}>Redeem Promo Code</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingRow}>
            <Ionicons name="notifications" size={22} color={theme.primary} />
            <Text style={styles.settingText}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.border, true: theme.primary + '40' }}
              thumbColor={emailNotifications ? theme.primary : theme.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={22} color={theme.primary} />
            <Text style={styles.settingText}>{mode === 'dark' ? 'Dark' : 'Light'} Theme</Text>
            <Switch
              value={mode === 'light'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary + '40' }}
              thumbColor={mode === 'light' ? theme.primary : theme.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleClearHistory}>
            <Ionicons name="trash" size={22} color={theme.warning} />
            <Text style={[styles.settingText, { color: theme.warning }]}>Clear Scan History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
            <Ionicons name="close-circle" size={22} color={theme.danger} />
            <Text style={[styles.settingText, { color: theme.danger }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={{ marginTop: 16, borderColor: theme.danger }}
        />

        <Text style={styles.version}>TextShift v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 20 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface,
    borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.border,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: theme.primary + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: theme.text },
  profileEmail: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginTop: 6 },
  tierText: { fontSize: 12, color: theme.primary, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface,
    padding: 16, borderRadius: 14, marginBottom: 4, gap: 12,
    borderWidth: 1, borderColor: theme.border,
  },
  settingText: { flex: 1, fontSize: 15, color: theme.text, fontWeight: '500' },
  passwordForm: {
    backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 4,
    borderWidth: 1, borderColor: theme.border,
  },
  version: { textAlign: 'center', color: theme.textMuted, fontSize: 12, marginTop: 24 },
});
