import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/navigationRef';

// Default notification preferences
export const DEFAULT_NOTIFICATION_SETTINGS = {
  notificationsEnabled: true,
  messageNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showPreviews: true,
  mutedConversations: [], // array of communityId or dmId strings
  blockedUsers: [],        // array of user uid strings
};

// Internal state
let currentActiveConversationId = null;
let currentSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
const processedMessageIds = new Set();

/**
 * Configure how foreground notifications should behave
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification?.request?.content?.data;
    const conversationId = data?.communityId;

    // Suppress notification if user is currently inside the conversation
    if (conversationId && conversationId === currentActiveConversationId) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }

    const sound = currentSettings.soundEnabled !== false;
    return {
      shouldShowAlert: currentSettings.notificationsEnabled !== false && currentSettings.messageNotifications !== false,
      shouldPlaySound: sound,
      shouldSetBadge: true,
    };
  },
});

/**
 * Update the conversation ID the user is currently viewing
 */
export function setActiveConversation(conversationId) {
  currentActiveConversationId = conversationId;
}

export function getActiveConversation() {
  return currentActiveConversationId;
}

/**
 * Set internal cache of notification settings
 */
export function setCachedNotificationSettings(settings) {
  currentSettings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings };
}

/**
 * Initialize Android notification channel "Messages"
 */
export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('Messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a66c2',
        enableVibrate: true,
        showBadge: true,
      });
    } catch (err) {
      console.log('Notification channel setup skipped or not supported:', err?.message);
    }
  }
}

/**
 * Request notification permissions and register the device token under users/{uid}/tokens/{tokenId}
 */
export async function registerForPushNotificationsAsync(currentUser) {
  if (!currentUser?.uid) return null;

  try {
    // 1. Setup channel on Android safely
    await setupNotificationChannels();

    // 2. Request permission (handles Android 13+ POST_NOTIFICATIONS)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted.');
      return null;
    }

    // 3. Obtain push token
    let token = null;
    try {
      const expoTokenObj = await Notifications.getExpoPushTokenAsync();
      token = expoTokenObj?.data;
    } catch (tokenErr) {
      console.log('Falling back to device push token:', tokenErr?.message);
      try {
        const deviceTokenObj = await Notifications.getDevicePushTokenAsync();
        token = deviceTokenObj?.data;
      } catch (deviceErr) {
        console.log('Unable to fetch device push token:', deviceErr?.message);
      }
    }

    // 4. Save device token under authenticated user in Firestore
    if (token) {
      await saveDeviceTokenToFirestore(currentUser.uid, token);
    }

    return token;
  } catch (error) {
    console.log('Notification registration note:', error?.message);
    return null;
  }
}

/**
 * Store device token supporting multiple devices per user.
 * Stores in user profile (guaranteed Firestore permissions) and users/{uid}/tokens.
 */
export async function saveDeviceTokenToFirestore(uid, token) {
  if (!uid || !token) return;

  try {
    // Cache locally
    await AsyncStorage.setItem(`push_token_${uid}`, token);

    // Save under user's profile document where write permissions are always active
    const q = query(collection(db, 'profiles'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const profileDoc = snap.docs[0];
      const existingTokens = profileDoc.data().fcmTokens || [];
      if (!existingTokens.includes(token)) {
        await updateDoc(profileDoc.ref, {
          fcmTokens: [...existingTokens, token],
          lastTokenUpdate: serverTimestamp()
        }).catch(() => {});
      }
    }

    // Also attempt users/{uid}/tokens if allowed by rules
    const tokenId = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    const tokenDocRef = doc(db, 'users', uid, 'tokens', tokenId);
    await setDoc(tokenDocRef, {
      token,
      platform: Platform.OS,
      deviceName: Device.deviceName || `${Platform.OS} device`,
      osVersion: Device.osVersion || '',
      active: true,
      lastUpdated: serverTimestamp(),
    }, { merge: true }).catch(() => {});
  } catch (err) {
    console.log('Note saving device token:', err?.message);
  }
}

/**
 * Deactivate device token on logout
 */
export async function unregisterPushTokenAsync(uid) {
  if (!uid) return;

  try {
    const cachedToken = await AsyncStorage.getItem(`push_token_${uid}`);
    if (cachedToken) {
      // Remove from profile
      const q = query(collection(db, 'profiles'), where('uid', '==', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const profileDoc = snap.docs[0];
        const tokens = (profileDoc.data().fcmTokens || []).filter(t => t !== cachedToken);
        await updateDoc(profileDoc.ref, { fcmTokens: tokens }).catch(() => {});
      }

      // Deactivate in users collection if accessible
      const tokenId = cachedToken.replace(/[^a-zA-Z0-9_-]/g, '_');
      const tokenDocRef = doc(db, 'users', uid, 'tokens', tokenId);
      await updateDoc(tokenDocRef, {
        active: false,
        loggedOutAt: serverTimestamp(),
      }).catch(() => {});
    }
    await AsyncStorage.removeItem(`push_token_${uid}`);
  } catch (err) {
    console.log('Note unregistering token on logout:', err?.message);
  }
}

/**
 * Fetch notification preferences.
 * Checks local AsyncStorage first, then user's profile, and gracefully falls back to defaults.
 */
export async function getNotificationSettings(uid) {
  if (!uid) return DEFAULT_NOTIFICATION_SETTINGS;

  try {
    // 1. Check local storage cache for instant retrieval
    const cached = await AsyncStorage.getItem(`notif_settings_${uid}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      setCachedNotificationSettings(parsed);
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
    }

    // 2. Check profile document in Firestore (always accessible)
    const q = query(collection(db, 'profiles'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty && snap.docs[0].data().notificationSettings) {
      const settings = snap.docs[0].data().notificationSettings;
      const merged = { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings };
      setCachedNotificationSettings(merged);
      await AsyncStorage.setItem(`notif_settings_${uid}`, JSON.stringify(merged));
      return merged;
    }

    // 3. Fallback check on users/{uid}/notificationSettings/preferences
    const prefRef = doc(db, 'users', uid, 'notificationSettings', 'preferences');
    const userPrefSnap = await getDoc(prefRef).catch(() => null);
    if (userPrefSnap && userPrefSnap.exists()) {
      const data = { ...DEFAULT_NOTIFICATION_SETTINGS, ...userPrefSnap.data() };
      setCachedNotificationSettings(data);
      await AsyncStorage.setItem(`notif_settings_${uid}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    // Graceful fallback without crashing or throwing
  }

  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save notification preferences to Firestore and local storage.
 */
export async function saveNotificationSettings(uid, settings) {
  if (!uid) return;

  try {
    setCachedNotificationSettings(settings);
    await AsyncStorage.setItem(`notif_settings_${uid}`, JSON.stringify(settings));

    // Save to user's profile document where permissions are guaranteed
    const q = query(collection(db, 'profiles'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, {
        notificationSettings: settings,
        notificationSettingsUpdatedAt: serverTimestamp()
      }).catch(() => {});
    }

    // Also attempt users/{uid}/notificationSettings if allowed
    const prefRef = doc(db, 'users', uid, 'notificationSettings', 'preferences');
    await setDoc(prefRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch(() => {});
  } catch (err) {
    console.log('Note saving notification settings:', err?.message);
  }
}

/**
 * Display in-app notification when user is on another screen
 */
export async function displayInAppNotification({
  messageId,
  conversationId,
  conversationName,
  senderId,
  senderName,
  text,
  hasImage,
  settings = currentSettings,
}) {
  // Prevent duplicate notification for same message ID
  if (messageId && processedMessageIds.has(messageId)) return;
  if (messageId) processedMessageIds.add(messageId);

  // If user is currently inside this conversation, avoid showing notification
  if (conversationId && conversationId === currentActiveConversationId) return;

  // Check notification settings
  if (settings.notificationsEnabled === false) return;
  if (settings.messageNotifications === false) return;
  if (conversationId && settings.mutedConversations?.includes(conversationId)) return;
  if (senderId && settings.blockedUsers?.includes(senderId)) return;

  const title = conversationName || senderName || 'New Message';
  let body = 'Sent you a message';

  if (hasImage) {
    body = 'Sent you a photo';
  } else if (settings.showPreviews !== false && text) {
    body = text;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          communityId: conversationId,
          communityName: conversationName,
        },
        channelId: 'Messages',
        sound: settings.soundEnabled !== false,
        vibrate: settings.vibrationEnabled !== false ? [0, 250, 250, 250] : null,
      },
      trigger: null,
    });
  } catch (err) {
    console.log('Error scheduling in-app notification:', err);
  }
}

/**
 * Setup notification response listener (tapping a notification opens the chat)
 */
export function setupNotificationListeners(onNavigate) {
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response?.notification?.request?.content?.data;
    if (data?.communityId) {
      if (onNavigate) {
        onNavigate(data);
      } else {
        navigate('MainTabs', {
          screen: 'Messages',
          params: {
            communityId: data.communityId,
            communityName: data.communityName || 'Chat',
          },
        });
      }
    }
  });

  return () => {
    responseSubscription.remove();
  };
}

