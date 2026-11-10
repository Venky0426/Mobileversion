<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Animated,
  PanResponder,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { Calendar, MapPin, ExternalLink, X, ChevronLeft, ChevronRight, Plus, Tag, Link2, Building } from 'lucide-react-native';
import { auth, db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 64;
const MARGIN = 16;

const defaultEventsData = [
  {
    id: 'default-1',
=======
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Dimensions, Alert, Platform, Animated, PanResponder } from 'react-native';
import { Calendar, MapPin, ExternalLink, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const eventsData = [
  {
    id: 1,
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    title: 'National Level Hackathon',
    organizer: 'CARE College of Engineering',
    date: 'Mar 14–15, 2025',
    location: 'CARE Campus, Trichy',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    tag: 'Hackathon',
    tagColor: '#e040fb',
  },
  {
<<<<<<< HEAD
    id: 'default-2',
=======
    id: 2,
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    title: 'The Great Bengaluru Hackathon',
    organizer: 'PES University',
    date: 'Mar 15–16, 2025',
    location: 'PES University, Bengaluru',
<<<<<<< HEAD
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
=======
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    tag: 'Hackathon',
    tagColor: '#2979ff',
  },
  {
<<<<<<< HEAD
    id: 'default-3',
=======
    id: 3,
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
    title: 'AI & ML Workshop 2025',
    organizer: 'IIT Madras',
    date: 'Apr 5–6, 2025',
    location: 'IIT Madras Campus',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    tag: 'Workshop',
    tagColor: '#00c853',
  },
];

<<<<<<< HEAD
const EVENT_TAGS = ['Hackathon', 'Workshop', 'Meetup', 'Webinar', 'Tech Talk'];

const TAG_COLORS = {
  'Hackathon': '#e040fb',
  'Workshop': '#00c853',
  'Meetup': '#2979ff',
  'Webinar': '#ff9100',
  'Tech Talk': '#ff5252'
};

const DEFAULT_TAG_IMAGES = {
  'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  'Workshop': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
  'Meetup': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  'Webinar': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  'Tech Talk': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
};

const SLIDE_DURATION = 4000;

const EventsSlideshowNative = () => {
  const [events, setEvents] = useState(defaultEventsData);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Add Event Modal State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventTag, setEventTag] = useState('Hackathon');
  const [eventImage, setEventImage] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [submittingEvent, setSubmittingEvent] = useState(false);
  
  // PanResponder for dragging the floating bubble
  const [pan] = useState(() => new Animated.ValueXY());
  const isDragging = useRef(false);
  const currentPan = useRef({ x: 0, y: 0 });
  const [panResponder, setPanResponder] = useState(null);

  // Subscribe to real-time events from Firestore
  useEffect(() => {
    const q = collection(db, 'events');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      if (list.length > 0) {
        // Combine Firestore events with default seeds without duplicating titles
        const merged = [
          ...list,
          ...defaultEventsData.filter(d => !list.some(item => item.title === d.title))
        ];
        setEvents(merged);
      } else {
        setEvents(defaultEventsData);
      }
    }, (err) => {
      console.log('Events listener fallback:', err?.message);
      setEvents(defaultEventsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const listenerId = pan.addListener((value) => {
      currentPan.current = value;
    });
    return () => {
      pan.removeListener(listenerId);
    };
  }, [pan]);

  useEffect(() => {
    const pr = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        setTimeout(() => {
          isDragging.current = false;
        }, 100);

        // Snap horizontally to nearest edge (left or right)
        const snapToLeft = gestureState.moveX < width / 2;
        const targetX = snapToLeft ? -(width - 2 * MARGIN - BUTTON_SIZE) : 0;

        // Clamp vertically between top of screen and above bottom tab bar
        const minY = -(height - 230);
        const maxY = 15;
        let targetY = currentPan.current.y;
        if (targetY < minY) targetY = minY;
        if (targetY > maxY) targetY = maxY;

        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: targetX,
            useNativeDriver: false,
            friction: 7,
            tension: 50,
          }),
          Animated.spring(pan.y, {
            toValue: targetY,
            useNativeDriver: false,
            friction: 7,
            tension: 50,
          }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
    });

    setPanResponder(pr);
  }, [pan]);

  // Slideshow advance timer
  useEffect(() => {
    if (!isOpen || isAddEventOpen || events.length === 0) return;

    setProgress(0);
    const intervalTime = 50;
    const step = 100 / (SLIDE_DURATION / intervalTime);
=======
const SLIDE_DURATION = 4000;

const EventsSlideshowNative = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // PanResponder for dragging the floating bubble
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start dragging if the user moves a bit (to distinguish from a tap)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;
  
  const currentEvent = eventsData[currentIndex];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
<<<<<<< HEAD
  }, [isOpen, currentIndex, isAddEventOpen, events.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
    setProgress(0);
  }, [events.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    setProgress(0);
  }, [events.length]);

  const handleBubblePress = () => {
    if (isDragging.current) return;
    setIsOpen(true);
    setProgress(0);
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventOrganizer.trim()) {
      Alert.alert("Required Fields", "Please enter event title and organizer name.");
      return;
    }

    setSubmittingEvent(true);
    try {
      const banner = eventImage.trim() || DEFAULT_TAG_IMAGES[eventTag] || DEFAULT_TAG_IMAGES['Hackathon'];

      const newEvent = {
        title: eventTitle.trim(),
        organizer: eventOrganizer.trim(),
        date: eventDate.trim() || 'Upcoming',
        location: eventLocation.trim() || 'Online / Campus',
        tag: eventTag,
        tagColor: TAG_COLORS[eventTag] || '#2979ff',
        image: banner,
        link: eventLink.trim() || null,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'anonymous'
      };

      await addDoc(collection(db, 'events'), newEvent);

      Alert.alert("Success", "New event created and added to the slideshow!");
      setIsAddEventOpen(false);
      setEventTitle('');
      setEventOrganizer('');
      setEventDate('');
      setEventLocation('');
      setEventImage('');
      setEventLink('');
      setCurrentIndex(0);
      setProgress(0);
    } catch (err) {
      console.error("Error creating event:", err);
      Alert.alert("Error", "Could not save event: " + err.message);
    } finally {
      setSubmittingEvent(false);
    }
  };

  const currentEvent = events[currentIndex] || events[0] || defaultEventsData[0];

  return (
    <>
      {/* Floating Events Bubble */}
      {panResponder && (
        <Animated.View
          style={[
            styles.floatingButton,
            { transform: pan.getTranslateTransform() },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleBubblePress}
            style={styles.touchableArea}
          >
            {/* Outer Circular Base */}
            <View style={styles.bubbleRing}>
              {/* Inner Circle Content */}
              <View style={styles.bubbleInner}>
                <Calendar size={28} color="#ffffff" strokeWidth={2.2} />
              </View>
            </View>

            {/* Notification Count Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{events.length}</Text>
            </View>

            {/* Event Label Pill */}
            <View style={styles.eventPill}>
              <Text style={styles.eventPillText}>Events</Text>
=======
  }, [isOpen, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < eventsData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setIsOpen(false);
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentIndex]);

  return (
    <>
      {!isOpen && (
        <Animated.View
          style={[styles.floatingButton, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              setIsOpen(true);
              setCurrentIndex(0);
              setProgress(0);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.bubbleContainer, { borderColor: '#e040fb' }]}>
              <Image 
                source={{ uri: eventsData[0].image }} 
                style={styles.bubbleImage}
              />
              <View style={styles.bubbleOverlay}>
                <Calendar size={24} color="#fff" />
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{eventsData.length}</Text>
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

<<<<<<< HEAD
      {/* Events Viewer Modal */}
=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
      <Modal visible={isOpen} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsOpen(false)}
<<<<<<< HEAD
            activeOpacity={0.7}
          >
            <X size={24} color="#ffffff" />
=======
          >
            <X size={32} color="white" />
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
          </TouchableOpacity>
          
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
<<<<<<< HEAD
            {events.map((_, idx) => (
=======
            {eventsData.map((_, idx) => (
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
              <View key={idx} style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${idx < currentIndex ? 100 : idx === currentIndex ? progress : 0}%` }
                  ]}
                />
              </View>
            ))}
          </View>

<<<<<<< HEAD
          {/* Header with Add Event Button */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Calendar size={18} color="#1f2937" />
=======
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Calendar size={20} color="#333" />
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>{currentEvent.organizer}</Text>
              <Text style={[styles.headerTag, { color: currentEvent.tagColor }]}>{currentEvent.tag}</Text>
            </View>
<<<<<<< HEAD

            {/* Add Event Button */}
            <TouchableOpacity 
              style={styles.addEventBtn}
              onPress={() => setIsAddEventOpen(true)}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 4 }} />
              <Text style={styles.addEventBtnText}>Add Event</Text>
            </TouchableOpacity>
          </View>

          {/* Content (Background Image) */}
=======
          </View>

          {/* Nav areas */}
          <View style={styles.navContainer}>
            <TouchableOpacity style={styles.navLeft} onPress={handlePrev} />
            <TouchableOpacity style={styles.navRight} onPress={handleNext} />
          </View>

          {/* Content */}
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
          <Image 
            source={{ uri: currentEvent.image }} 
            style={styles.mainImage} 
            resizeMode="cover"
          />
          
<<<<<<< HEAD
          {/* Details Overlay */}
          <View style={styles.detailsOverlay} pointerEvents="box-none">
=======
          <View style={styles.detailsOverlay}>
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
            <Text style={styles.eventTitle}>{currentEvent.title}</Text>
            
            <View style={styles.eventMeta}>
              <Calendar size={16} color="#60a5fa" />
              <Text style={styles.metaText}>{currentEvent.date}</Text>
            </View>
            <View style={styles.eventMeta}>
              <MapPin size={16} color="#f87171" />
              <Text style={styles.metaText}>{currentEvent.location}</Text>
            </View>
          </View>

<<<<<<< HEAD
          {/* Navigation Cursors / Tap Areas */}
          <View style={styles.navContainer} pointerEvents="box-none">
            <TouchableOpacity 
              style={styles.navLeft} 
              onPress={handlePrev}
              activeOpacity={0.7}
            >
              {currentIndex > 0 && (
                <View style={styles.cursorButton}>
                  <ChevronLeft size={22} color="#ffffff" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navRight} 
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <View style={[styles.cursorButton, styles.cursorButtonRight]}>
                <ChevronRight size={22} color="#ffffff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>

=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => Alert.alert("Register", `Registering for ${currentEvent.title}`)}
<<<<<<< HEAD
              activeOpacity={0.8}
            >
              <ExternalLink size={18} color="#fff" />
=======
            >
              <ExternalLink size={20} color="#fff" />
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
              <Text style={styles.registerText}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
<<<<<<< HEAD

        {/* ── Add Event Nested Modal ── */}
        <Modal
          visible={isAddEventOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAddEventOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdrop}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setIsAddEventOpen(false)}
            />
            <View style={styles.formContainer}>
              {/* Header */}
              <View style={styles.formHeader}>
                <View style={styles.formHandle} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Calendar size={20} color="#0a66c2" />
                    <Text style={styles.formTitle}>Add New Event</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsAddEventOpen(false)}
                    style={styles.formCloseBtn}
                  >
                    <X size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Event Title */}
                <Text style={styles.inputLabel}>Event Title *</Text>
                <TextInput
                  value={eventTitle}
                  onChangeText={setEventTitle}
                  placeholder="e.g. National Level Hackathon 2025"
                  placeholderTextColor="#9ca3af"
                  style={styles.textInput}
                />

                {/* Organizer */}
                <Text style={styles.inputLabel}>Organizer / Institution *</Text>
                <TextInput
                  value={eventOrganizer}
                  onChangeText={setEventOrganizer}
                  placeholder="e.g. CARE College of Engineering"
                  placeholderTextColor="#9ca3af"
                  style={styles.textInput}
                />

                {/* Tag / Category Chips */}
                <Text style={styles.inputLabel}>Category / Tag</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 6 }}>
                  {EVENT_TAGS.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => setEventTag(tag)}
                      style={[
                        styles.tagChip,
                        eventTag === tag && { backgroundColor: TAG_COLORS[tag] || '#0a66c2', borderColor: TAG_COLORS[tag] || '#0a66c2' }
                      ]}
                    >
                      <Text style={[styles.tagChipText, eventTag === tag && { color: '#ffffff', fontWeight: '700' }]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Date */}
                <Text style={styles.inputLabel}>Date & Time *</Text>
                <TextInput
                  value={eventDate}
                  onChangeText={setEventDate}
                  placeholder="e.g. Mar 14–15, 2025"
                  placeholderTextColor="#9ca3af"
                  style={styles.textInput}
                />

                {/* Location */}
                <Text style={styles.inputLabel}>Location / Venue *</Text>
                <TextInput
                  value={eventLocation}
                  onChangeText={setEventLocation}
                  placeholder="e.g. CARE Campus, Trichy / Online"
                  placeholderTextColor="#9ca3af"
                  style={styles.textInput}
                />

                {/* Image URL */}
                <Text style={styles.inputLabel}>Banner Image URL (Optional)</Text>
                <TextInput
                  value={eventImage}
                  onChangeText={setEventImage}
                  placeholder="https://... (leave blank for automatic category banner)"
                  placeholderTextColor="#9ca3af"
                  style={styles.textInput}
                />

                {/* Registration Link */}
                <Text style={styles.inputLabel}>Registration / Website Link (Optional)</Text>
                <TextInput
                  value={eventLink}
                  onChangeText={setEventLink}
                  placeholder="https://event-register.com/..."
                  placeholderTextColor="#9ca3af"
                  style={styles.textInput}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitEventBtn, submittingEvent && { opacity: 0.7 }]}
                  onPress={handleCreateEvent}
                  disabled={submittingEvent}
                  activeOpacity={0.85}
                >
                  {submittingEvent ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Plus size={18} color="#ffffff" strokeWidth={2.8} />
                      <Text style={styles.submitEventBtnText}>Publish Event</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
=======
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
<<<<<<< HEAD
    bottom: 90,
    right: MARGIN,
    zIndex: 999,
  },
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bubbleRing: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 3,
    backgroundColor: '#1f2937',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#e040fb',
    shadowColor: '#e040fb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  bubbleInner: {
    width: BUTTON_SIZE - 10,
    height: BUTTON_SIZE - 10,
    borderRadius: (BUTTON_SIZE - 10) / 2,
    backgroundColor: '#0a66c2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 5,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  eventPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 25,
    right: 20,
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    right: 64,
    flexDirection: 'row',
    gap: 4,
    zIndex: 40,
=======
    bottom: 24,
    right: 24,
    zIndex: 999,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bubbleContainer: {
    flex: 1,
    borderRadius: 35,
    borderWidth: 3,
    padding: 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  bubbleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  bubbleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 110,
    padding: 8,
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 20,
    gap: 4,
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
<<<<<<< HEAD
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 32,
    left: 16,
    right: 64,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 30,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a66c2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  addEventBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
=======
    marginHorizontal: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 40,
    left: 16,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  navContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  navLeft: {
    width: '35%',
    height: '100%',
  },
  navRight: {
    width: '65%',
    height: '100%',
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  },
  mainImage: {
    width: '100%',
    height: '100%',
<<<<<<< HEAD
    position: 'absolute',
  },
  detailsOverlay: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
=======
    opacity: 0.8,
  },
  detailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 100,
    backgroundColor: 'transparent', 
  },
  eventTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  navContainer: {
    position: 'absolute',
    top: 100,
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 15,
  },
  navLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  navRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  cursorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cursorButtonRight: {},
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 24,
    left: 20,
    right: 20,
    zIndex: 30,
  },
  registerButton: {
    backgroundColor: '#0a66c2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  registerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  // Add Event Form Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  formHeader: {
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 14,
  },
  formHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  formCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
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
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  submitEventBtn: {
    backgroundColor: '#0a66c2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#0a66c2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitEventBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
=======
    marginBottom: 8,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: '#0a66c2',
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
  },
});

export default EventsSlideshowNative;
