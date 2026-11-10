import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Briefcase, GraduationCap, Users, MessageSquare, Plus, Code, Bell, UserCheck } from 'lucide-react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { View, ActivityIndicator, TouchableOpacity, Image, Text } from 'react-native';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import FeedScreen from '../screens/FeedScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import WorkshopsScreen from '../screens/WorkshopsScreen';
import ConnectStudentsScreen from '../screens/ConnectStudentsScreen';
import ProfileDashboardScreen from '../screens/ProfileDashboardScreen';
import MessagesScreen from '../screens/MessagesScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import StartupHub from '../pages/StartupHub';
import { navigationRef } from './navigationRef';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  displayInAppNotification,
  getNotificationSettings
} from '../services/notificationService';
import {
  initUnreadService,
  subscribeToUnreadUpdates,
  markAllDirectMessagesAsRead,
  isMessageUnread
} from '../services/unreadMessageService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dummy component for the AddPost tab
const DummyComponent = () => null;

function TabNavigator({ navigation }) {
  const [avatar, setAvatar] = useState('https://randomuser.me/api/portraits/men/46.jpg');
  const [unreadDMsCount, setUnreadDMsCount] = useState(0);
  const cachedMessagesRef = useRef([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Initialize the shared unread service
    initUnreadService(user.uid).then(() => {
      recomputeCount();
    }).catch(console.error);

    const q = query(collection(db, 'profiles'), where('uid', '==', user.uid));
    getDocs(q).then(querySnapshot => {
      if (!querySnapshot.empty) {
        setAvatar(querySnapshot.docs[0].data().imageUrl || 'https://randomuser.me/api/portraits/men/46.jpg');
      }
    }).catch(console.error);

    const recomputeCount = () => {
      let count = 0;
      cachedMessagesRef.current.forEach(msg => {
        if (isMessageUnread(msg, user.uid)) {
          count++;
        }
      });
      setUnreadDMsCount(count);
    };

    // React immediately when conversations or all DMs are marked as read
    const unsubUpdates = subscribeToUnreadUpdates(() => {
      recomputeCount();
    });

    // Real-time unread messages listener for bottom tab bar badge
    const unreadQ = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid)
    );
    const unsub = onSnapshot(unreadQ, (snapshot) => {
      cachedMessagesRef.current = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      recomputeCount();
    }, (err) => console.log('Unread tab badge note:', err?.message));

    return () => {
      unsubUpdates();
      unsub();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerTitle: '',
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }}>
            <Image source={require('../../assets/images/logo.jpg')} style={{ width: 30, height: 30, marginRight: 8 }} resizeMode="contain" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0a66c2' }}>CodersHub</Text>
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Connect')} style={{ marginRight: 16 }}>
              <UserCheck size={24} color="#4b5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')} style={{ marginRight: 16 }}>
              <Bell size={24} color="#4b5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                source={{ uri: avatar }}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb' }}
              />
            </TouchableOpacity>
          </View>
        ),
        tabBarIcon: ({ color, size }) => {
          let IconComponent;
          if (route.name === 'Feed') IconComponent = Home;
          else if (route.name === 'Projects') IconComponent = Briefcase;
          else if (route.name === 'Messages') IconComponent = MessageSquare;
          else if (route.name === 'Profile') IconComponent = UserCheck;

          if (IconComponent) {
            return <IconComponent size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: '#0a66c2',
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />

      {/* Floating Plus Button (Centered) */}
      <Tab.Screen
        name="AddPost"
        component={DummyComponent}
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#0a66c2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5
            }}>
              <Plus size={24} color="white" />
            </View>
          ),
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={[props.style, { justifyContent: 'center', alignItems: 'center' }]}
              onPress={() => navigation.navigate('CreatePostModal')}
            />
          )
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        listeners={{
          tabPress: () => {
            const ids = cachedMessagesRef.current.map(m => m.id).filter(Boolean);
            markAllDirectMessagesAsRead(ids);
            setUnreadDMsCount(0);
          }
        }}
        options={{
          headerShown: false,
          tabBarBadge: unreadDMsCount > 0 ? unreadDMsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#0a66c2', color: '#ffffff', fontSize: 10, fontWeight: 'bold' }
        }}
      />
      <Tab.Screen name="Profile" component={ProfileDashboardScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let notifCleanup = null;
    let messagesUnsub = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Register device push token and notification channel
        registerForPushNotificationsAsync(currentUser);

        // Setup tap listener to navigate directly into chats
        notifCleanup = setupNotificationListeners();

        // Fetch current user notification settings
        const settings = await getNotificationSettings(currentUser.uid);

        // Listen for incoming messages to trigger foreground / in-app notifications
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef);
        const initialMountTime = Date.now();

        messagesUnsub = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const msgData = change.doc.data();
              const msgId = change.doc.id;

              // Ignore messages sent prior to current session
              const msgTime = msgData.timestamp?.seconds ? msgData.timestamp.seconds * 1000 : (msgData.localTime || 0);
              if (msgTime < initialMountTime - 5000) return;

              // Don't notify the sender themselves
              if (msgData.senderId === currentUser.uid) return;

              // For DM: only notify if this user is a participant or recipient
              if (msgData.communityId?.startsWith('dm_')) {
                const isParticipant = msgData.communityId.includes(currentUser.uid) || msgData.recipientId === currentUser.uid;
                if (!isParticipant) return;
              }

              // Display notification if on another screen and not muted/blocked
              displayInAppNotification({
                messageId: msgId,
                conversationId: msgData.communityId,
                conversationName: msgData.communityName || msgData.senderName,
                senderId: msgData.senderId,
                senderName: msgData.senderName,
                text: msgData.text,
                hasImage: !!msgData.imageUrl,
                settings,
              });
            }
          });
        }, (err) => console.log('Messages listener error:', err));
      } else {
        if (messagesUnsub) messagesUnsub();
        if (notifCleanup) notifCleanup();
      }
    });

    return () => {
      unsubscribeAuth();
      if (messagesUnsub) messagesUnsub();
      if (notifCleanup) notifCleanup();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a66c2" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Profile" component={ProfileDashboardScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen 
              name="Connect" 
              component={ConnectStudentsScreen} 
              options={{ 
                headerShown: true, 
                headerTitle: 'Connections',
                headerBackTitleVisible: false,
                headerTintColor: '#0a66c2',
              }} 
            />
            <Stack.Screen
              name="CreatePostModal"
              component={CreatePostScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="StartupHub" 
              component={StartupHub} 
              options={{ 
                headerShown: true, 
                headerTitle: 'Startup Hub',
                headerBackTitleVisible: false,
                headerTintColor: '#0a66c2',
              }} 
            />
            <Stack.Screen 
              name="ProjectDetails" 
              component={ProjectDetailsScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
