import { getActivityItems, updateActivityItem } from '@/data/activityStore';
import { getUserRequests, removeUserRequest } from '@/data/userRequests';
import { Colors, globalStyles } from '@/styles/globalStyles';
import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rawActivity = require('../../data/activity.json');

type ActivityItem = typeof rawActivity[number];

export default function ActivityScreen() {
  const { initialTab } = useLocalSearchParams<{ initialTab?: string }>();
  const router = useRouter();
  const [items, setItems] = useState<ActivityItem[]>(rawActivity);
  const [loaded] = useFonts({ Raleway_500Medium });
  const [tab, setTab] = useState<'current' | 'requests'>(
    initialTab === 'requests' ? 'requests' : 'current'
  );
  const [showLendingModal, setShowLendingModal] = useState(false);
  const [pendingApproveItem, setPendingApproveItem] = useState<ActivityItem | null>(null);
  const [pendingDenyId, setPendingDenyId] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [washingInstructions, setWashingInstructions] = useState('');

  // Function to refresh items from store
  const refreshItems = useCallback(() => {
    const userRequests = getUserRequests();
    const activityItems = getActivityItems();
    // Filter out items that have activity.person.name === 'You' and status === 'requested' (hardcoded ones)
    const filteredActivity = activityItems.filter((it: ActivityItem) => 
      !(it.activity && it.activity.person?.name === 'You' && (it.activity.status === 'requested' || it.activity.status === 'approved'))
    );
    // Merge with user requests
    const allItems = [...filteredActivity, ...userRequests] as ActivityItem[];
    setItems(allItems);
  }, []);

  // Initial load
  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // Set initial tab from params if provided
  useEffect(() => {
    if (initialTab === 'requests') {
      setTab('requests');
    }
  }, [initialTab]);

  // Refresh when screen comes into focus (e.g., after adding a request)
  useFocusEffect(
    useCallback(() => {
      refreshItems();
    }, [refreshItems])
  );

  const currentBorrowing = useMemo(() => items.filter((it) => it.activity?.status === 'current' && it.activity?.role === 'borrowed'), [items]);
  const currentLending = useMemo(() => items.filter((it) => it.activity?.status === 'current' && it.activity?.role === 'lending'), [items]);
  const yourRequests = useMemo(() => items.filter((it) => it.activity && it.activity.person?.name === 'You' && (it.activity.status === 'requested' || it.activity.status === 'approved')), [items]);
  const approveRequests = useMemo(() => items.filter((it) => it.owner?.name === 'You' && it.activity?.status === 'requested'), [items]);

  function handleApprove(id: string) {
    const item = items.find((it) => it.id === id);
    if (item) {
      setPendingApproveItem(item);
      setPendingDenyId(null); // Reset deny confirmation if approving
      // Reset all form fields
      setPickupLocation('');
      setReturnDate(null);
      setWashingInstructions('');
      setShowDatePicker(false);
      setShowLendingModal(true);
    }
  }

  function formatDateForDisplay(date: Date | null): string {
    if (!date) return '';
    const day = date.getDate();
    const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString(undefined, { month: 'long' });
    return `${month} ${day}${daySuffix}, ${date.getFullYear()}`;
  }

  function handleNotifyBorrower() {
    if (!pendingApproveItem) return;
    
    if (!returnDate) {
      Alert.alert('Date Required', 'Please select a return date before notifying the borrower.');
      return;
    }
    
    // Format date as ISO string for storage
    const dateString = returnDate.toISOString().split('T')[0];
    // Update the item: change from requested to current lending
    const updatedActivity = {
      role: 'lending' as const,
      direction: 'to' as const,
      person: pendingApproveItem.activity?.person || { name: 'Unknown' },
      status: 'current' as const,
      dueDate: dateString
    };
    
    // Update in store first
    updateActivityItem(pendingApproveItem.id, { activity: updatedActivity });
    
    // Update local state immediately
    setItems((prev) => prev.map((it) => 
      it.id === pendingApproveItem.id 
        ? { 
            ...it, 
            activity: updatedActivity
          } 
        : it
    ));
    
    setShowLendingModal(false);
    setPendingApproveItem(null);
    // Reset form fields
    setPickupLocation('');
    setReturnDate(null);
    setWashingInstructions('');
    setShowDatePicker(false);
  }

  function handleDeny(id: string) {
    if (pendingDenyId === id) {
      // Second click - confirm deny
      setItems((prev) => prev.map((it) => it.id === id ? (() => { const copy = { ...it }; delete (copy as any).activity; return copy; })() : it));
      setPendingDenyId(null);
    } else {
      // First click - show confirm state (reset any other pending deny)
      setPendingDenyId(id);
    }
  }

  function handleReturn(id: string) {
    // remove activity locally and in store
    updateActivityItem(id, { activity: undefined });
    setItems((prev) => prev.map((it) => it.id === id ? (() => { const copy = { ...it }; delete (copy as any).activity; return copy; })() : it));
  }

  function handleMarkReturned(id: string) {
    // Called by owner when marking a lent item as returned: clear its activity
    updateActivityItem(id, { activity: undefined });
    setItems((prev) => prev.map((it) => it.id === id ? (() => { const copy = { ...it }; delete (copy as any).activity; return copy; })() : it));
  }

  function handleCancelRequest(id: string) {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        {
          text: 'Keep Request',
          style: 'cancel',
        },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: () => {
            removeUserRequest(id);
            refreshItems();
          },
        },
      ]
    );
  }

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.segmentWrap}>
          <TouchableOpacity onPress={() => setTab('current')} style={[styles.segmentBtn, tab === 'current' && styles.segmentActive]}>
            <Text style={[styles.segmentText, tab === 'current' && styles.segmentTextActive]}>Current</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('requests')} style={[styles.segmentBtn, tab === 'requests' && styles.segmentActive, styles.segmentRight]}>
            <Text style={[styles.segmentText, tab === 'requests' && styles.segmentTextActive]}>Requests</Text>
          </TouchableOpacity>
        </View>

        {tab === 'current' ? (
          <View>
            <Section title="Currently Borrowing">
              {currentBorrowing.length === 0 ? <Empty text="No current borrows" /> : (
                <View>
                  {currentBorrowing.map((item) => (
                    <ActivityCard key={item.id} item={item} type="borrow" onReturn={handleReturn} />
                  ))}
                </View>
              )}
            </Section>

            <Section title="Currently Lending">
              {currentLending.length === 0 ? <Empty text="No current lends" /> : (
                <View>
                  {currentLending.map((item) => (
                    <ActivityCard key={item.id} item={item} type="lend" onReturned={handleMarkReturned} />
                  ))}
                </View>
              )}
            </Section>
          </View>
        ) : (
          <View>
            <Section title="Your Requests">
              {yourRequests.length === 0 ? <Empty text="No requests" /> : (
                <View>
                  {yourRequests.map((item) => (
                    <ActivityCard key={item.id} item={item} type="yourRequest" onCancelRequest={handleCancelRequest} />
                  ))}
                </View>
              )}
            </Section>

            <Section title="Approve Requests">
              {approveRequests.length === 0 ? (
                <Empty text="No incoming requests" />
              ) : (
                <View>
                  {approveRequests.map((item) => (
                    <ActivityCard key={item.id} item={item} type="approveRequest" onApprove={handleApprove} onDeny={handleDeny} pendingDenyId={pendingDenyId} />
                  ))}
                </View>
              )}
            </Section>
          </View>
        )}

      </ScrollView>
      <LendingDetailsModal
        visible={showLendingModal}
        onClose={() => {
          setShowLendingModal(false);
          setPendingApproveItem(null);
          setPickupLocation('');
          setReturnDate(null);
          setWashingInstructions('');
          setShowDatePicker(false);
        }}
        pickupLocation={pickupLocation}
        setPickupLocation={setPickupLocation}
        returnDate={returnDate}
        setReturnDate={setReturnDate}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        washingInstructions={washingInstructions}
        setWashingInstructions={setWashingInstructions}
        onNotifyBorrower={handleNotifyBorrower}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function ActivityCard({ item, type, onApprove, onDeny, onReturn, onReturned, onCancelRequest, pendingDenyId }: { item: ActivityItem; type: 'borrow' | 'lend' | 'yourRequest' | 'approveRequest' ; onApprove?: (id: string) => void; onDeny?: (id: string) => void; onReturn?: (id: string) => void; onReturned?: (id: string) => void; onCancelRequest?: (id: string) => void; pendingDenyId?: string | null }) {
  const router = useRouter();
  const personName = item.activity?.person?.name ?? item.owner?.name;
  // const avatar = item.activity?.person?.avatarUrl ?? item.owner?.avatarUrl;

  const handlePress = () => {
    const params: { id: string; isBorrowing?: string; isOwnListing?: string } = { id: item.id };
    if (type === 'borrow') {
      params.isBorrowing = 'true';
    } else if (type === 'lend') {
      // If you're currently lending an item, you own it
      params.isOwnListing = 'true';
    }
    router.push({ pathname: '/product/[id]', params });
  };

  if (type === 'yourRequest') {
    const status = item.activity?.status === 'approved' ? 'Approved' : 'Requested';
    const ownerName = item.owner?.name ?? item.activity?.person?.name;
    return (
      <View style={styles.card}>
        <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={handlePress}>
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
          <View style={styles.cardBody}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.ownerRow}>
              {/* <Image source={{ uri: avatar }} style={styles.avatar} /> */}
              <Text style={styles.ownerText}>{`From ${ownerName}`}</Text>
            </View>
          </View>
        </Pressable>
        {item.activity?.status === 'approved' ? (
          <View style={[styles.pill, styles.pillApproved]}>
            <Text style={[styles.pillText, styles.pillTextLight]}>{status}</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.cancelXButton}
            onPress={(e) => { e.stopPropagation(); onCancelRequest && onCancelRequest(item.id); }}
          >
            <X size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (type === 'approveRequest') {
    const isOwn = item.owner?.name === 'You';
    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.title}>{item.title}</Text>
          {!isOwn && (
            <View style={styles.ownerRow}>
              {/* <Image source={{ uri: item.activity?.person?.avatarUrl || item.owner?.avatarUrl }} style={styles.avatar} /> */}
              <Text style={styles.ownerText}>{item.activity?.person?.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.approveActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline, styles.approveActionBtn]} onPress={(e) => { e.stopPropagation(); onApprove && onApprove(item.id); }}>
            <Text style={styles.actionTextGold}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              styles.approveActionBtn,
              pendingDenyId === item.id && styles.actionDenyConfirm
            ]} 
            onPress={(e) => { e.stopPropagation(); onDeny && onDeny(item.id); }}
          >
            <Text style={pendingDenyId === item.id ? styles.actionTextDenyConfirm : styles.actionTextMuted}>
              {pendingDenyId === item.id ? 'Confirm' : 'Deny'}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  }

  const actionLabel = type === 'borrow' ? 'Return' : type === 'lend' ? 'Receive' : 'View';
  // remove Return button for borrow cards (no button shown)
  const showButton = false;
  
  const showReturnedButton = type === 'lend';

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.ownerRow}>
          {/* <Image source={{ uri: avatar }} style={styles.avatar} /> */}
          <Text style={styles.ownerText}>{type === 'borrow' ? `From ${personName}` : type === 'lend' ? `To ${personName}` : personName}</Text>
        </View>
        {item.activity?.dueDate ? <Text style={styles.due}>{type === 'lend' ? 'Receive by:' : 'Return by:'} {formatDate(item.activity.dueDate)}</Text> : null}
      </View>
      {showButton ? (
        <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline]} onPress={(e) => { e.stopPropagation(); onReturn && onReturn(item.id); }}>
          <Text style={styles.actionTextGold}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
      {showReturnedButton ? (
        <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline, styles.approveActionBtn]} onPress={(e) => { e.stopPropagation(); onReturned && onReturned(item.id); }}>
          <Text style={styles.actionTextGold}>Returned</Text>
        </TouchableOpacity>
      ) : null}
    </Pressable>
  );
}

function LendingDetailsModal({
  visible,
  onClose,
  pickupLocation,
  setPickupLocation,
  returnDate,
  setReturnDate,
  showDatePicker,
  setShowDatePicker,
  washingInstructions,
  setWashingInstructions,
  onNotifyBorrower,
}: {
  visible: boolean;
  onClose: () => void;
  pickupLocation: string;
  setPickupLocation: (value: string) => void;
  returnDate: Date | null;
  setReturnDate: (value: Date | null) => void;
  showDatePicker: boolean;
  setShowDatePicker: (value: boolean) => void;
  washingInstructions: string;
  setWashingInstructions: (value: string) => void;
  onNotifyBorrower: () => void;
}) {
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate();
    const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString(undefined, { month: 'long' });
    return `${month} ${day}${daySuffix}, ${date.getFullYear()}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setReturnDate(selectedDate);
      }
    } else {
      // iOS
      if (selectedDate) {
        setReturnDate(selectedDate);
      }
    }
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lending Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Pickup Location</Text>
              <TextInput
                style={styles.formInput}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="Enter pickup location"
                placeholderTextColor={Colors.textMutedLight}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Return By</Text>
              {Platform.OS === 'ios' ? (
                <View style={styles.dateInputContainer}>
                  <Calendar size={20} color={Colors.textMuted} style={styles.calendarIcon} />
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={returnDate || new Date()}
                      mode="date"
                      display="compact"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                      style={styles.datePickerCompact}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <Pressable
                    style={styles.dateInputContainer}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={20} color={Colors.textMuted} style={styles.calendarIcon} />
                    <Text style={[styles.dateInputText, !returnDate && styles.dateInputPlaceholder]}>
                      {returnDate ? formatDateForDisplay(returnDate) : 'Select return date'}
                    </Text>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={returnDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Washing Instructions</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={washingInstructions}
                onChangeText={setWashingInstructions}
                placeholder="Enter washing instructions"
                placeholderTextColor={Colors.textMutedLight}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.notifyButton} onPress={onNotifyBorrower}>
              <Text style={styles.notifyButtonText}>Notify Borrower</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: globalStyles.container,
  scroll: { padding: 16, paddingBottom: 40 },
  header: globalStyles.headerBold,
  segmentWrap: { flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 24, padding: 6, marginBottom: 16 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  segmentRight: { marginLeft: 6 },
  segmentText: { color: '#666' },
  segmentActive: { backgroundColor: '#fff' },
  segmentTextActive: { color: '#111', fontWeight: '600' },

  section: { marginBottom: 18 },
  sectionTitle: globalStyles.sectionTitleSmall,
  emptyText: globalStyles.emptyText,

  card: {
    ...globalStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: globalStyles.thumbnail,
  cardBody: { flex: 1 },
  brand: {
    fontSize: 12,
    color: Colors.textMutedLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 4,
  },
  ownerRow: globalStyles.row,
  // avatar: globalStyles.avatarSmall,
  ownerText: {
    color: Colors.textMuted,
  },
  due: {
    color: Colors.textMutedLight,
    marginTop: 6,
  },

  actionBtn: {
    ...globalStyles.buttonOutline,
    marginLeft: 8,
  },
  actionPrimary: { backgroundColor: '#6b0f0f', borderColor: '#6b0f0f' },
  actionText: { color: '#fff', fontWeight: '700' },
  actionTextMuted: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
  actionGoldOutline: globalStyles.buttonGoldOutline,
  actionTextGold: globalStyles.buttonTextGold,
  actionDenyConfirm: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accentDark,
  },
  actionTextDenyConfirm: {
    color: Colors.background,
    fontWeight: '700',
  },
  cancelXButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveActions: { flexDirection: 'column', alignItems: 'flex-end' },
  approveActionBtn: { marginLeft: 0, marginTop: 8, width: 96, alignItems: 'center', justifyContent: 'center' },
  pill: globalStyles.pill,
  pillApproved: globalStyles.pillApproved,
  pillRequested: globalStyles.pillRequested,
  pillText: globalStyles.pillText,
  pillTextLight: globalStyles.pillTextLight,
  pillTextDark: globalStyles.pillTextDark,

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: '85%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLighter,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.borderForm,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  formTextArea: {
    minHeight: 80,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderForm,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    minHeight: 44,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'left',
  },
  dateInputPlaceholder: {
    color: Colors.textMutedLight,
  },
  datePickerWrapper: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  datePickerCompact: {
    alignSelf: 'flex-start',
  },
  notifyButton: {
    backgroundColor: Colors.accentDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  notifyButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});


