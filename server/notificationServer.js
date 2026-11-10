/**
 * CodersHub - Backend Push Notification Dispatcher
 * Compatible with Firebase Spark (Free) Plan
 *
 * This server runs independently of Firebase Cloud Functions, allowing you
 * to trigger automatic background and terminated push notifications without
 * upgrading to the Firebase Blaze plan.
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const fs = require('fs');
const path = require('path');

// 1. Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || 'codershubtest'
  });
  console.log('Firebase Admin initialized with service account key.');
} else {
  // Fallback to default application credentials or project ID
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'codershubtest'
  });
  console.log('Firebase Admin initialized with default project credentials.');
}

const db = admin.firestore();
const expo = new Expo();

// In-memory deduplication set
const processedMessageIds = new Set();
const serverStartTime = Date.now();

console.log('CodersHub Push Notification Dispatcher running...');
console.log(`Listening for real-time messages on Firestore (started at ${new Date(serverStartTime).toISOString()})...`);

/**
 * Main listener on messages collection
 */
db.collection('messages').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'added') {
      const msgDoc = change.doc;
      const msgId = msgDoc.id;
      const message = msgDoc.data();

      // Prevent duplicate processing
      if (processedMessageIds.has(msgId)) return;
      processedMessageIds.add(msgId);

      // Ignore messages created prior to server startup
      const messageTime = message.timestamp?.toMillis ? message.timestamp.toMillis() : (message.localTime || 0);
      if (messageTime && messageTime < serverStartTime - 5000) {
        return;
      }

      try {
        await handleIncomingMessage(msgId, message);
      } catch (err) {
        console.error(`Error processing message ${msgId}:`, err);
      }
    }
  });
}, (error) => {
  console.error('Firestore messages snapshot error:', error);
});

/**
 * Handle individual incoming message and send push notifications
 */
async function handleIncomingMessage(msgId, message) {
  const senderId = message.senderId;
  const communityId = message.communityId;
  if (!senderId || !communityId) return;

  // 1. Identify target recipient(s)
  const recipientUids = await getTargetRecipients(message);
  if (!recipientUids || recipientUids.length === 0) return;

  for (const recipientUid of recipientUids) {
    // Never send push notification to sender
    if (recipientUid === senderId) continue;

    // 2. Fetch recipient's notification preferences
    const settings = await getRecipientSettings(recipientUid);

    // Check master switch
    if (settings.notificationsEnabled === false) continue;
    // Check message notifications switch
    if (settings.messageNotifications === false) continue;
    // Check if conversation is muted
    if (settings.mutedConversations?.includes(communityId)) continue;
    // Check if sender is blocked
    if (settings.blockedUsers?.includes(senderId)) continue;

    // 3. Fetch recipient's registered device tokens (supporting multiple devices)
    const tokens = await getRecipientDeviceTokens(recipientUid);
    if (!tokens || tokens.length === 0) continue;

    // 4. Construct notification content
    let title = message.communityName || message.senderName || 'New Message';
    if (message.communityId.startsWith('dm_')) {
      title = message.senderName || 'Direct Message';
    }

    let body = 'Sent you a message';
    if (message.imageUrl) {
      body = 'Sent you a photo';
    } else if (settings.showPreviews !== false && message.text) {
      body = message.text;
    } else if (message.codeSnippet) {
      body = 'Sent you a code snippet';
    }

    // 5. Build push messages for valid Expo push tokens
    const pushMessages = [];
    for (const token of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.warn(`Token ${token} is not a valid Expo push token.`);
        continue;
      }

      pushMessages.push({
        to: token,
        sound: settings.soundEnabled !== false ? 'default' : null,
        title,
        body,
        data: {
          communityId: message.communityId,
          communityName: message.communityName || message.senderName,
          senderId: message.senderId,
          messageId: msgId,
        },
        channelId: 'Messages',
        priority: 'high',
      });
    }

    // 6. Send push notifications in chunks
    if (pushMessages.length > 0) {
      const chunks = expo.chunkPushNotifications(pushMessages);
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(`Push sent to ${recipientUid}:`, ticketChunk);
          handleTickets(ticketChunk, recipientUid, tokens);
        } catch (error) {
          console.error(`Error sending push notification to ${recipientUid}:`, error);
        }
      }
    }
  }
}

/**
 * Determine recipient UID(s) based on conversation type
 */
async function getTargetRecipients(message) {
  const { communityId, recipientId, senderId } = message;

  // Explicit recipient ID provided
  if (recipientId) {
    return [recipientId];
  }

  // Direct Message format: dm_UIDA_UIDB
  if (communityId.startsWith('dm_')) {
    const parts = communityId.replace('dm_', '').split('_');
    if (parts.length === 2) {
      return parts.filter(uid => uid !== senderId);
    }
  }

  // Community Channel: In a real app, query community members or profiles
  // For demonstration, retrieve other profiles registered in the app
  try {
    const profilesSnap = await db.collection('profiles').limit(20).get();
    const uids = [];
    profilesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.uid && data.uid !== senderId) {
        uids.push(data.uid);
      }
    });
    return uids;
  } catch (e) {
    console.error('Error fetching community recipients:', e);
    return [];
  }
}

/**
 * Fetch recipient notification preferences from Firestore
 */
async function getRecipientSettings(uid) {
  try {
    const snap = await db.collection('users').doc(uid).collection('notificationSettings').doc('preferences').get();
    if (snap.exists) {
      return snap.data();
    }
  } catch (err) {
    console.error(`Error loading settings for ${uid}:`, err);
  }
  return {
    notificationsEnabled: true,
    messageNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showPreviews: true,
    mutedConversations: [],
    blockedUsers: []
  };
}

/**
 * Fetch recipient active device tokens from users/{uid}/tokens
 */
async function getRecipientDeviceTokens(uid) {
  try {
    const snap = await db.collection('users').doc(uid).collection('tokens').where('active', '==', true).get();
    const tokens = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });
    return tokens;
  } catch (err) {
    console.error(`Error loading tokens for ${uid}:`, err);
    return [];
  }
}

/**
 * Check ticket receipts and deactivate expired or invalid tokens
 */
function handleTickets(tickets, uid, tokens) {
  tickets.forEach((ticket, idx) => {
    if (ticket.status === 'error') {
      console.warn(`Notification ticket error for ${uid}:`, ticket.message, ticket.details);
      if (ticket.details?.error === 'DeviceNotRegistered') {
        const invalidToken = tokens[idx];
        if (invalidToken) {
          const tokenId = invalidToken.replace(/[^a-zA-Z0-9_-]/g, '_');
          db.collection('users').doc(uid).collection('tokens').doc(tokenId).update({
            active: false,
            invalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }).then(() => {
            console.log(`Deactivated invalid device token: ${invalidToken}`);
          }).catch(console.error);
        }
      }
    }
  });
}

