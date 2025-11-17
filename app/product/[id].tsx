import { getUserListing } from '@/data/userListings';
import type { Product } from '@/types/product';
import { Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  headerShown: true,
};

const products = require('@/data/products.json') as Product[];

export default function ProductDetail() {
  const { id, isOwnListing } = useLocalSearchParams<{ id: string; isOwnListing?: string }>();
  const [loaded] = useFonts({ Raleway_500Medium, Raleway_700Bold });
  
  // Check if this is the user's own listing
  const isOwn = isOwnListing === 'true';
  const userListing = isOwn ? getUserListing(id) : null;
  const product = !isOwn ? products.find((p) => p.id === id) : null;
  
  // Use user listing data if it's their own, otherwise use product data
  const item = isOwn && userListing ? {
    id: userListing.id,
    title: userListing.title || userListing.alt,
    brand: userListing.brand || '',
    imageUrl: typeof userListing.imageUrl === 'object' && 'uri' in userListing.imageUrl ? userListing.imageUrl.uri : '',
    sizeLabel: userListing.sizeLabel,
    material: userListing.material,
    color: userListing.color,
    occasion: userListing.occasion,
    description: userListing.description,
    washingInstructions: userListing.washingInstructions,
    sizes: userListing.sizeLabel ? [userListing.sizeLabel] : undefined,
  } : product;

  const [modalVisible, setModalVisible] = useState(false);
  const [contactingOwner, setContactingOwner] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  function contactOwner(phone: string, method: 'imessage' | 'sms' | 'whatsapp') {
    const digits = phone.replace(/\D/g, '');
    let url = '';
    if (method === 'imessage' || method === 'sms') {
      url = `sms:${digits}`; // Will use iMessage if available
    } else if (method === 'whatsapp') {
      url = `whatsapp://send?phone=1${digits}`; // USA code; change for other regions
    }
    Linking.canOpenURL(url)
      .then(supported => supported
        ? Linking.openURL(url)
        : Alert.alert(method === 'whatsapp' ? 'WhatsApp not installed' : 'Messages app not found')
      )
      .catch(() => Alert.alert('Error', 'Unable to contact lender.'));
  }

  function showContactModal(owner: { name: string, phone: string }) {
    setContactingOwner(owner);
    setModalVisible(true);
  }
  function closeContactModal() {
    setModalVisible(false);
    setContactingOwner(null);
  }

  if (!loaded) return null;

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}> 
        <View style={{ padding: 16 }}>
          <Text>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle image source - user listings are already converted (number or { uri }), products are string URLs
  const imageSource = isOwn && userListing 
    ? userListing.imageUrl  // Already converted in profile.tsx - either number (require()) or { uri: string }
    : (item?.imageUrl ? { uri: item.imageUrl } : null);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}> 
      <View style={{ padding: 40 }}></View>
      <ScrollView contentContainerStyle={styles.container}>
        {imageSource ? (
          <Image source={imageSource} style={styles.hero} contentFit="contain" />
        ) : (
          <View style={[styles.hero, { backgroundColor: '#EEE' }]} />
        )}

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.brand}>{item.brand}</Text>
        </View>

        <Card>
          <Row label="Size" value={item.sizeLabel ?? (item.sizes?.join(', ') || '—')} />
          <Row label="Material" value={item.material || '—'} />
          <Row label="Color" value={item.color || '—'} />
          <Row label="Occasion" value={item.occasion || '—'} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{item.description || '—'}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Washing Instructions</Text>
          <Text style={styles.body}>{item.washingInstructions || '—'}</Text>
        </Card>

        {!isOwn && product && (
          <Card>
            <Text style={styles.sectionTitle}>Lender Info</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
              {product.owner?.avatarUrl ? (
                <Image source={{ uri: product.owner.avatarUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#DDD' }]} />
              )}
              <View>
                <Text style={styles.ownerName}>{product.owner?.name || '—'}</Text>
                <View style={{ gap: 2 }}>
                  {typeof product.owner?.mutualFriends === 'number' ? (
                    <Text style={styles.muted}>{product.owner.mutualFriends} mutual friends</Text>
                  ) : null}
                  {typeof product.distanceKm === 'number' ? (
                    <Text style={styles.muted}>{product.distanceKm.toFixed(1)} km away</Text>
                  ) : null}
                </View>
              </View>
              {product.owner?.phone ? (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    showContactModal({ name: product.owner!.name, phone: product.owner!.phone! })
                  }
                >
                  <FontAwesome name="comment" size={24} color="#555" />
                </TouchableOpacity>
              ) : null}
            </View>
            <Pressable style={[styles.button, { marginTop: 16 }]}>
              <Text style={styles.buttonText}>Request to Borrow</Text>
            </Pressable>
          </Card>
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeContactModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalSheet}>
              {contactingOwner && (
                <>
                  <Text style={[styles.ownerName, { fontSize: 18, marginBottom: 6 }]}>Contact {contactingOwner.name}</Text>
                  <Text style={styles.muted}>{contactingOwner.phone}</Text>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => { contactOwner(contactingOwner.phone, 'imessage'); closeContactModal(); }}>
                    <Text style={styles.modalBtnText}>Message (iMessage/SMS)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => { contactOwner(contactingOwner.phone, 'whatsapp'); closeContactModal(); }}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}> 
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    paddingBottom: 24,
  },
  hero: {
    width: '100%',
    height: 340,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway_700Bold',
    color: '#11181C',
  },
  brand: {
    marginTop: 4,
    color: '#687076',
    fontFamily: 'Raleway_500Medium',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  sectionTitle: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 18,
    color: '#11181C',
    marginBottom: 8,
  },
  body: {
    color: '#11181C',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F4',
  },
  rowLabel: {
    color: '#687076',
  },
  rowValue: {
    color: '#11181C',
    fontFamily: 'Raleway_500Medium',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEE',
  },
  ownerName: {
    color: '#11181C',
    fontFamily: 'Raleway_500Medium',
  },
  muted: {
    color: '#687076',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#550000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Raleway_500Medium',
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
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
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#222' }
});


