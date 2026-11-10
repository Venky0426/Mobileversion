import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

// In-memory cache of read timestamps and read message IDs
let memoryReadTimestamps = {};
let readMessageIds = new Set();
let currentUserId = null;
const listeners = new Set();

function getActiveUserId() {
  return currentUserId || auth.currentUser?.uid || null;
}

/**
 * Persist memory caches to AsyncStorage
 */
async function savePersistedData(uid) {
  const targetUid = uid || getActiveUserId();
  if (!targetUid) return;

  try {
    await AsyncStorage.setItem(
      `@codershub_read_ts_${targetUid}`,
      JSON.stringify(memoryReadTimestamps)
    );
  } catch (e) {}

  try {
    await AsyncStorage.setItem(
      `@codershub_read_msg_ids_${targetUid}`,
      JSON.stringify(Array.from(readMessageIds))
    );
  } catch (e) {}
}

/**
 * Initialize read timestamps and message IDs for a user
 */
export async function initUnreadService(uid) {
  const targetUid = uid || getActiveUserId();
  if (!targetUid) return;

  currentUserId = targetUid;

  try {
    const rawTs = await AsyncStorage.getItem(`@codershub_read_ts_${targetUid}`);
    if (rawTs) {
      memoryReadTimestamps = JSON.parse(rawTs) || {};
    }
  } catch (e) {
    memoryReadTimestamps = {};
  }

  try {
    const rawIds = await AsyncStorage.getItem(`@codershub_read_msg_ids_${targetUid}`);
    if (rawIds) {
      const arr = JSON.parse(rawIds);
      if (Array.isArray(arr)) {
        readMessageIds = new Set(arr);
      }
    }
  } catch (e) {
    readMessageIds = new Set();
  }

  notifyListeners();
}

/**
 * Subscribe to unread changes
 */
export function subscribeToUnreadUpdates(listener) {
  listeners.add(listener);
  try {
    listener({ timestamps: { ...memoryReadTimestamps }, readIds: new Set(readMessageIds) });
  } catch (e) {}
  return () => listeners.delete(listener);
}

function notifyListeners() {
  const snapshot = {
    timestamps: { ...memoryReadTimestamps },
    readIds: new Set(readMessageIds)
  };
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {}
  });
}

/**
 * Explicitly mark specific message IDs as read
 */
export async function markMessagesAsRead(messageIds = []) {
  const targetUid = getActiveUserId();
  if (!Array.isArray(messageIds) || messageIds.length === 0) return;

  let changed = false;
  messageIds.forEach((id) => {
    if (id && !readMessageIds.has(id)) {
      readMessageIds.add(id);
      changed = true;
    }
  });

  if (changed) {
    notifyListeners();
    if (targetUid) {
      savePersistedData(targetUid);
    }
  }

  // Update in Firestore in background
  messageIds.forEach((id) => {
    if (id) {
      updateDoc(doc(db, 'messages', id), {
        read: true,
        readAt: serverTimestamp()
      }).catch(() => {});
    }
  });
}

/**
 * Mark a specific conversation as read
 */
export async function markConversationAsRead(conversationId, senderUid = null, messageIds = []) {
  const targetUid = getActiveUserId();
  if (!conversationId) return;

  const now = Date.now();
  memoryReadTimestamps[conversationId] = now;

  // If DM format dm_uid1_uid2, also mark alternate order
  if (conversationId.startsWith('dm_')) {
    const parts = conversationId.replace('dm_', '').split('_');
    if (parts.length === 2) {
      memoryReadTimestamps[`dm_${parts[1]}_${parts[0]}`] = now;
    }
  }

  if (senderUid) {
    memoryReadTimestamps[senderUid] = now;
  }

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    messageIds.forEach((id) => {
      if (id) readMessageIds.add(id);
    });
  }

  notifyListeners();
  if (targetUid) {
    savePersistedData(targetUid);
  }

  // Update read status in Firestore
  if (targetUid) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('communityId', '==', conversationId),
        where('recipientId', '==', targetUid)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!d.data().read) {
          updateDoc(doc(db, 'messages', d.id), {
            read: true,
            readAt: serverTimestamp()
          }).catch(() => {});
        }
      });
    } catch (e) {
      if (senderUid) {
        try {
          const q2 = query(
            collection(db, 'messages'),
            where('senderId', '==', senderUid),
            where('recipientId', '==', targetUid)
          );
          const snap2 = await getDocs(q2);
          snap2.forEach((d) => {
            if (!d.data().read) {
              updateDoc(doc(db, 'messages', d.id), {
                read: true,
                readAt: serverTimestamp()
              }).catch(() => {});
            }
          });
        } catch (err2) {}
      }
    }
  }
}

/**
 * Mark all direct messages as read (e.g. when opening Messages screen or tab)
 */
export async function markAllDirectMessagesAsRead(messageIds = []) {
  const targetUid = getActiveUserId();
  const now = Date.now();
  memoryReadTimestamps['_global_last_read'] = now;

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    messageIds.forEach((id) => {
      if (id) readMessageIds.add(id);
    });
  }

  notifyListeners();
  if (targetUid) {
    savePersistedData(targetUid);
  }

  // Also update any unread messages addressed to this user in Firestore
  if (targetUid) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('recipientId', '==', targetUid)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!d.data().read) {
          readMessageIds.add(d.id);
          updateDoc(doc(db, 'messages', d.id), {
            read: true,
            readAt: serverTimestamp()
          }).catch(() => {});
        }
      });
      savePersistedData(targetUid);
    } catch (e) {}
  }
}

/**
 * Check whether a message is unread
 */
export function isMessageUnread(msg, currentUid) {
  const targetUid = currentUid || getActiveUserId();
  if (!msg || !targetUid) return false;
  if (msg.senderId === targetUid) return false;
  if (msg.recipientId && msg.recipientId !== targetUid) return false;
  if (msg.read === true) return false;

  // Direct check if message ID was already marked read
  if (msg.id && readMessageIds.has(msg.id)) return false;

  // Parse message timestamp
  let msgTime = 0;
  if (msg.timestamp?.toMillis) {
    msgTime = msg.timestamp.toMillis();
  } else if (msg.timestamp?.seconds) {
    msgTime = msg.timestamp.seconds * 1000;
  } else if (typeof msg.timestamp === 'number') {
    msgTime = msg.timestamp;
  } else if (typeof msg.timestamp === 'string') {
    const parsed = new Date(msg.timestamp).getTime();
    if (!isNaN(parsed)) msgTime = parsed;
  } else if (msg.createdAt?.toMillis) {
    msgTime = msg.createdAt.toMillis();
  } else if (msg.createdAt?.seconds) {
    msgTime = msg.createdAt.seconds * 1000;
  } else if (msg.localTime) {
    msgTime = Number(msg.localTime) || 0;
  }

  // Check global read timestamp
  const globalRead = memoryReadTimestamps['_global_last_read'] || 0;
  if (globalRead > 0 && (msgTime === 0 || msgTime <= globalRead)) {
    return false;
  }

  // Check conversation read timestamp
  if (msg.communityId) {
    const convRead = memoryReadTimestamps[msg.communityId] || 0;
    if (convRead > 0 && (msgTime === 0 || msgTime <= convRead)) {
      return false;
    }

    if (msg.communityId.startsWith('dm_')) {
      const parts = msg.communityId.replace('dm_', '').split('_');
      if (parts.length === 2) {
        const altDmId = `dm_${parts[1]}_${parts[0]}`;
        const altRead = memoryReadTimestamps[altDmId] || 0;
        if (altRead > 0 && (msgTime === 0 || msgTime <= altRead)) {
          return false;
        }
      }
    }
  }

  // Check sender read timestamp
  if (msg.senderId) {
    const senderRead = memoryReadTimestamps[msg.senderId] || 0;
    if (senderRead > 0 && (msgTime === 0 || msgTime <= senderRead)) {
      return false;
    }
  }

  return true;
}
