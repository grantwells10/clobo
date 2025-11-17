import { getUserRequests } from '@/data/userRequests';
import { Colors, globalStyles } from '@/styles/globalStyles';
import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rawActivity = require('../../data/activity.json');

type ActivityItem = typeof rawActivity[number];

export default function ActivityScreen() {
  const { initialTab } = useLocalSearchParams<{ initialTab?: string }>();
  const [items, setItems] = useState<ActivityItem[]>(rawActivity);
  const [loaded] = useFonts({ Raleway_500Medium });
  const [tab, setTab] = useState<'current' | 'requests'>(
    initialTab === 'requests' ? 'requests' : 'current'
  );

  // Function to refresh items from store
  const refreshItems = useCallback(() => {
    const userRequests = getUserRequests();
    // Filter out items that have activity.person.name === 'You' and status === 'requested' (hardcoded ones)
    const filteredActivity = rawActivity.filter((it: ActivityItem) => 
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
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, activity: { ...it.activity, status: 'approved' } } : it));
  }

  function handleDeny(id: string) {
    setItems((prev) => prev.map((it) => it.id === id ? (() => { const copy = { ...it }; delete (copy as any).activity; return copy; })() : it));
  }

  function handleReturn(id: string) {
    setItems((prev) => prev.map((it) => it.id === id ? (() => { const copy = { ...it }; delete (copy as any).activity; return copy; })() : it));
  }

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.scroll}>
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
                <FlatList
                  data={currentBorrowing}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => <ActivityCard item={item} type="borrow" onReturn={handleReturn} />}
                />
              )}
            </Section>

            <Section title="Currently Lending">
              {currentLending.length === 0 ? <Empty text="No current lends" /> : (
                <FlatList
                  data={currentLending}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => <ActivityCard item={item} type="lend" />}
                />
              )}
            </Section>
          </View>
        ) : (
          <View>
            <Section title="Your Requests">
              {yourRequests.length === 0 ? <Empty text="No requests" /> : (
                <FlatList
                  data={yourRequests}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => <ActivityCard item={item} type="yourRequest" />}
                />
              )}
            </Section>

            <Section title="Approve Requests">
              {approveRequests.length === 0 ? (
                <Empty text="No incoming requests" />
              ) : (
                <FlatList
                  data={approveRequests}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => <ActivityCard item={item} type="approveRequest" onApprove={handleApprove} onDeny={handleDeny} />}
                />
              )}
            </Section>
          </View>
        )}

      </View>
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

function ActivityCard({ item, type, onApprove, onDeny, onReturn }: { item: ActivityItem; type: 'borrow' | 'lend' | 'yourRequest' | 'approveRequest' ; onApprove?: (id: string) => void; onDeny?: (id: string) => void; onReturn?: (id: string) => void }) {
  const router = useRouter();
  const personName = item.activity?.person?.name ?? item.owner?.name;
  const avatar = item.activity?.person?.avatarUrl ?? item.owner?.avatarUrl;

  const handlePress = () => {
    router.push({ pathname: '/product/[id]', params: { id: item.id } });
  };

  if (type === 'yourRequest') {
    const status = item.activity?.status === 'approved' ? 'Approved' : 'Requested';
    const ownerName = item.owner?.name ?? item.activity?.person?.name;
    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.ownerRow}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <Text style={styles.ownerText}>{`From ${ownerName}`}</Text>
          </View>
        </View>
        <View style={[styles.pill, item.activity?.status === 'approved' ? styles.pillApproved : styles.pillRequested]}>
          <Text style={[styles.pillText, item.activity?.status === 'approved' ? styles.pillTextLight : styles.pillTextDark]}>{status}</Text>
        </View>
      </Pressable>
    );
  }

  if (type === 'approveRequest') {
    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.ownerRow}>
            <Image source={{ uri: item.activity?.person?.avatarUrl || item.owner?.avatarUrl }} style={styles.avatar} />
            <Text style={styles.ownerText}>{item.activity?.person?.name}</Text>
          </View>
        </View>
        <View style={styles.approveActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline, styles.approveActionBtn]} onPress={(e) => { e.stopPropagation(); onApprove && onApprove(item.id); }}>
            <Text style={styles.actionTextGold}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.approveActionBtn]} onPress={(e) => { e.stopPropagation(); onDeny && onDeny(item.id); }}>
            <Text style={styles.actionTextMuted}>Deny</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  }

  const actionLabel = type === 'borrow' ? 'Return' : type === 'lend' ? 'Receive' : 'View';
  const showButton = type === 'borrow';

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.ownerRow}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.ownerText}>{type === 'borrow' ? `From ${personName}` : type === 'lend' ? `To ${personName}` : personName}</Text>
        </View>
        {item.activity?.dueDate ? <Text style={styles.due}>{type === 'lend' ? 'Receive by:' : 'Return by:'} {formatDate(item.activity.dueDate)}</Text> : null}
      </View>
      {showButton ? (
        <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline]} onPress={(e) => { e.stopPropagation(); onReturn && onReturn(item.id); }}>
          <Text style={styles.actionTextGold}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </Pressable>
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
  avatar: globalStyles.avatarSmall,
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

  approveActions: { flexDirection: 'column', alignItems: 'flex-end' },
  approveActionBtn: { marginLeft: 0, marginTop: 8, width: 96, alignItems: 'center', justifyContent: 'center' },
  pill: globalStyles.pill,
  pillApproved: globalStyles.pillApproved,
  pillRequested: globalStyles.pillRequested,
  pillText: globalStyles.pillText,
  pillTextLight: globalStyles.pillTextLight,
  pillTextDark: globalStyles.pillTextDark,
});


