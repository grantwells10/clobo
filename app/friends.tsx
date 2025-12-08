import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Linking, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import usersStore from '../data/usersStore';

// hide the default header provided by the router for this screen
export const options = {
  headerShown: false,
};

type User = any;

export default function FriendsScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(usersStore.getUsers());
  const [phone, setPhone] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  const [contacting, setContacting] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const friends = useMemo(() => users.filter((u) => u.isFriend), [users]);

  function findMatchByLast10(cleanDigits: string) {
    if (!cleanDigits) return null;
    const last10 = cleanDigits.slice(-10);
    return users.find((u) => (u.phone || '').replace(/\D/g, '').slice(-10) === last10) ?? null;
  }

  function lookup() {
    const raw = (phone || '').trim();
    const clean = raw.replace(/\D/g, '');
    // require full 10-digit match (US numbers) for exact lookup
    if (!clean || clean.length < 10) {
      setSelected(null);
      setNotFound(true);
      return;
    }
    const found = findMatchByLast10(clean);
    if (found) {
      setSelected(found);
      setNotFound(false);
    } else {
      setSelected(null);
      setNotFound(true);
    }
  }

  function addFriend(id: string) {
    usersStore.addFriendById(id);
    setSelected((s: User | null) => s && s.id === id ? { ...s, isFriend: true } : s);
  }

  function contactFriend(phone: string, method: 'imessage' | 'sms' | 'whatsapp') {
    const numberOnly = phone.replace(/\D/g, '');
    let url = '';
    if (method === 'imessage' || method === 'sms') {
      url = `sms:${numberOnly}`;
    } else if (method === 'whatsapp') {
      url = `whatsapp://send?phone=${numberOnly}`;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(
            'App Not Found',
            method === 'whatsapp'
              ? 'WhatsApp is not installed'
              : 'Cannot open Messages app'
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(() =>
        Alert.alert('Error', 'Could not complete the action. Please try again.')
      );
  }

  function showContactModal(friend: User) {
    setContacting(friend);
    setModalVisible(true);
  }

  function closeContactModal() {
    setContacting(null);
    setModalVisible(false);
  }

  // subscribe to store updates
  useEffect(() => {
    const unsub = usersStore.subscribe(() => setUsers(usersStore.getUsers()));
    return unsub;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Friends</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.lookupRowFull}>
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#b8860b"
          value={phone}
          onChangeText={(txt) => {
            setPhone(txt);
            setNotFound(false);
            const clean = (txt || '').replace(/\D/g, '');
            if (clean.length >= 10) {
              const found = findMatchByLast10(clean);
              if (found) setSelected(found);
              else setSelected(null);
            } else {
              setSelected(null);
            }
          }}
          style={styles.inputFull}
          keyboardType="phone-pad"
          returnKeyType="search"
          onSubmitEditing={lookup}
        />
      </View>

      {selected ? (
        <View style={styles.selectedCard}>
          <Image source={{ uri: selected.avatarUrl }} style={styles.avatarLarge} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{selected.name}</Text>
            <Text style={styles.phone}>{selected.phone}</Text>
          </View>
          {!selected.isFriend ? (
            <TouchableOpacity style={[styles.actionBtn, styles.actionPrimary]} onPress={() => addFriend(selected.id)}>
              <Text style={styles.actionText}>Add Friend</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionBtn, styles.actionDisabled]}>
              <Text style={styles.actionDisabledText}>Friend</Text>
            </View>
          )}
        </View>
      ) : null}

      {notFound && !selected ? (
        <Text style={styles.notFoundText}>No user found.</Text>
      ) : null}

      <Text style={styles.sub}>My Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendRow}
            onPress={() => showContactModal(item)}
          >
            <Image source={{ uri: item.avatarUrl }} style={styles.avatarSmall} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeContactModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalSheet}>
            {contacting && (
              <>
                <Text style={[styles.name, { fontSize: 18, marginBottom: 6 }]}>Contact {contacting.name}</Text>
                <Text style={styles.phone}>{contacting.phone}</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={() => { contactFriend(contacting.phone, 'imessage'); closeContactModal(); }}>
                  <Text style={styles.modalBtnText}>Message (iMessage/SMS)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtn} onPress={() => { contactFriend(contacting.phone, 'whatsapp'); closeContactModal(); }}>
                  <Text style={styles.modalBtnText}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtn} onPress={closeContactModal}>
                  <Text style={[styles.modalBtnText, { color: 'red' }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20 },
  lookupRowFull: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '100%' },
  inputFull: { flex: 1, borderWidth: 2, borderColor: '#DAA520', padding: 12, borderRadius: 12, backgroundColor: '#fff' },
  // activity-style buttons
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginLeft: 8 },
  actionPrimary: { backgroundColor: '#6b0f0f', borderColor: '#6b0f0f' },
  actionText: { color: '#fff', fontWeight: '700' },
  actionTextMuted: { color: '#666', fontWeight: '700' },
  actionGoldOutline: { backgroundColor: '#fff', borderColor: '#d4af37' },
  actionTextGold: { color: '#d4af37', fontWeight: '700' },
  selectedCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 12 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20 },
  name: { fontWeight: '700' },
  phone: { color: '#666' },
  already: { color: '#666', fontWeight: '700' },
  actionDisabled: { backgroundColor: '#fff', borderColor: '#eee', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  actionDisabledText: { color: '#999', fontWeight: '700' },
  sub: { fontWeight: '700', marginTop: 10, marginBottom: 8, color: '#666' },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f4f4f4' },
  notFoundText: { color: 'gray', fontWeight: '700', textAlign: 'center', marginTop: 12 },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    marginHorizontal: 0,
    alignItems: 'center',
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
});
