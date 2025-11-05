import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rawActivity = require('../../data/activity.json');

type ActivityItem = typeof rawActivity[number];

export default function ActivityScreen() {
  const [items, setItems] = useState<ActivityItem[]>(rawActivity);
  const [loaded] = useFonts({ Raleway_500Medium });
  const [tab, setTab] = useState<'current' | 'requests'>('current');

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

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.scroll}>
        <Text style={styles.header}>Activity</Text>

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
                  renderItem={({ item }) => <ActivityCard item={item} type="borrow" />}
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

function ActivityCard({ item, type, onApprove, onDeny }: { item: ActivityItem; type: 'borrow' | 'lend' | 'yourRequest' | 'approveRequest' ; onApprove?: (id: string) => void; onDeny?: (id: string) => void }) {
  const personName = item.activity?.person?.name ?? item.owner?.name;
  const avatar = item.activity?.person?.avatarUrl ?? item.owner?.avatarUrl;

  if (type === 'yourRequest') {
    const status = item.activity?.status === 'approved' ? 'Approved' : 'Requested';
    const ownerName = item.owner?.name ?? item.activity?.person?.name;
    return (
      <View style={styles.card}>
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
      </View>
    );
  }

  if (type === 'approveRequest') {
    return (
      <View style={styles.card}>
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
          <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline, styles.approveActionBtn]} onPress={() => onApprove && onApprove(item.id)}>
            <Text style={styles.actionTextGold}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.approveActionBtn]} onPress={() => onDeny && onDeny(item.id)}>
            <Text style={styles.actionTextMuted}>Deny</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const actionLabel = type === 'borrow' ? 'Return' : type === 'lend' ? 'Receive' : 'View';
  const showButton = type === 'borrow';

  return (
    <View style={styles.card}>
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
        <TouchableOpacity style={[styles.actionBtn, styles.actionGoldOutline]}>
          <Text style={styles.actionTextGold}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  segmentWrap: { flexDirection: 'row', backgroundColor: '#f2f2f2', borderRadius: 24, padding: 6, marginBottom: 16 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  segmentRight: { marginLeft: 6 },
  segmentText: { color: '#666' },
  segmentActive: { backgroundColor: '#fff' },
  segmentTextActive: { color: '#111', fontWeight: '600' },

  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 8 },
  emptyText: { color: '#999', padding: 12 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  thumb: { width: 72, height: 72, borderRadius: 8, marginRight: 12, backgroundColor: '#ddd' },
  cardBody: { flex: 1 },
  brand: { fontSize: 12, color: '#999' },
  title: { fontSize: 16, fontWeight: '700', color: '#111', marginVertical: 4 },
  ownerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 20, height: 20, borderRadius: 10, marginRight: 8 },
  ownerText: { color: '#666' },
  due: { color: '#999', marginTop: 6 },

  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginLeft: 8 },
  actionPrimary: { backgroundColor: '#6b0f0f', borderColor: '#6b0f0f' },
  actionText: { color: '#fff', fontWeight: '700' },
  actionTextMuted: { color: '#666', fontWeight: '700' },
  actionGoldOutline: { backgroundColor: '#fff', borderColor: '#d4af37' },
  actionTextGold: { color: '#d4af37', fontWeight: '700' },

  approveActions: { flexDirection: 'column', alignItems: 'flex-end' },
  approveActionBtn: { marginLeft: 0, marginTop: 8, width: 96, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  pillApproved: { backgroundColor: '#6b0f0f' },
  pillRequested: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  pillText: { fontWeight: '700' },
  pillTextLight: { color: '#fff' },
  pillTextDark: { color: '#666' }
});


