<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
  ImageBackground,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  Send,
  Code,
  Hash,
  ChevronDown,
  Gift,
  ArrowLeft,
  Bell,
  Users,
  Check,
  Plus,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  UserX,
  UserCheck
} from 'lucide-react-native';
import clsx from 'clsx';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  setActiveConversation,
  getNotificationSettings,
  saveNotificationSettings
} from '../services/notificationService';
import {
  initUnreadService,
  subscribeToUnreadUpdates,
  markConversationAsRead as markConversationAsReadService,
  markMessagesAsRead as markMessagesAsReadService,
  markAllDirectMessagesAsRead as markAllDirectMessagesAsReadService,
  isMessageUnread
} from '../services/unreadMessageService';

const isUserOnline = (profile) => {
  if (!profile.lastActive) return false;
  let timeMs;
  if (profile.lastActive.toDate) {
    timeMs = profile.lastActive.toDate().getTime();
  } else if (profile.lastActive.seconds) {
    timeMs = profile.lastActive.seconds * 1000;
  } else {
    timeMs = new Date(profile.lastActive).getTime();
  }
  return Date.now() - timeMs < 5 * 60 * 1000;
};

const DEFAULT_COMMUNITIES = [
  { id: 'mca-community', name: 'MCA Community 2025-27', members: 116, online: '10 Online', badge: 5, img: 'https://api.dicebear.com/7.x/shapes/png?seed=mca', coverImg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400' },
  { id: 'web-dev-community', name: 'Web Dev Community', members: 176, online: '30 Online', badge: 8, img: 'https://api.dicebear.com/7.x/shapes/png?seed=web', coverImg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400' },
  { id: 'ui-ux-community', name: 'UI/UX Community', members: 76, online: '20 Online', badge: null, img: 'https://api.dicebear.com/7.x/shapes/png?seed=uiux', coverImg: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400' },
  { id: 'ai-ml-community', name: 'AI & ML Community', members: 176, online: '30 Online', badge: 10, img: 'https://api.dicebear.com/7.x/shapes/png?seed=aiml', coverImg: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400' },
  { id: 'data-science', name: 'Data Science Hub', members: 89, online: '15 Online', badge: 2, img: 'https://api.dicebear.com/7.x/shapes/png?seed=data', coverImg: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400' },
  { id: 'competitive-prog', name: 'Competitive Programming', members: 245, online: '50 Online', badge: 12, img: 'https://api.dicebear.com/7.x/shapes/png?seed=cp', coverImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400' },
  { id: 'open-source', name: 'Open Source Contributors', members: 432, online: '120 Online', badge: null, img: 'https://api.dicebear.com/7.x/shapes/png?seed=os', coverImg: 'https://images.unsplash.com/photo-1531498860502-7c67cf519b9e?w=400' }
];

const CATEGORIES = [
  'Web Dev',
  'AI / ML',
  'Mobile Dev',
  'UI/UX Design',
  'Data Science',
  'Competitive Coding',
  'Open Source',
  'General'
];

const CATEGORY_COVERS = {
  'Web Dev': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  'AI / ML': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
  'Mobile Dev': 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=400',
  'UI/UX Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  'Data Science': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
  'Competitive Coding': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
  'Open Source': 'https://images.unsplash.com/photo-1531498860502-7c67cf519b9e?w=400',
  'General': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400'
};

const POPULAR_IDS = ['mca-community', 'web-dev-community', 'ai-ml-community'];

export default function MessagesScreen({ route, navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [customCommunities, setCustomCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(DEFAULT_COMMUNITIES[1]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chat'
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState({});
  
  // Community Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Web Dev');
  const [creatingComm, setCreatingComm] = useState(false);

=======
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, Code, Hash, ChevronDown, X, Gift, ArrowLeft, Bell } from 'lucide-react-native';
import clsx from 'clsx';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';

// Use the machine's local network IP address for physical devices
// 10.0.2.2 for Android Emulator, localhost for iOS simulator, or specific IP for physical devices
let SOCKET_URL = 'http://10.125.91.167:3001';

const socket = io(SOCKET_URL, {
  reconnectionAttempts: 5,
  timeout: 10000,
});

socket.on('connect', () => console.log('Socket connected:', socket.id));
socket.on('connect_error', (err) => console.log('Socket connect error:', err.message));
socket.on('disconnect', () => console.log('Socket disconnected'));


const COMMUNITIES_LIST = [
  { id: 'mca-community', name: 'MCA Community 2025-27', members: '116 Members', online: '10 Online', badge: 5, img: 'https://api.dicebear.com/7.x/shapes/png?seed=mca' },
  { id: 'web-dev-community', name: 'Web Dev Community', members: '176 Members', online: '30 Online', badge: 8, img: 'https://api.dicebear.com/7.x/shapes/png?seed=web' },
  { id: 'ui-ux-community', name: 'UI/UX Community', members: '76 Members', online: '20 Online', badge: null, img: 'https://api.dicebear.com/7.x/shapes/png?seed=uiux' },
  { id: 'ai-ml-community', name: 'AI &ML Community', members: '176 Members', online: '30 Online', badge: 10, img: 'https://api.dicebear.com/7.x/shapes/png?seed=aiml' },
  { id: 'data-science', name: 'Data Science Hub', members: '89 Members', online: '15 Online', badge: 2, img: 'https://api.dicebear.com/7.x/shapes/png?seed=data' },
  { id: 'competitive-prog', name: 'Competitive Programming', members: '245 Members', online: '50 Online', badge: 12, img: 'https://api.dicebear.com/7.x/shapes/png?seed=cp' },
  { id: 'open-source', name: 'Open Source Contributors', members: '432 Members', online: '120 Online', badge: null, img: 'https://api.dicebear.com/7.x/shapes/png?seed=os' }
];

// Direct messages are dynamically loaded from profiles now

export default function MessagesScreen() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeCommunity, setActiveCommunity] = useState(COMMUNITIES_LIST[1]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chat'
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [userNotifSettings, setUserNotifSettings] = useState(null);
  const scrollViewRef = useRef();

  // Listen to connections involving current user
  useEffect(() => {
    if (!currentUser) return;
    const q = collection(db, 'connections');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.users && data.users.includes(currentUser.uid)) {
          list.push({ id: docSnap.id, ...data });
        }
      });
      setConnections(list);
    }, (err) => {
      console.log('Connections subscription error in Messages:', err?.message);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Filter connections where status is accepted
  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  // Set of user IDs who are accepted connections with current user
  const acceptedConnectionUids = new Set(
    acceptedConnections
      .map(c => c.users?.find(u => u !== currentUser?.uid))
      .filter(Boolean)
  );

  // Map each accepted connection to a unified Direct Message chat item
  const acceptedDirectChats = acceptedConnections.map((conn) => {
    const otherUid = conn.users?.find(u => u !== currentUser?.uid);
    const matchingProfile = profiles.find(p => p.uid === otherUid);

    const name = matchingProfile?.fullName
      || (conn.senderId === currentUser?.uid ? conn.receiverName : conn.senderName)
      || 'Developer';

    const avatar = matchingProfile?.imageUrl
      || (conn.senderId === currentUser?.uid ? conn.receiverAvatar : conn.senderAvatar)
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const isOnline = matchingProfile ? isUserOnline(matchingProfile) : false;
    const lastActive = matchingProfile?.lastActive;

    return {
      connectionId: conn.id,
      otherUid,
      name,
      avatar,
      isOnline,
      lastActive,
      profile: matchingProfile
    };
  }).filter(item => item.otherUid);

  const [, setUnreadVersion] = useState(0);
  const [incomingDirectMessages, setIncomingDirectMessages] = useState([]);

  // Initialize and listen to shared unread message updates
  useEffect(() => {
    if (!currentUser?.uid) return;
    initUnreadService(currentUser.uid);
    const unsubscribe = subscribeToUnreadUpdates(() => {
      setUnreadVersion(v => v + 1);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Real-time listener for incoming direct messages for current user
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(docSnap => {
        msgs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setIncomingDirectMessages(msgs);
    }, (err) => {
      console.log('Incoming direct messages listener note:', err?.message);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Mark conversation as read both locally, in shared unread service, and in Firestore
  const markConversationAsRead = useCallback(async (conversationId, senderUid) => {
    if (!currentUser?.uid || !conversationId) return;

    const msgIds = incomingDirectMessages
      .filter(m => (m.communityId === conversationId || (senderUid && m.senderId === senderUid)))
      .map(m => m.id)
      .filter(Boolean);

    await markConversationAsReadService(conversationId, senderUid, msgIds);
  }, [currentUser?.uid, incomingDirectMessages]);

  // Helper to calculate unread message count and latest message for each direct chat
  const getDMInfo = useCallback((otherUid) => {
    if (!currentUser?.uid) return { unreadCount: 0, latestMessage: null, dmId: '' };
    const dmId = `dm_${[currentUser.uid, otherUid].sort().join('_')}`;

    const dmMessages = incomingDirectMessages.filter(m =>
      (m.communityId === dmId || m.senderId === otherUid) &&
      m.senderId !== currentUser.uid
    );

    const unreadCount = dmMessages.filter(m => isMessageUnread(m, currentUser.uid)).length;

    const sorted = [...dmMessages].sort((a, b) => {
      const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.localTime || 0);
      const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.localTime || 0);
      return timeB - timeA;
    });

    return {
      unreadCount,
      latestMessage: sorted[0] || null,
      dmId
    };
  }, [currentUser?.uid, incomingDirectMessages]);

  // Total unread direct messages count across all connections
  const totalUnreadDMs = acceptedDirectChats.reduce((total, chat) => {
    return total + getDMInfo(chat.otherUid).unreadCount;
  }, 0);

  // Load user notification preferences
  useEffect(() => {
    if (currentUser?.uid) {
      getNotificationSettings(currentUser.uid).then(setUserNotifSettings);
    }
  }, [currentUser?.uid]);

  // Track active conversation for notification suppression and mark as read
  useEffect(() => {
    if (viewMode === 'chat' && activeCommunity?.id) {
      setActiveConversation(activeCommunity.id);
      markConversationAsRead(activeCommunity.id, activeCommunity.recipientUid);
    } else {
      setActiveConversation(null);
    }
    return () => setActiveConversation(null);
  }, [viewMode, activeCommunity?.id, activeCommunity?.recipientUid, markConversationAsRead]);

  // Combine custom Firestore communities with built-in default list
  const allCommunities = [
    ...customCommunities,
    ...DEFAULT_COMMUNITIES.filter(def => !customCommunities.some(c => c.id === def.id || c.name === def.name))
  ];

  // Auth state listener
=======
  const [socketError, setSocketError] = useState(null);
  
  const [profiles, setProfiles] = useState([]);
  
  const scrollViewRef = useRef();

  const isUserOnline = (profile) => {
    if (!profile.lastActive) return false;
    let timeMs = 0;
    if (profile.lastActive.toDate) {
      timeMs = profile.lastActive.toDate().getTime();
    } else if (profile.lastActive.seconds) {
      timeMs = profile.lastActive.seconds * 1000;
    } else {
      timeMs = new Date(profile.lastActive).getTime();
    }
    return Date.now() - timeMs < 5 * 60 * 1000;
  };

>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const q = query(collection(db, 'profiles'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserProfile(querySnapshot.docs[0].data());
          } else {
            setUserProfile({
              fullName: user.email.split('@')[0],
              imageUrl: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(user.email)}`
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

<<<<<<< HEAD
  // Listen to Firestore communities in real-time with graceful fallback
  useEffect(() => {
    const q = collection(db, 'communities');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setCustomCommunities(list);
      },
      (err) => {
        // Fall back seamlessly to default communities if rules are pending or offline
        console.log("Firestore communities note (using default communities):", err?.message);
        setCustomCommunities([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle incoming route params (e.g. from FeedScreen Recommended Communities "Join" or Direct Message requests)
  useEffect(() => {
    if (route?.params?.communityId || route?.params?.communityName) {
      const targetId = route.params.communityId;
      const targetName = route.params.communityName;
      const isDM = route.params.isDM || targetId?.startsWith('dm_');
      const targetRecipientUid = route.params.recipientUid;

      // Check accepted connection requirement for direct messaging
      if (isDM && targetRecipientUid && targetRecipientUid !== currentUser?.uid) {
        if (!acceptedConnectionUids.has(targetRecipientUid)) {
          Alert.alert(
            "Connection Required",
            `You can only direct message developers after your connection request is accepted. You can message freely anytime in all Community channels!`,
            [
              { text: "Connect Now", onPress: () => navigation.navigate('Connect') },
              { text: "OK", style: "cancel" }
            ]
          );
          setViewMode('list');
          return;
        }
      }

      const found = allCommunities.find(c =>
        (targetId && c.id === targetId) ||
        (targetName && c.name?.toLowerCase() === targetName.toLowerCase()) ||
        (targetName && (c.name?.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(c.name?.toLowerCase())))
      );

      if (found) {
        setActiveCommunity(found);
        setJoinedCommunities(prev => ({ ...prev, [found.id]: true }));
        setViewMode('chat');
      } else if (targetName) {
        const fallback = {
          id: targetId || targetName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: targetName,
          members: isDM ? 'Direct Message' : 1,
          online: '1 Online',
          img: route.params.communityImg || `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(targetName)}`,
          coverImg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
          isDM,
          recipientUid: targetRecipientUid
        };
        setActiveCommunity(fallback);
        setJoinedCommunities(prev => ({ ...prev, [fallback.id]: true }));
        setViewMode('chat');
      }
    }
  }, [route?.params?.communityId, route?.params?.communityName, customCommunities.length, connections.length]);

  // Listen to profiles for direct messaging
=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  useEffect(() => {
    const q = collection(db, 'profiles');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      const seenUids = new Set();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid && !seenUids.has(data.uid)) {
          seenUids.add(data.uid);
          list.push({ docId: doc.id, ...data });
        }
      });
      setProfiles(list);
    });
    return () => unsubscribe();
  }, []);

<<<<<<< HEAD
  // Listen to Real-Time Messages in the active community / DM using Firebase Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('communityId', '==', activeCommunity.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMsgs = [];
      snapshot.forEach((doc) => {
        loadedMsgs.push({ id: doc.id, ...doc.data() });
      });

      // Sort in-memory by timestamp/localTime
      loadedMsgs.sort((a, b) => {
        const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.localTime || 0);
        const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.localTime || 0);
        return timeA - timeB;
      });

      setMessages(loadedMsgs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Real-time messages error: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCommunity]);

  // Whenever messages load in active chat view, mark any unread messages as read immediately
  useEffect(() => {
    if (viewMode === 'chat' && messages.length > 0 && currentUser?.uid) {
      const unreadIds = messages
        .filter(m => m.senderId !== currentUser.uid && isMessageUnread(m, currentUser.uid))
        .map(m => m.id)
        .filter(Boolean);

      if (unreadIds.length > 0) {
        markMessagesAsReadService(unreadIds);
      }
    }
  }, [viewMode, messages, currentUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      if (viewMode === 'chat' && activeCommunity?.id) {
        setActiveConversation(activeCommunity.id);
        markConversationAsRead(activeCommunity.id, activeCommunity.recipientUid);
      } else {
        setActiveConversation(null);
      }

=======
  useEffect(() => {
    setLoading(true);
    
    // Join the community channel
    if (socket.connected) {
      socket.emit('join_community', activeCommunity.id);
    } else {
      socket.once('connect', () => {
        socket.emit('join_community', activeCommunity.id);
      });
    }

    // Listen for previous messages
    const handlePrevMessages = (msgs) => {
      const sortedMsgs = msgs.sort((a, b) => (a.localTime || 0) - (b.localTime || 0));
      setMessages(sortedMsgs);
      setLoading(false);
      setSocketError(null);
    };

    // Listen for new messages
    const handleNewMessage = (msg) => {
      setMessages((prevMsgs) => {
        if (prevMsgs.some(m => m.id === msg.id)) return prevMsgs;
        return [...prevMsgs, msg].sort((a, b) => (a.localTime || 0) - (b.localTime || 0));
      });
    };
    
    const handleConnectError = (err) => {
      setSocketError(`Connection failed: ${err.message}. Ensure backend is running.`);
      setLoading(false); // Stop buffering so user sees error
    };

    socket.on('previous_messages', handlePrevMessages);
    socket.on('receive_message', handleNewMessage);
    socket.on('connect_error', handleConnectError);

    // Timeout fallback if it takes too long
    const timeout = setTimeout(() => {
      if (loading && !socket.connected) {
        setSocketError("Connection timed out. Connecting to " + SOCKET_URL);
        setLoading(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      socket.emit('leave_community', activeCommunity.id);
      socket.off('previous_messages', handlePrevMessages);
      socket.off('receive_message', handleNewMessage);
      socket.off('connect_error', handleConnectError);
    };
  }, [activeCommunity]);

  useFocusEffect(
    useCallback(() => {
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
      const onBackPress = () => {
        if (viewMode === 'chat') {
          setViewMode('list');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

<<<<<<< HEAD
      return () => {
        setActiveConversation(null);
        subscription.remove();
      };
    }, [viewMode, activeCommunity?.id, activeCommunity?.recipientUid, markConversationAsRead])
  );

  const isConversationMuted = userNotifSettings?.mutedConversations?.includes(activeCommunity?.id);
  const isUserBlocked = activeCommunity?.isDM && activeCommunity?.recipientUid
    ? userNotifSettings?.blockedUsers?.includes(activeCommunity.recipientUid)
    : false;

  const handleToggleMuteConversation = async () => {
    if (!currentUser?.uid || !activeCommunity?.id) return;
    const currentMuted = userNotifSettings?.mutedConversations || [];
    const updatedMuted = currentMuted.includes(activeCommunity.id)
      ? currentMuted.filter(id => id !== activeCommunity.id)
      : [...currentMuted, activeCommunity.id];

    const updated = { ...userNotifSettings, mutedConversations: updatedMuted };
    setUserNotifSettings(updated);
    await saveNotificationSettings(currentUser.uid, updated);
    Alert.alert(
      currentMuted.includes(activeCommunity.id) ? 'Notifications Unmuted' : 'Notifications Muted',
      currentMuted.includes(activeCommunity.id)
        ? `You will now receive notifications for #${activeCommunity.name}.`
        : `Notifications for #${activeCommunity.name} have been muted.`
    );
  };

  const handleToggleBlockUser = async () => {
    if (!currentUser?.uid || !activeCommunity?.recipientUid) return;
    const currentBlocked = userNotifSettings?.blockedUsers || [];
    const targetUid = activeCommunity.recipientUid;
    const isBlocked = currentBlocked.includes(targetUid);
    const updatedBlocked = isBlocked
      ? currentBlocked.filter(id => id !== targetUid)
      : [...currentBlocked, targetUid];

    const updated = { ...userNotifSettings, blockedUsers: updatedBlocked };
    setUserNotifSettings(updated);
    await saveNotificationSettings(currentUser.uid, updated);
    Alert.alert(
      isBlocked ? 'User Unblocked' : 'User Blocked',
      isBlocked
        ? `${activeCommunity.name} has been unblocked.`
        : `${activeCommunity.name} has been blocked. You will not receive notifications from them.`
    );
  };

=======
      return () => subscription.remove();
    }, [viewMode])
  );

>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  const handleSendMessage = async () => {
    if (!inputText.trim() && !codeSnippet.trim()) return;

    if (!currentUser) return;

    const senderName = userProfile?.fullName || currentUser?.email?.split('@')[0] || 'Student Coder';
    const senderAvatar = userProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${currentUser?.uid}`;

    const newMessage = {
      communityId: activeCommunity.id,
<<<<<<< HEAD
      communityName: activeCommunity.name,
=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
      senderId: currentUser.uid,
      senderName,
      senderAvatar,
      text: inputText.trim(),
      codeSnippet: codeSnippet.trim() || null,
<<<<<<< HEAD
      recipientId: activeCommunity.isDM ? activeCommunity.recipientUid : null,
      read: false,
      timestamp: serverTimestamp(),
      localTime: Date.now()
=======
      // No serverTimestamp() here since it's socket-based
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    };

    setInputText('');
    setCodeSnippet('');
    setShowCodeInput(false);

    try {
<<<<<<< HEAD
      await addDoc(collection(db, 'messages'), newMessage);
    } catch (err) {
      console.error("Error writing message to Firestore: ", err);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your community.');
      return;
    }
    if (newCommName.trim().length < 3) {
      Alert.alert('Too Short', 'Community name must be at least 3 characters long.');
      return;
    }

    setCreatingComm(true);
    try {
      const trimmedName = newCommName.trim();
      const trimmedDesc = newCommDesc.trim() || `${trimmedName} is a community for developers to collaborate, share projects, and learn together.`;
      const categoryCover = CATEGORY_COVERS[newCommCategory] || CATEGORY_COVERS['General'];
      const communityAvatar = `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(trimmedName)}`;

      const newCommunityData = {
        name: trimmedName,
        description: trimmedDesc,
        category: newCommCategory,
        members: 1,
        online: '1 Online',
        badge: 1,
        img: communityAvatar,
        coverImg: categoryCover,
        createdBy: currentUser?.uid || 'anonymous',
        creatorName: userProfile?.fullName || currentUser?.email?.split('@')[0] || 'Community Leader',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'communities'), newCommunityData);

      // Post initial welcome message into the community
      await addDoc(collection(db, 'messages'), {
        communityId: docRef.id,
        senderId: currentUser?.uid || 'system',
        senderName: userProfile?.fullName || currentUser?.email?.split('@')[0] || 'Community Leader',
        senderAvatar: userProfile?.imageUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=codershub',
        text: `🎉 Welcome to ${trimmedName}! This community was created for ${newCommCategory}. Introduce yourself and start sharing!`,
        timestamp: serverTimestamp(),
        localTime: Date.now()
      });

      const createdCommunity = {
        id: docRef.id,
        ...newCommunityData
      };

      // Set active, mark joined, open chat
      setActiveCommunity(createdCommunity);
      setJoinedCommunities(prev => ({ ...prev, [docRef.id]: true }));
      setShowCreateModal(false);
      setNewCommName('');
      setNewCommDesc('');
      setNewCommCategory('Web Dev');
      setViewMode('chat');
    } catch (err) {
      console.error("Error creating community: ", err);
      Alert.alert('Creation Failed', 'Could not create community. Please try again.');
    } finally {
      setCreatingComm(false);
=======
      socket.emit('send_message', newMessage);
    } catch (err) {
      console.error(err);
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    }
  };

  const formatTime = (msg) => {
    let date = null;
    if (msg.timestamp?.toDate) {
      date = msg.timestamp.toDate();
<<<<<<< HEAD
    } else if (msg.timestamp?.seconds) {
      date = new Date(msg.timestamp.seconds * 1000);
=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    } else if (msg.localTime) {
      date = new Date(msg.localTime);
    }
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  if (viewMode === 'list') {
<<<<<<< HEAD
    const popularCommunities = allCommunities.filter(c => POPULAR_IDS.includes(c.id)).concat(
      allCommunities.filter(c => !POPULAR_IDS.includes(c.id)).slice(0, 2)
    ).slice(0, 5);

    const listCommunities = showAllCommunities ? allCommunities : allCommunities.slice(0, 5);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        {/* Header */}
        <View style={msgStyles.header}>
          <Text style={msgStyles.headerTitle}>Messages</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Create Community Button in Header */}
            <TouchableOpacity
              style={msgStyles.headerCreateBtn}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.85}
            >
              <Plus size={15} color="#ffffff" strokeWidth={3} />
              <Text style={msgStyles.headerCreateBtnText}>Create Community</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={msgStyles.bellWrap}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <Bell size={24} color="#111827" />
              <View style={msgStyles.badge3}>
                <Text style={msgStyles.badge3Text}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={msgStyles.searchRow}>
          <Search size={16} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search Messages or Communities"
            placeholderTextColor="#9ca3af"
            style={msgStyles.searchInput}
          />
        </View>

        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} showsVerticalScrollIndicator={false}>

          {/* ── Popular Communities horizontal scroll ── */}
          <View style={msgStyles.section}>
            <Text style={msgStyles.sectionLabel}>Popular communities near you</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {popularCommunities.map((community) => {
                const joined = joinedCommunities[community.id];
                return (
                  <TouchableOpacity
                    key={community.id}
                    activeOpacity={0.92}
                    onPress={() => { setActiveCommunity(community); setViewMode('chat'); }}
                  >
                    <View style={msgStyles.popularCard}>
                      <ImageBackground
                        source={{ uri: community.coverImg }}
                        style={msgStyles.popularImage}
                        imageStyle={msgStyles.popularImageStyle}
                      >
                        <View style={msgStyles.popularOverlay} />
                        <View style={msgStyles.popularInfo}>
                          <Text style={msgStyles.popularName} numberOfLines={2}>{community.name}</Text>
                          <Text style={msgStyles.popularMembers}>{community.members} members</Text>
                        </View>
                      </ImageBackground>
                      <TouchableOpacity
                        style={[msgStyles.popularJoinBtn, joined && msgStyles.popularJoinBtnJoined]}
                        onPress={() => setJoinedCommunities(prev => ({ ...prev, [community.id]: !prev[community.id] }))}
                        activeOpacity={0.8}
                      >
                        {joined ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Check size={13} color="#0a66c2" strokeWidth={3} />
                            <Text style={msgStyles.popularJoinedText}>Joined</Text>
                          </View>
                        ) : (
                          <Text style={msgStyles.popularJoinText}>Join</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Communities List ── */}
          <View style={[msgStyles.section, { marginTop: 12 }]}>
            <View style={msgStyles.sectionHeaderRow}>
              <Text style={msgStyles.sectionLabel}>Your Communities</Text>
              {/* Secondary Create Community button in section header */}
              <TouchableOpacity
                style={msgStyles.createLink}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
              >
                <Plus size={14} color="#0a66c2" strokeWidth={2.5} style={{ marginRight: 4 }} />
                <Text style={msgStyles.createLinkText}>New Community</Text>
              </TouchableOpacity>
            </View>

            {listCommunities.map((community) => {
              const joined = joinedCommunities[community.id];
              return (
                <TouchableOpacity
                  key={community.id}
                  style={msgStyles.listRow}
                  onPress={() => { setActiveCommunity(community); setViewMode('chat'); }}
                  activeOpacity={0.75}
                >
                  <Image source={{ uri: community.img }} style={msgStyles.listThumb} resizeMode="cover" />
                  <View style={msgStyles.listInfo}>
                    <Text style={msgStyles.listName} numberOfLines={1}>{community.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                      <Users size={12} color="#6b7280" />
                      <Text style={msgStyles.listMembers}> {community.members} members • {community.online}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {community.badge ? (
                      <View style={msgStyles.badgePill}>
                        <Text style={msgStyles.badgePillText}>{community.badge}</Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      style={[msgStyles.joinBtn, joined && msgStyles.joinBtnJoined]}
                      onPress={() => setJoinedCommunities(prev => ({ ...prev, [community.id]: !prev[community.id] }))}
                      activeOpacity={0.8}
                    >
                      {joined ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Check size={11} color="#0a66c2" strokeWidth={3} />
                          <Text style={msgStyles.joinBtnJoinedText}>Joined</Text>
                        </View>
                      ) : (
                        <Text style={msgStyles.joinBtnText}>Join</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            {allCommunities.length > 5 && (
              <TouchableOpacity
                style={msgStyles.moreBtn}
                onPress={() => setShowAllCommunities(!showAllCommunities)}
              >
                <Text style={msgStyles.moreBtnText}>{showAllCommunities ? 'Less' : `More (${allCommunities.length - 5} more)`}</Text>
                <ChevronDown size={16} color="#111827" style={{ transform: [{ rotate: showAllCommunities ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Divider ── */}
          <View style={msgStyles.divider} />

          {/* ── Direct Messages (Only Accepted Connections) ── */}
          <View style={[msgStyles.section, { backgroundColor: '#ffffff', marginTop: 0 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[msgStyles.sectionLabel, { color: '#6b7280', fontSize: 12, marginBottom: 0, paddingHorizontal: 0 }]}>
                  DIRECT MESSAGES
                </Text>
                {totalUnreadDMs > 0 && (
                  <View style={msgStyles.dmTotalHeaderBadge}>
                    <Text style={msgStyles.dmTotalHeaderBadgeText}>{totalUnreadDMs}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Connect')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.8}
              >
                <UserCheck size={13} color="#0a66c2" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0a66c2' }}>Add Connections</Text>
              </TouchableOpacity>
            </View>

            {acceptedDirectChats.length === 0 ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 18, alignItems: 'center' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Users size={22} color="#0a66c2" />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                  No Direct Messages Yet
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 17, marginBottom: 12, paddingHorizontal: 16 }}>
                  Direct messages only appear after your connection request is accepted. You can message anytime in our open Community channels!
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Connect')}
                  style={{ backgroundColor: '#0a66c2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Find & Connect Coders</Text>
                </TouchableOpacity>
              </View>
            ) : (
              acceptedDirectChats.map((chat) => {
                const { unreadCount, latestMessage, dmId } = getDMInfo(chat.otherUid);
                const hasUnread = unreadCount > 0;

                // Format display time
                let displayTime = '';
                if (latestMessage) {
                  const msgDate = latestMessage.timestamp?.seconds
                    ? new Date(latestMessage.timestamp.seconds * 1000)
                    : (latestMessage.localTime ? new Date(latestMessage.localTime) : null);
                  if (msgDate) {
                    const isToday = new Date().toDateString() === msgDate.toDateString();
                    displayTime = isToday
                      ? msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : msgDate.toLocaleDateString();
                  }
                } else if (chat.lastActive) {
                  displayTime = new Date(chat.lastActive.toDate ? chat.lastActive.toDate() : chat.lastActive).toLocaleDateString();
                } else {
                  displayTime = 'Connected';
                }

                return (
                  <TouchableOpacity
                    key={chat.connectionId}
                    style={[msgStyles.dmRow, hasUnread && msgStyles.dmRowUnread]}
                    onPress={() => {
                      if (!currentUser) return;
                      const dmMsgIds = incomingDirectMessages
                        .filter(m => (m.communityId === dmId || m.senderId === chat.otherUid))
                        .map(m => m.id)
                        .filter(Boolean);
                      markConversationAsRead(dmId, chat.otherUid);
                      if (dmMsgIds.length > 0) {
                        markMessagesAsReadService(dmMsgIds);
                      }
                      setActiveCommunity({
                        id: dmId,
                        name: chat.name,
                        members: 'Direct Message',
                        online: chat.isOnline ? 'Online' : 'Offline',
                        img: chat.avatar,
                        isDM: true,
                        recipientUid: chat.otherUid
                      });
                      setViewMode('chat');
                    }}
                    activeOpacity={0.75}
                  >
                    {/* Avatar with unread indicator dot */}
                    <View style={{ position: 'relative', marginRight: 14 }}>
                      <Image source={{ uri: chat.avatar }} style={msgStyles.dmAvatar} />
                      {chat.isOnline && <View style={msgStyles.onlineDot} />}
                      {hasUnread && <View style={msgStyles.dmAvatarUnreadDot} />}
                    </View>

                    {/* Details: Name, Time, Preview, and Unread Count Badge */}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <Text style={[msgStyles.dmName, hasUnread && msgStyles.dmNameUnread]} numberOfLines={1}>
                          {chat.name}
                        </Text>
                        <Text style={[msgStyles.dmTime, hasUnread && msgStyles.dmTimeUnread]}>
                          {displayTime}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                          style={[
                            msgStyles.dmPreview,
                            hasUnread && msgStyles.dmPreviewUnread,
                            { flex: 1, marginRight: 8 }
                          ]}
                          numberOfLines={1}
                        >
                          {latestMessage?.text || 'Tap to open direct chat'}
                        </Text>

                        {/* Unread Message Notification Badge (1, 2, 3...) */}
                        {hasUnread && (
                          <View style={msgStyles.dmNotificationBadge}>
                            <Text style={msgStyles.dmNotificationBadgeText}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* ── Create Community Modal ── */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setShowCreateModal(false)}
            />
            <View style={msgStyles.modalContainer}>
              {/* Modal Handle & Header */}
              <View style={msgStyles.modalHeader}>
                <View style={msgStyles.modalHandle} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Users size={20} color="#0a66c2" />
                    <Text style={msgStyles.modalTitle}>Create a Community</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowCreateModal(false)}
                    style={msgStyles.modalCloseBtn}
                  >
                    <X size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Live Preview Avatar */}
                <View style={msgStyles.previewWrap}>
                  <Image
                    source={{
                      uri: newCommName.trim()
                        ? `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(newCommName.trim())}`
                        : 'https://api.dicebear.com/7.x/shapes/png?seed=new-community'
                    }}
                    style={msgStyles.previewAvatar}
                  />
                  <Text style={msgStyles.previewHint}>
                    {newCommName.trim() || 'Your Community Name'}
                  </Text>
                </View>

                {/* Input: Name */}
                <Text style={msgStyles.inputLabel}>Community Name *</Text>
                <TextInput
                  value={newCommName}
                  onChangeText={setNewCommName}
                  placeholder="e.g. Next.js Developers, CyberSec Hub"
                  placeholderTextColor="#9ca3af"
                  style={msgStyles.textInput}
                  maxLength={40}
                />

                {/* Category Selector */}
                <Text style={msgStyles.inputLabel}>Category / Field</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewCommCategory(cat)}
                      style={[
                        msgStyles.catChip,
                        newCommCategory === cat && msgStyles.catChipActive
                      ]}
                    >
                      <Text
                        style={[
                          msgStyles.catChipText,
                          newCommCategory === cat && msgStyles.catChipTextActive
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Input: Description */}
                <Text style={[msgStyles.inputLabel, { marginTop: 14 }]}>Description</Text>
                <TextInput
                  value={newCommDesc}
                  onChangeText={setNewCommDesc}
                  placeholder="What is this community about? Share discussions, projects, resources..."
                  placeholderTextColor="#9ca3af"
                  style={[msgStyles.textInput, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]}
                  multiline
                  maxLength={200}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  style={[msgStyles.createSubmitBtn, creatingComm && { opacity: 0.7 }]}
                  onPress={handleCreateCommunity}
                  disabled={creatingComm}
                  activeOpacity={0.85}
                >
                  {creatingComm ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Plus size={18} color="#ffffff" strokeWidth={3} />
                      <Text style={msgStyles.createSubmitBtnText}>Create & Open Community</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
=======
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-4 pt-4 pb-2 mt-4 flex-row justify-between items-center">
          <Text className="text-[28px] font-bold text-gray-900 tracking-tight">Messages</Text>
          <TouchableOpacity className="relative mr-2 mt-1">
            <View className="w-6 h-6 items-center justify-center">
              <Bell size={24} color="#111827" />
            </View>
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="px-4 mb-4 mt-2">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5">
            <Search size={20} color="#9ca3af" />
            <TextInput 
              placeholder="Search Messages" 
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-2 text-[15px] text-gray-900" 
            />
          </View>
        </View>
        
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <Text className="text-[12px] text-gray-600 mb-4 pl-1">COMMUNITIES</Text>
          {COMMUNITIES_LIST.slice(0, showAllCommunities ? undefined : 4).map((community, index) => {
            return (
              <TouchableOpacity 
                key={community.id}
                className="flex-row items-center py-2 px-1 mb-3"
                onPress={() => {
                  setActiveCommunity(community);
                  setViewMode('chat');
                }}
              >
                <Image 
                  source={{ uri: community.img }} 
                  className="w-[46px] h-[46px] rounded-xl bg-gray-100 mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1 justify-center">
                  <Text className="text-[16px] font-semibold text-gray-900 mb-0.5">
                    {community.name}
                  </Text>
                  <Text className="text-[13px] text-gray-500">
                    {community.members} • {community.online}
                  </Text>
                </View>
                {community.badge && (
                  <View className="w-6 h-6 rounded-full bg-[#0a66c2] items-center justify-center">
                    <Text className="text-white text-xs font-bold">{community.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity 
            className="flex-row justify-center items-center py-2 mb-4"
            onPress={() => setShowAllCommunities(!showAllCommunities)}
          >
            <Text className="text-[13px] font-medium text-gray-900 mr-1">{showAllCommunities ? "Less" : "More"}</Text>
            <ChevronDown size={16} color="#111827" style={{ transform: [{ rotate: showAllCommunities ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
          
          <View className="h-[1px] bg-gray-200 mb-4" />
          
          <Text className="text-[12px] text-gray-600 mb-4 pl-1">
            DIRECT MESSAGES
          </Text>
          
          {profiles.filter(p => p.uid !== currentUser?.uid).map((profile, idx) => {
            const avatarUrl = profile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=random&color=fff&size=128`;
            return (
              <TouchableOpacity 
                key={`${profile.uid}_${idx}`} 
                className="flex-row items-center py-2 px-1 mb-3"
                onPress={() => {
                  if (!currentUser) return;
                  const dmId = [currentUser.uid, profile.uid].sort().join('_');
                  setActiveCommunity({
                    id: `dm_${dmId}`,
                    name: profile.fullName || 'Anonymous',
                    members: 'Direct Message',
                    online: isUserOnline(profile) ? 'Online' : 'Offline',
                    img: avatarUrl,
                    isDM: true
                  });
                  setViewMode('chat');
                }}
              >
                <View className="relative mr-4">
                  <Image source={{uri: avatarUrl}} className="w-[48px] h-[48px] rounded-full bg-gray-100" />
                  {isUserOnline(profile) && (
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10b981] rounded-full border-2 border-white" />
                  )}
                </View>
                <View className="flex-1 justify-center">
                  <View className="flex-row justify-between items-center mb-0.5">
                    <Text className="text-[16px] font-semibold text-gray-900">{profile.fullName || 'Anonymous'}</Text>
                    <Text className="text-[12px] font-medium text-gray-500">
                      {profile.lastActive ? new Date(profile.lastActive.toDate ? profile.lastActive.toDate() : profile.lastActive).toLocaleDateString() : 'New'}
                    </Text>
                  </View>
                  <Text className="text-[14px] text-gray-500" numberOfLines={1}>Hey! Let's connect.</Text>
                </View>
              </TouchableOpacity>
            )
          })}
          <View className="h-8" />
        </ScrollView>
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        className="flex-1 bg-white"
      >
      {/* Header */}
      <View className="pt-2 pb-3 px-4 border-b border-gray-100 bg-white flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => setViewMode('list')} className="mr-3">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Image 
            source={{ uri: userProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${currentUser?.uid}` }} 
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100" 
          />
        </View>
        <View className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-100 max-w-[65%]">
          <Hash size={16} color="#0a66c2" style={{ marginRight: 6 }} />
<<<<<<< HEAD
          <Text className="text-gray-900 font-bold text-sm tracking-wide" numberOfLines={1}>
            {activeCommunity.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          {/* Mute/Unmute Action Button */}
          <TouchableOpacity
            onPress={handleToggleMuteConversation}
            className="p-1.5 mr-1 bg-gray-50 rounded-full"
            accessibilityLabel={isConversationMuted ? "Unmute notifications" : "Mute notifications"}
          >
            {isConversationMuted ? (
              <VolumeX size={18} color="#ef4444" />
            ) : (
              <Volume2 size={18} color="#4b5563" />
            )}
          </TouchableOpacity>

          {/* Block User for Direct Messages */}
          {activeCommunity.isDM && activeCommunity.recipientUid ? (
            <TouchableOpacity
              onPress={handleToggleBlockUser}
              className="p-1.5 mr-1 bg-gray-50 rounded-full"
              accessibilityLabel={isUserBlocked ? "Unblock user" : "Block user"}
            >
              <UserX size={18} color={isUserBlocked ? "#ef4444" : "#4b5563"} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity 
            onPress={() => navigation.navigate('NotificationSettings')} 
            className="p-1.5 bg-gray-50 rounded-full"
          >
            <Bell size={18} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Header for community details */}
      <View className="bg-gray-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-100">
        <Text className="text-xs text-gray-500 font-medium">
          {activeCommunity.members ? (typeof activeCommunity.members === 'number' ? `${activeCommunity.members} members` : activeCommunity.members) : 'Community Channel'}
        </Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
          <Text className="text-xs text-gray-500 font-medium">{activeCommunity.online || 'Active'}</Text>
        </View>
      </View>

      {/* Messages ScrollView */}
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        className="flex-1 px-4 py-3 bg-[#f8fafc]"
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#0a66c2" />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3">
              <Hash size={32} color="#0a66c2" />
            </View>
            <Text className="text-gray-800 font-bold text-base mb-1">Welcome to #{activeCommunity.name}!</Text>
            <Text className="text-gray-400 text-xs text-center px-8">
              This is the start of the community discussion. Send a message or code snippet to begin!
            </Text>
          </View>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser?.uid;

            return (
              <View 
                key={msg.id || index} 
                className={clsx(
                  "flex-row mb-4 items-end",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                {!isMe && (
                  <Image 
                    source={{ uri: msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} 
                    className="w-8 h-8 rounded-full bg-gray-200 mr-2 border border-gray-100" 
                  />
                )}
                
                <View className={clsx(
                  "max-w-[80%]",
                  isMe ? "items-end" : "items-start"
                )}>
                  {!isMe && (
                    <Text className="text-[11px] font-semibold text-gray-500 ml-1 mb-1">
                      {msg.senderName}
                    </Text>
                  )}
                  
                  {/* Bubble Content */}
                  <View className={clsx(
                    "p-3 rounded-2xl shadow-sm",
                    isMe 
                      ? "bg-[#0a66c2] rounded-br-none" 
                      : "bg-white rounded-bl-none border border-gray-100"
                  )}>
                    {/* Text Message */}
                    {msg.text ? (
                      <Text className={clsx(
                        "text-sm leading-5",
                        isMe ? "text-white" : "text-gray-800"
                      )}>
                        {msg.text}
                      </Text>
                    ) : null}

                    {/* Code Snippet Box */}
                    {msg.codeSnippet ? (
                      <View className={clsx(
                        "mt-2 p-2.5 rounded-lg border",
                        isMe 
                          ? "bg-blue-700/60 border-blue-400" 
                          : "bg-gray-900 border-gray-700"
                      )}>
                        <View className="flex-row items-center justify-between pb-1 border-b border-gray-600/40 mb-1.5">
                          <Text className="text-[10px] text-gray-300 font-mono font-bold tracking-wider uppercase">
                            CODE SNIPPET
                          </Text>
                          <Code size={12} color="#9ca3af" />
                        </View>
                        <Text className="font-mono text-xs text-green-300 leading-4">
                          {msg.codeSnippet}
                        </Text>
                      </View>
                    ) : null}

                    {/* Timestamp */}
                    <Text className={clsx(
                      "text-[9px] mt-1 text-right",
                      isMe ? "text-blue-100" : "text-gray-400"
                    )}>
                      {formatTime(msg)}
                    </Text>
                  </View>
                </View>

                {isMe && (
                  <Image 
                    source={{ uri: msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} 
                    className="w-8 h-8 rounded-full bg-gray-200 ml-2 border border-gray-100" 
                  />
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Code Input Toggle Drawer */}
      {showCodeInput && (
        <View className="bg-gray-900 p-3 border-t border-gray-800">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Code size={14} color="#60a5fa" style={{ marginRight: 6 }} />
              <Text className="text-white text-xs font-semibold">Share Code Snippet</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCodeInput(false)}>
              <Text className="text-gray-400 text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            multiline
            numberOfLines={4}
            value={codeSnippet}
            onChangeText={setCodeSnippet}
            placeholder="// Paste or write your code here..."
            placeholderTextColor="#6b7280"
            className="bg-gray-800 text-green-400 font-mono text-xs p-2.5 rounded-lg border border-gray-700 h-24"
            textAlignVertical="top"
          />
        </View>
      )}

      {/* Input Row */}
      <View className="p-3 bg-white border-t border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => setShowCodeInput(!showCodeInput)}
          className={clsx(
            "p-2 rounded-full mr-2",
            showCodeInput ? "bg-blue-100" : "bg-gray-100"
          )}
        >
          <Code size={20} color={showCodeInput ? "#0a66c2" : "#4b5563"} />
        </TouchableOpacity>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Message #${activeCommunity.name}...`}
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-800 max-h-24 mr-2"
          multiline
        />

        <TouchableOpacity 
          onPress={handleSendMessage}
          disabled={!inputText.trim() && !codeSnippet.trim()}
          className={clsx(
            "p-2.5 rounded-full",
            (inputText.trim() || codeSnippet.trim()) ? "bg-[#0a66c2]" : "bg-gray-200"
          )}
        >
          <Send size={16} color={(inputText.trim() || codeSnippet.trim()) ? "white" : "#9ca3af"} />
        </TouchableOpacity>
=======
          <Text className="font-bold text-[#0a66c2] text-sm" numberOfLines={1}>{activeCommunity.name}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        className="flex-1 bg-gray-50 px-4 pt-4"
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a66c2" />
            <Text className="mt-4 text-gray-500">Connecting to real-time chat...</Text>
          </View>
        ) : socketError ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-red-500 text-center px-4 font-medium mb-2">{socketError}</Text>
            <TouchableOpacity 
              className="bg-blue-100 px-4 py-2 rounded-full mt-2"
              onPress={() => {
                setLoading(true);
                setSocketError(null);
                socket.connect();
              }}
            >
              <Text className="text-blue-700 font-bold">Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <View key={msg.id} className={clsx("flex-row mb-4", isMe && "justify-end")}>
                {!isMe && (
                  <Image source={{ uri: msg.senderAvatar }} className="w-8 h-8 rounded-full mr-2" />
                )}
                <View className={clsx("max-w-[80%]", isMe && "items-end")}>
                  {!isMe && (
                    <View className="flex-row items-baseline mb-1">
                      <Text className="font-semibold text-gray-900 text-xs mr-2">{msg.senderName}</Text>
                      <Text className="text-[10px] text-gray-400">{formatTime(msg)}</Text>
                    </View>
                  )}
                  {msg.text ? (
                    <View className={clsx(
                      "p-3 rounded-2xl shadow-sm border",
                      isMe 
                        ? "bg-[#0a66c2] border-blue-600 rounded-tr-none" 
                        : "bg-white border-gray-200 rounded-tl-none"
                    )}>
                      <Text className={clsx(isMe ? "text-white" : "text-gray-800")}>{msg.text}</Text>
                    </View>
                  ) : null}
                  {msg.codeSnippet ? (
                    <View className="bg-[#1e1e1e] p-3 rounded-xl mt-1">
                      <Text className="text-green-400 font-mono text-xs">{msg.codeSnippet}</Text>
                    </View>
                  ) : null}
                  {isMe && (
                    <Text className="text-[10px] text-gray-400 mt-1">{formatTime(msg)}</Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20">
            <Hash size={40} color="#d1d5db" />
            <Text className="font-semibold text-gray-500 mt-2">No messages in #{activeCommunity.name}</Text>
          </View>
        )}
      </ScrollView>

      {/* Instagram-Style Composer */}
      <View className="border-t border-gray-200 bg-white pb-2 pt-3 px-4">
        {showCodeInput && (
          <View className="mb-2 relative">
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Paste code snippet..."
              className="bg-[#1e1e1e] text-green-400 p-3 rounded-lg font-mono text-xs"
              style={{ textAlignVertical: 'top' }}
              value={codeSnippet}
              onChangeText={setCodeSnippet}
            />
            <TouchableOpacity 
              className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded"
              onPress={() => setShowCodeInput(false)}
            >
              <Text className="text-white text-xs">Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Emojis */}
        <View className="flex-row justify-between px-2 mb-3">
          {['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'].map(emoji => (
            <TouchableOpacity key={emoji} onPress={() => setInputText(prev => prev + emoji)}>
              <Text className="text-2xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Input Row */}
        <View className="flex-row items-center">
          <Image source={{ uri: userProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${currentUser?.uid}` }} className="w-10 h-10 rounded-full mr-3 bg-gray-100 border border-gray-200" />
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-full pl-4 pr-1 py-1 bg-gray-50">
            <TextInput 
              className="flex-1 py-1 text-sm max-h-24 min-h-[32px]"
              placeholder={`Message #${activeCommunity.name}...`}
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity className="border border-gray-400 rounded px-1.5 py-0.5 mx-2 bg-white">
              <Text className="text-[10px] font-bold text-gray-600">GIF</Text>
            </TouchableOpacity>
            {inputText.trim() || codeSnippet.trim() ? (
              <TouchableOpacity onPress={handleSendMessage} className="p-1 mx-1">
                <Send size={18} color="#0a66c2" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => setShowCodeInput(!showCodeInput)} className="ml-3 p-1">
            <Code size={24} color={showCodeInput ? "#0a66c2" : "#4b5563"} />
          </TouchableOpacity>
          <TouchableOpacity className="ml-2 p-1">
            <Gift size={24} color="#4b5563" />
          </TouchableOpacity>
        </View>
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
<<<<<<< HEAD

// ─── Styles for redesigned list view & modal ──────────────────────────────────
const PRIMARY = '#0a66c2';

const msgStyles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  headerCreateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  bellWrap: { position: 'relative', padding: 4 },
  badge3: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#ef4444', borderRadius: 10,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badge3Text: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111827', padding: 0 },

  // Sections
  section: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  createLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },

  // Popular cover cards
  popularCard: {
    width: 185,
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  popularImage: { flex: 1, justifyContent: 'flex-start' },
  popularImageStyle: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  popularOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  popularInfo: { padding: 12, paddingTop: 14 },
  popularName: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  popularMembers: { color: '#d1d5db', fontSize: 12, marginTop: 4 },
  popularJoinBtn: {
    backgroundColor: PRIMARY,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  popularJoinBtnJoined: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  popularJoinText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  popularJoinedText: { color: PRIMARY, fontSize: 14, fontWeight: '700' },

  // List rows
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  listInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  listName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  listMembers: { fontSize: 12, color: '#6b7280' },

  // Notification badge pill
  badgePill: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgePillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Join button on list rows
  joinBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
  },
  joinBtnJoined: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  joinBtnJoinedText: { color: PRIMARY, fontSize: 13, fontWeight: '700' },

  // More button
  moreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  moreBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

  // Divider
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },

  // DM rows
  dmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  dmRowUnread: {
    backgroundColor: '#f8fafc',
  },
  dmAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 13, height: 13,
    backgroundColor: '#10b981',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dmAvatarUnreadDot: {
    position: 'absolute', top: -1, right: -1,
    width: 14, height: 14,
    backgroundColor: '#0a66c2',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  dmName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  dmNameUnread: { fontWeight: '800', color: '#0f172a' },
  dmTime: { fontSize: 12, color: '#6b7280' },
  dmTimeUnread: { color: '#0a66c2', fontWeight: '700' },
  dmPreview: { fontSize: 13, color: '#6b7280' },
  dmPreviewUnread: { color: '#1e293b', fontWeight: '700' },
  dmNotificationBadge: {
    backgroundColor: '#0a66c2',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  dmNotificationBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  dmTotalHeaderBadge: {
    backgroundColor: '#0a66c2',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmTotalHeaderBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },

  // Modal styles
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  modalHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  previewWrap: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  previewHint: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  catChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: PRIMARY,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  catChipTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  createSubmitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  createSubmitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
