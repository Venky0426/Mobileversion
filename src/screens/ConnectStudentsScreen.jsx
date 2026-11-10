import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal
} from 'react-native';
import {
  Search,
  Filter,
  UserPlus,
  Check,
  X,
  Clock,
  MessageSquare,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Eye,
  UserCheck
} from 'lucide-react-native';
import { auth, db } from '../firebase';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

const DOMAIN_FILTERS = ['All', 'Web Dev', 'AI & ML', 'Mobile Dev', 'Blockchain', 'Cybersecurity', 'Cloud'];

export default function ConnectStudentsScreen({ navigation, route }) {
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Detail Modal State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [activeTab, setActiveTab] = useState(route?.params?.tab || 'all'); // 'all', 'pending', 'connected'

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  const currentUser = auth.currentUser;

  // 1. Fetch current user profile
  useEffect(() => {
    if (!currentUser) return;
    const fetchMyProfile = async () => {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        snap.forEach((d) => {
          if (d.data().uid === currentUser.uid) {
            setCurrentUserProfile(d.data());
          }
        });
      } catch (e) {
        console.log('Error fetching current profile:', e);
      }
    };
    fetchMyProfile();
  }, [currentUser]);

  // 2. Real-time subscription to all registered developer profiles
  useEffect(() => {
    const q = collection(db, 'profiles');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      const seenUids = new Set();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.uid && data.uid !== currentUser?.uid && !seenUids.has(data.uid)) {
          seenUids.add(data.uid);
          list.push({ docId: docSnap.id, ...data });
        }
      });

      setProfiles(list);
      setLoading(false);
    }, (err) => {
      console.log('Profiles subscription error:', err?.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Real-time subscription to connection requests involving current user
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
      console.log('Connections subscription error:', err?.message);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Build a lookup map of connection state with each target user
  const connectionsMap = {};
  connections.forEach((conn) => {
    const otherUid = conn.users.find(u => u !== currentUser?.uid);
    if (otherUid) {
      connectionsMap[otherUid] = conn;
    }
  });

  // Calculate pending incoming requests count
  const incomingRequests = connections.filter(
    c => c.status === 'pending' && c.receiverId === currentUser?.uid
  );

  const outgoingRequests = connections.filter(
    c => c.status === 'pending' && c.senderId === currentUser?.uid
  );

  // Enriched incoming request person items
  const incomingRequestPersons = incomingRequests.map(c => {
    const senderProfile = profiles.find(p => p.uid === c.senderId);
    return {
      uid: c.senderId,
      fullName: senderProfile?.fullName || c.senderName || 'Developer',
      imageUrl: senderProfile?.imageUrl || c.senderAvatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${c.senderId}`,
      college: senderProfile?.college || 'Student Developer',
      domains: senderProfile?.domains || (senderProfile?.domain ? [senderProfile.domain] : ['Developer']),
      bio: senderProfile?.bio || 'Sent you a connection request. Connect to start direct messaging!',
      email: senderProfile?.email || '',
      connection: c,
      connectionId: c.id,
      isIncoming: true,
      status: 'pending',
      createdAt: c.createdAt
    };
  });

  // Enriched outgoing request person items
  const outgoingRequestPersons = outgoingRequests.map(c => {
    const receiverProfile = profiles.find(p => p.uid === c.receiverId);
    return {
      uid: c.receiverId,
      fullName: receiverProfile?.fullName || c.receiverName || 'Developer',
      imageUrl: receiverProfile?.imageUrl || c.receiverAvatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${c.receiverId}`,
      college: receiverProfile?.college || 'Student Developer',
      domains: receiverProfile?.domains || (receiverProfile?.domain ? [receiverProfile.domain] : ['Developer']),
      bio: receiverProfile?.bio || '',
      email: receiverProfile?.email || '',
      connection: c,
      connectionId: c.id,
      isOutgoing: true,
      status: 'pending',
      createdAt: c.createdAt
    };
  });

  // Open full Profile modal for any developer / requester
  const handleOpenProfile = (userItem) => {
    if (!userItem) return;
    const conn = connectionsMap[userItem.uid] || userItem.connection;
    const matchingProfile = profiles.find(p => p.uid === userItem.uid);

    const isConnected = conn?.status === 'accepted';
    const isIncoming = conn ? (conn.status === 'pending' && conn.receiverId === currentUser?.uid) : !!userItem.isIncoming;
    const isOutgoing = conn ? (conn.status === 'pending' && conn.senderId === currentUser?.uid) : !!userItem.isOutgoing;

    setSelectedProfile({
      uid: userItem.uid,
      fullName: userItem.fullName || userItem.name || matchingProfile?.fullName || 'Developer',
      imageUrl: userItem.imageUrl || userItem.image || matchingProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${userItem.uid}`,
      college: userItem.college || matchingProfile?.college || 'Student Developer',
      domains: userItem.domains || matchingProfile?.domains || (matchingProfile?.domain ? [matchingProfile.domain] : ['Developer']),
      bio: userItem.bio || matchingProfile?.bio || (isIncoming ? 'Sent you a connection request. Connect to start direct messaging!' : ''),
      email: userItem.email || matchingProfile?.email || '',
      connection: conn,
      connectionId: conn?.id || userItem.connectionId,
      status: conn?.status || (isIncoming ? 'pending' : 'none'),
      isIncoming,
      isOutgoing,
      isConnected
    });
    setIsProfileModalVisible(true);
  };

  // Send a connection request
  const handleSendRequest = async (targetUser) => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to connect with other developers.');
      return;
    }

    if (!targetUser?.uid) {
      Alert.alert('Error', 'Target developer does not have a valid user ID.');
      return;
    }

    const connectionId = [currentUser.uid, targetUser.uid].sort().join('_');
    try {
      await setDoc(doc(db, 'connections', connectionId), {
        id: connectionId,
        users: [currentUser.uid, targetUser.uid],
        senderId: currentUser.uid,
        senderName: currentUserProfile?.fullName || currentUser.email?.split('@')[0] || 'Developer',
        senderAvatar: currentUserProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${currentUser.uid}`,
        receiverId: targetUser.uid,
        receiverName: targetUser.fullName || targetUser.name || 'Developer',
        receiverAvatar: targetUser.imageUrl || targetUser.image || `https://api.dicebear.com/7.x/avataaars/png?seed=${targetUser.uid}`,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSelectedProfile(prev => prev && prev.uid === targetUser.uid ? { ...prev, isOutgoing: true, status: 'pending' } : prev);
    } catch (err) {
      console.error('Error sending connection request:', err);
      if (err?.message?.toLowerCase().includes('permission')) {
        Alert.alert(
          'Permissions Required',
          'Could not send request due to Firestore security permissions. Please publish the updated firestore.rules in your Firebase Console under Firestore Database > Rules.'
        );
      } else {
        Alert.alert('Error', 'Could not send request: ' + err.message);
      }
    }
  };

  // Accept a connection request
  const handleAcceptRequest = async (connectionId, targetUser) => {
    try {
      await updateDoc(doc(db, 'connections', connectionId), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      setSelectedProfile(prev => prev && prev.uid === targetUser?.uid ? { ...prev, isConnected: true, isIncoming: false, status: 'accepted' } : prev);

      Alert.alert(
        'Connected!',
        `You and ${targetUser?.fullName || targetUser?.name || 'this developer'} are now connected. You can now chat in Direct Messages!`,
        [
          {
            text: 'Chat Now',
            onPress: () => {
              setIsProfileModalVisible(false);
              handleOpenDirectMessage(targetUser);
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (err) {
      console.error('Error accepting connection request:', err);
      Alert.alert('Error', 'Could not accept request: ' + err.message);
    }
  };

  // Decline or cancel a connection request
  const handleDeclineRequest = async (connectionId, targetUser) => {
    try {
      await deleteDoc(doc(db, 'connections', connectionId));
      setSelectedProfile(prev => prev && (prev.uid === targetUser?.uid || prev.connectionId === connectionId) ? { ...prev, isConnected: false, isIncoming: false, isOutgoing: false, status: 'none' } : prev);
    } catch (err) {
      console.error('Error declining connection request:', err);
    }
  };

  // Navigate to Direct Message with accepted connection
  const handleOpenDirectMessage = (targetUser) => {
    if (!currentUser) return;
    const dmId = [currentUser.uid, targetUser.uid].sort().join('_');
    const avatarUrl = targetUser.imageUrl || targetUser.image || `https://api.dicebear.com/7.x/avataaars/png?seed=${targetUser.uid}`;

    navigation.navigate('MainTabs', {
      screen: 'Messages',
      params: {
        communityId: `dm_${dmId}`,
        communityName: targetUser.fullName || targetUser.name || 'Developer',
        communityImg: avatarUrl,
        isDM: true,
        recipientUid: targetUser.uid
      }
    });
  };

  // Filter profiles based on activeTab, search query, and domain
  const filteredProfiles = profiles.filter((p) => {
    const conn = connectionsMap[p.uid];

    // Tab filter
    if (activeTab === 'pending') {
      if (!conn || conn.status !== 'pending') return false;
    } else if (activeTab === 'connected') {
      if (!conn || conn.status !== 'accepted') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (p.fullName || p.name || '').toLowerCase().includes(q);
      const collegeMatch = (p.college || '').toLowerCase().includes(q);
      const domainMatch = Array.isArray(p.domains)
        ? p.domains.some(d => d.toLowerCase().includes(q))
        : (p.domain || '').toLowerCase().includes(q);
      if (!nameMatch && !collegeMatch && !domainMatch) return false;
    }

    // Domain category filter
    if (selectedDomain !== 'All') {
      const targetDomain = selectedDomain.toLowerCase();
      const domainList = Array.isArray(p.domains)
        ? p.domains.map(d => d.toLowerCase())
        : [(p.domain || '').toLowerCase()];
      const hasDomain = domainList.some(d => d.includes(targetDomain) || targetDomain.includes(d));
      if (!hasDomain) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <Search size={18} color="#6b7280" />
          <TextInput
            placeholder="Search developers by name, college, skills..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* View Tabs: All, Incoming Requests, Connected */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}>
              All Developers ({profiles.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
            onPress={() => setActiveTab('pending')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.tabBtnText, activeTab === 'pending' && styles.tabBtnTextActive]}>
                Requests
              </Text>
              {incomingRequests.length > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{incomingRequests.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'connected' && styles.tabBtnActive]}
            onPress={() => setActiveTab('connected')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'connected' && styles.tabBtnTextActive]}>
              Connected ({connections.filter(c => c.status === 'accepted').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Domain Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {DOMAIN_FILTERS.map((domain) => (
            <TouchableOpacity
              key={domain}
              style={[
                styles.chip,
                selectedDomain === domain && styles.chipActive
              ]}
              onPress={() => setSelectedDomain(domain)}
            >
              <Text style={[
                styles.chipText,
                selectedDomain === domain && styles.chipTextActive
              ]}>
                {domain}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
          <Text style={styles.loadingText}>Finding coders in your network...</Text>
        </View>
      ) : activeTab === 'pending' ? (
        /* Dedicated Requests View (Incoming and Outgoing) */
        incomingRequestPersons.length === 0 && outgoingRequestPersons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySubtext}>
              Incoming requests from other developers will appear here. Connect with developers to grow your network!
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => setActiveTab('all')}
            >
              <Text style={styles.exploreBtnText}>Explore All Developers</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingVertical: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* 1. Received Requests */}
            {incomingRequestPersons.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <View style={styles.requestsSectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.requestsSectionTitle}>Received Requests</Text>
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>{incomingRequestPersons.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.requestsSectionSub}>
                    Tap on any request to view their full profile
                  </Text>
                </View>

                {incomingRequestPersons.map((reqUser) => (
                  <TouchableOpacity
                    key={reqUser.connectionId}
                    style={styles.requestCard}
                    onPress={() => handleOpenProfile(reqUser)}
                    activeOpacity={0.92}
                  >
                    <View style={styles.requestCardTop}>
                      <Image source={{ uri: reqUser.imageUrl }} style={styles.requestAvatar} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.requestName} numberOfLines={1}>{reqUser.fullName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Building size={12} color="#6b7280" style={{ marginRight: 4 }} />
                          <Text style={styles.requestCollege} numberOfLines={1}>{reqUser.college}</Text>
                        </View>
                        <View style={styles.requestDomainPill}>
                          <Text style={styles.requestDomainText}>{reqUser.domains[0] || 'Developer'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.requestActionsRow}>
                      <TouchableOpacity
                        style={styles.reqAcceptBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleAcceptRequest(reqUser.connectionId, reqUser);
                        }}
                        activeOpacity={0.8}
                      >
                        <Check size={14} color="#ffffff" style={{ marginRight: 4 }} />
                        <Text style={styles.reqAcceptText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.reqDeclineBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDeclineRequest(reqUser.connectionId, reqUser);
                        }}
                        activeOpacity={0.8}
                      >
                        <X size={14} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={styles.reqDeclineText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.reqProfileBtn}
                        onPress={() => handleOpenProfile(reqUser)}
                        activeOpacity={0.8}
                      >
                        <Eye size={13} color="#0a66c2" style={{ marginRight: 4 }} />
                        <Text style={styles.reqProfileText}>Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 2. Sent Requests */}
            {outgoingRequestPersons.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <View style={styles.requestsSectionHeader}>
                  <Text style={styles.requestsSectionTitle}>Sent Requests ({outgoingRequestPersons.length})</Text>
                  <Text style={styles.requestsSectionSub}>Waiting for developer response</Text>
                </View>

                {outgoingRequestPersons.map((reqUser) => (
                  <TouchableOpacity
                    key={reqUser.connectionId}
                    style={styles.requestCard}
                    onPress={() => handleOpenProfile(reqUser)}
                    activeOpacity={0.92}
                  >
                    <View style={styles.requestCardTop}>
                      <Image source={{ uri: reqUser.imageUrl }} style={styles.requestAvatar} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.requestName} numberOfLines={1}>{reqUser.fullName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Building size={12} color="#6b7280" style={{ marginRight: 4 }} />
                          <Text style={styles.requestCollege} numberOfLines={1}>{reqUser.college}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Connection pending...</Text>
                      </View>
                    </View>

                    <View style={styles.requestActionsRow}>
                      <TouchableOpacity
                        style={styles.reqDeclineBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDeclineRequest(reqUser.connectionId, reqUser);
                        }}
                        activeOpacity={0.8}
                      >
                        <Clock size={13} color="#64748b" style={{ marginRight: 4 }} />
                        <Text style={styles.reqDeclineText}>Cancel Request</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.reqProfileBtn}
                        onPress={() => handleOpenProfile(reqUser)}
                        activeOpacity={0.8}
                      >
                        <Eye size={13} color="#0a66c2" style={{ marginRight: 4 }} />
                        <Text style={styles.reqProfileText}>View Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )
      ) : filteredProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {activeTab === 'connected'
              ? 'No connected developers yet'
              : 'No developers found'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'connected'
              ? 'Connect with developers below to unlock 1-on-1 Direct Messaging!'
              : 'Try clearing your search or domain filters to explore more coders.'}
          </Text>
          {activeTab !== 'all' && (
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => setActiveTab('all')}
            >
              <Text style={styles.exploreBtnText}>Explore All Developers</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.cardsGrid} showsVerticalScrollIndicator={false}>
          {filteredProfiles.map((student) => {
            const conn = connectionsMap[student.uid];
            const isConnected = conn?.status === 'accepted';
            const isPendingSent = conn?.status === 'pending' && conn?.senderId === currentUser?.uid;
            const isPendingReceived = conn?.status === 'pending' && conn?.receiverId === currentUser?.uid;

            const avatarUrl = student.imageUrl || student.image || `https://api.dicebear.com/7.x/avataaars/png?seed=${student.uid}`;
            const domainText = Array.isArray(student.domains) && student.domains.length > 0
              ? student.domains[0]
              : (student.domain || 'Developer');

            return (
              <TouchableOpacity
                key={student.uid || student.docId}
                style={styles.card}
                activeOpacity={0.92}
                onPress={() => handleOpenProfile(student)}
              >
                {/* Banner Header */}
                <View style={styles.cardBanner} />

                {/* Profile Avatar */}
                <View style={styles.avatarWrap}>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                  />
                </View>

                {/* Details */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {student.fullName || student.name || 'Developer'}
                  </Text>
                  
                  <View style={styles.collegeRow}>
                    <Building size={12} color="#6b7280" style={{ marginRight: 4 }} />
                    <Text style={styles.collegeText} numberOfLines={1}>
                      {student.college || 'Engineering College'}
                    </Text>
                  </View>

                  <View style={styles.domainBadge}>
                    <Text style={styles.domainBadgeText} numberOfLines={1}>
                      {domainText}
                    </Text>
                  </View>

                  {student.bio ? (
                    <Text style={styles.bioText} numberOfLines={2}>
                      {student.bio}
                    </Text>
                  ) : null}

                  {/* Dynamic Action Buttons based on Connection State */}
                  <View style={styles.actionWrap}>
                    {isConnected ? (
                      /* Connected -> Can Message in Direct Messages! */
                      <TouchableOpacity
                        style={styles.messageBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleOpenDirectMessage(student);
                        }}
                        activeOpacity={0.8}
                      >
                        <MessageSquare size={13} color="#ffffff" style={{ marginRight: 5 }} />
                        <Text style={styles.messageBtnText}>Message</Text>
                      </TouchableOpacity>
                    ) : isPendingSent ? (
                      /* Request Sent -> Pending */
                      <TouchableOpacity
                        style={styles.pendingBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDeclineRequest(conn.id, student);
                        }}
                        activeOpacity={0.8}
                      >
                        <Clock size={13} color="#6b7280" style={{ marginRight: 5 }} />
                        <Text style={styles.pendingBtnText}>Requested</Text>
                      </TouchableOpacity>
                    ) : isPendingReceived ? (
                      /* Request Received -> Accept or Decline */
                      <View style={styles.requestActionRow}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            handleAcceptRequest(conn.id, student);
                          }}
                          activeOpacity={0.8}
                        >
                          <Check size={13} color="#ffffff" style={{ marginRight: 3 }} />
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.declineBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            handleDeclineRequest(conn.id, student);
                          }}
                          activeOpacity={0.8}
                        >
                          <X size={13} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Not Connected -> Connect Button */
                      <TouchableOpacity
                        style={styles.connectBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleSendRequest(student);
                        }}
                        activeOpacity={0.8}
                      >
                        <UserPlus size={13} color="#0a66c2" style={{ marginRight: 5 }} />
                        <Text style={styles.connectBtnText}>Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Developer Profile Modal ── */}
      <Modal
        visible={isProfileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Modal Header Bar with Close Button */}
            <View style={styles.modalBanner}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsProfileModalVisible(false)}
                activeOpacity={0.8}
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar overlapping banner */}
            <View style={styles.modalAvatarContainer}>
              <Image
                source={{
                  uri: selectedProfile?.imageUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${selectedProfile?.uid || 'user'}`
                }}
                style={styles.modalAvatar}
              />
            </View>

            {/* Scrollable Profile Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name & Title */}
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.modalName}>{selectedProfile?.fullName || 'Developer'}</Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Building size={14} color="#64748b" style={{ marginRight: 5 }} />
                  <Text style={styles.modalCollege}>{selectedProfile?.college || 'Student Developer'}</Text>
                </View>

                {selectedProfile?.email ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                    <Mail size={13} color="#94a3b8" style={{ marginRight: 5 }} />
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>{selectedProfile.email}</Text>
                  </View>
                ) : null}

                {/* Connection Status Badge */}
                <View style={[
                  styles.modalStatusPill,
                  selectedProfile?.isConnected && { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
                  selectedProfile?.isIncoming && { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
                  selectedProfile?.isOutgoing && { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
                ]}>
                  <Text style={[
                    styles.modalStatusText,
                    selectedProfile?.isConnected && { color: '#059669' },
                    selectedProfile?.isIncoming && { color: '#b45309' },
                    selectedProfile?.isOutgoing && { color: '#64748b' },
                  ]}>
                    {selectedProfile?.isConnected
                      ? '🤝 Connected Developer'
                      : selectedProfile?.isIncoming
                      ? '✨ Wants to connect with you'
                      : selectedProfile?.isOutgoing
                      ? '⏳ Connection request sent (Pending)'
                      : '💡 Ready to connect'}
                  </Text>
                </View>
              </View>

              {/* Domains / Skills Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>SPECIALTIES & DOMAINS</Text>
                <View style={styles.modalDomainsRow}>
                  {Array.isArray(selectedProfile?.domains) && selectedProfile.domains.length > 0 ? (
                    selectedProfile.domains.map((dom, i) => (
                      <View key={`${dom}_${i}`} style={styles.modalDomainChip}>
                        <Text style={styles.modalDomainText}>{dom}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.modalDomainChip}>
                      <Text style={styles.modalDomainText}>Software Engineering</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Bio / About Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>ABOUT DEVELOPER</Text>
                <View style={styles.modalBioBox}>
                  <Text style={styles.modalBioText}>
                    {selectedProfile?.bio?.trim()
                      ? selectedProfile.bio
                      : 'This developer has not added an extended bio yet. Connect to collaborate and chat!'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalActionsFooter}>
              {selectedProfile?.isConnected ? (
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => {
                    setIsProfileModalVisible(false);
                    handleOpenDirectMessage(selectedProfile);
                  }}
                  activeOpacity={0.85}
                >
                  <MessageSquare size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.modalPrimaryBtnText}>Message in Direct Messages</Text>
                </TouchableOpacity>
              ) : selectedProfile?.isIncoming ? (
                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, { flex: 1, backgroundColor: '#0a66c2' }]}
                    onPress={async () => {
                      const connId = selectedProfile?.connection?.id || selectedProfile?.connectionId;
                      await handleAcceptRequest(connId, selectedProfile);
                      setIsProfileModalVisible(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.modalPrimaryBtnText}>Accept Request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalSecondaryBtn, { flex: 1 }]}
                    onPress={async () => {
                      const connId = selectedProfile?.connection?.id || selectedProfile?.connectionId;
                      await handleDeclineRequest(connId, selectedProfile);
                      setIsProfileModalVisible(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <X size={16} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={[styles.modalSecondaryBtnText, { color: '#ef4444' }]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ) : selectedProfile?.isOutgoing ? (
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={async () => {
                    const connId = selectedProfile?.connection?.id || selectedProfile?.connectionId;
                    await handleDeclineRequest(connId, selectedProfile);
                    setIsProfileModalVisible(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Clock size={16} color="#6b7280" style={{ marginRight: 8 }} />
                  <Text style={styles.modalSecondaryBtnText}>Cancel Request</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={async () => {
                    await handleSendRequest(selectedProfile);
                    setIsProfileModalVisible(false);
                  }}
                  activeOpacity={0.85}
                >
                  <UserPlus size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.modalPrimaryBtnText}>Connect with {selectedProfile?.fullName?.split(' ')[0] || 'Developer'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PRIMARY = '#0a66c2';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    marginLeft: 8,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  tabBtnActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 5,
    marginLeft: 5,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBanner: {
    height: 48,
    backgroundColor: '#e2e8f0',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#f1f5f9',
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 12,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  collegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  collegeText: {
    fontSize: 11,
    color: '#64748b',
    maxWidth: '90%',
  },
  domainBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  domainBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
  bioText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  actionWrap: {
    width: '100%',
    marginTop: 4,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  connectBtnText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pendingBtnText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 6,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  messageBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  requestActionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 6,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  declineBtn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  // Dedicated Requests View Styles
  requestsSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  requestsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  requestsSectionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e0f2fe',
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  requestCollege: {
    fontSize: 12,
    color: '#64748b',
  },
  requestDomainPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  requestDomainText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
  requestActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  reqAcceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a66c2',
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  reqAcceptText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  reqDeclineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  reqDeclineText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  reqProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reqProfileText: {
    color: '#0a66c2',
    fontSize: 12,
    fontWeight: '700',
  },
  // Profile Detail Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalBanner: {
    height: 100,
    backgroundColor: PRIMARY,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginTop: -48,
    marginBottom: 8,
  },
  modalAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#f1f5f9',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  modalCollege: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  modalStatusPill: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalSection: {
    marginTop: 18,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  modalDomainsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalDomainChip: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  modalDomainText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  modalBioBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalBioText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  modalActionsFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 24,
  },
  modalSecondaryBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
});
