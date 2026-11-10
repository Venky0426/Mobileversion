import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Volume2, Vibrate, Eye, MessageSquare, VolumeX, UserX, ArrowLeft, Check, Shield } from 'lucide-react-native';
import { auth, db } from '../firebase';
import {
  getNotificationSettings,
  saveNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS
} from '../services/notificationService';

export default function NotificationSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const data = await getNotificationSettings(auth.currentUser.uid);
      setSettings(data);
    } catch (err) {
      console.error('Error loading notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    if (!auth.currentUser) return;
    const updated = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(updated);

    try {
      setSaving(true);
      await saveNotificationSettings(auth.currentUser.uid, updated);
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      setSettings(settings); // rollback
    } finally {
      setSaving(false);
    }
  };

  const handleUnmute = async (conversationId) => {
    if (!auth.currentUser) return;
    const updatedMuted = (settings.mutedConversations || []).filter(id => id !== conversationId);
    const updated = { ...settings, mutedConversations: updatedMuted };
    setSettings(updated);

    try {
      await saveNotificationSettings(auth.currentUser.uid, updated);
    } catch (err) {
      Alert.alert('Error', 'Failed to unmute conversation.');
      loadSettings();
    }
  };

  const handleUnblock = async (userId) => {
    if (!auth.currentUser) return;
    const updatedBlocked = (settings.blockedUsers || []).filter(id => id !== userId);
    const updated = { ...settings, blockedUsers: updatedBlocked };
    setSettings(updated);

    try {
      await saveNotificationSettings(auth.currentUser.uid, updated);
    } catch (err) {
      Alert.alert('Error', 'Failed to unblock user.');
      loadSettings();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a66c2" />
        <Text style={styles.loadingText}>Loading notification preferences...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Top Header if not in Stack header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        {saving ? <ActivityIndicator size="small" color="#0a66c2" /> : <View style={{ width: 24 }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Master Toggle */}
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Bell size={20} color="#0a66c2" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Allow Notifications</Text>
              <Text style={styles.rowSubtitle}>Master switch for all push and in-app alerts</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={() => handleToggle('notificationsEnabled')}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={settings.notificationsEnabled ? '#0a66c2' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Message Alert Preferences */}
        <Text style={styles.sectionHeader}>MESSAGE PREFERENCES</Text>
        <View style={[styles.sectionCard, !settings.notificationsEnabled && styles.disabledSection]}>
          
          {/* Message Notifications */}
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MessageSquare size={20} color="#0a66c2" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Message Notifications</Text>
              <Text style={styles.rowSubtitle}>Receive alerts when you receive a message</Text>
            </View>
            <Switch
              disabled={!settings.notificationsEnabled}
              value={settings.messageNotifications}
              onValueChange={() => handleToggle('messageNotifications')}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={settings.messageNotifications ? '#0a66c2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          {/* Sound */}
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Volume2 size={20} color="#0a66c2" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notification Sound</Text>
              <Text style={styles.rowSubtitle}>Play audio tone for incoming messages</Text>
            </View>
            <Switch
              disabled={!settings.notificationsEnabled}
              value={settings.soundEnabled}
              onValueChange={() => handleToggle('soundEnabled')}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={settings.soundEnabled ? '#0a66c2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          {/* Vibration */}
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Vibrate size={20} color="#0a66c2" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Vibration</Text>
              <Text style={styles.rowSubtitle}>Vibrate device on alert</Text>
            </View>
            <Switch
              disabled={!settings.notificationsEnabled}
              value={settings.vibrationEnabled}
              onValueChange={() => handleToggle('vibrationEnabled')}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={settings.vibrationEnabled ? '#0a66c2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          {/* Previews */}
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Eye size={20} color="#0a66c2" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Show Message Preview</Text>
              <Text style={styles.rowSubtitle}>Display message text in notification banners</Text>
            </View>
            <Switch
              disabled={!settings.notificationsEnabled}
              value={settings.showPreviews}
              onValueChange={() => handleToggle('showPreviews')}
              trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
              thumbColor={settings.showPreviews ? '#0a66c2' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Muted Conversations */}
        <Text style={styles.sectionHeader}>MUTED CONVERSATIONS ({settings.mutedConversations?.length || 0})</Text>
        <View style={styles.sectionCard}>
          {(!settings.mutedConversations || settings.mutedConversations.length === 0) ? (
            <Text style={styles.emptyText}>No muted conversations. You will receive notifications for all joined channels and chats.</Text>
          ) : (
            settings.mutedConversations.map((id, index) => (
              <View key={id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.subItemRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <VolumeX size={18} color="#ef4444" style={{ marginRight: 10 }} />
                    <Text style={styles.subItemTitle} numberOfLines={1}>
                      {id.startsWith('dm_') ? 'Direct Message Chat' : id}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionPill}
                    onPress={() => handleUnmute(id)}
                  >
                    <Text style={styles.actionPillText}>Unmute</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Blocked Senders */}
        <Text style={styles.sectionHeader}>BLOCKED SENDERS ({settings.blockedUsers?.length || 0})</Text>
        <View style={styles.sectionCard}>
          {(!settings.blockedUsers || settings.blockedUsers.length === 0) ? (
            <Text style={styles.emptyText}>No blocked users. Messages from all connections are permitted.</Text>
          ) : (
            settings.blockedUsers.map((uid, index) => (
              <View key={uid}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.subItemRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <UserX size={18} color="#ef4444" style={{ marginRight: 10 }} />
                    <Text style={styles.subItemTitle} numberOfLines={1}>
                      User ({uid.slice(0, 10)}...)
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionPill}
                    onPress={() => handleUnblock(uid)}
                  >
                    <Text style={styles.actionPillText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 18,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledSection: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  subItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a66c2',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});

