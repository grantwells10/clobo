import { getActivityItems, removeActivityItem } from '@/data/activityStore';
import { getUserListing, removeUserListing } from '@/data/userListings';
import { addUserRequest, getUserRequests, removeUserRequest } from '@/data/userRequests';
import type { Product } from '@/types/product';
import { Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  headerShown: false,
};

const products = require('@/data/products.json') as Product[];
const users = require('@/data/users.json') as Array<{ name: string; phone?: string; avatarUrl?: string }>;

export default function ProductDetail() {
  const { id, isOwnListing, isBorrowing } = useLocalSearchParams<{ id: string; isOwnListing?: string; isBorrowing?: string }>();
  const [loaded] = useFonts({ Raleway_500Medium, Raleway_700Bold });
  const router = useRouter();
  const [isRequested, setIsRequested] = useState(false);
  
  // Check if this is the user's own listing
  const isOwn = isOwnListing === 'true';
  const isCurrentlyBorrowing = isBorrowing === 'true';
  const userListing = isOwn ? getUserListing(id) : null;
  // Always try to find product, even if isOwn is true (for activity items)
  const product = products.find((p) => p.id === id) || null;
  // Also check if product owner is "You" to hide lender info
  const isOwnedByUser = product?.owner?.name === 'You' || isOwn;
  
  // Check if this item is being lent (has activity with role 'lending' and status 'current')
  const activityItems = getActivityItems();
  const lendingActivity = activityItems.find(
    (a) => a.id === id && a.owner?.name === 'You' && a.activity?.role === 'lending' && a.activity?.status === 'current'
  );
  const isCurrentlyLending = !!lendingActivity;
  const borrower = lendingActivity?.activity?.person;
  
  // Look up borrower's phone number from users
  const borrowerUser = borrower ? users.find(u => u.name === borrower.name) : null;
  const borrowerPhone = borrowerUser?.phone;

  // Check if product is already requested
  const checkIfRequested = useCallback(() => {
    if (!product) return;
    const userRequests = getUserRequests();
    const requested = userRequests.some(req => req.id === product.id);
    setIsRequested(requested);
  }, [product]);

  // Initial check on mount
  useEffect(() => {
    checkIfRequested();
  }, [checkIfRequested]);

  // Refresh requested status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkIfRequested();
    }, [checkIfRequested])
  );

  const handleRequestToBorrow = () => {
    if (!product) return;
    
    if (isRequested) {
      // Undo request
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
              removeUserRequest(product.id);
              setIsRequested(false);
              // Navigate back to search page
              router.push('/search');
            },
          },
        ]
      );
    } else {
      // Add new request
      addUserRequest(product);
      setIsRequested(true);
      // Navigate to activity page with requests tab
      router.push({ pathname: '/activity', params: { initialTab: 'requests' } });
    }
  };
  
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

  // Handle image source - user listings are already converted (number or { uri }), products are string URLs
  const imageSource = isOwn && userListing 
    ? userListing.imageUrl  // Already converted in profile.tsx - either number (require()) or { uri: string }
    : (item?.imageUrl ? { uri: item.imageUrl } : null);

  const [modalVisible, setModalVisible] = useState(false); // Kept for other modals if needed

  function contactPerson(phone: string, method: 'imessage' | 'sms' | 'whatsapp') {
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
      .catch(() => Alert.alert('Error', 'Unable to contact person.'));
  }

  function showContactOptions(name: string, phone: string | undefined) {
    if (!phone) {
      Alert.alert('Error', `No phone number available for ${name}.`);
      return;
    }
    
    Alert.alert(
      `Contact ${name}`,
      `Choose a method to contact ${name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message (iMessage/SMS)', onPress: () => contactPerson(phone, 'imessage') },
        { text: 'WhatsApp', onPress: () => contactPerson(phone, 'whatsapp') },
      ]
    );
  }

  const handleDeleteListing = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? Any pending requests will be automatically denied.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Remove any activity items (requests) related to this product
            removeActivityItem(id);
            
            // Remove from user listings
            removeUserListing(id);
            
            // Navigate back to profile
            if (router.canGoBack()) {
              router.dismissAll();
            }
            router.replace('/(tabs)/profile');
          },
        },
      ]
    );
  };

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

  return (
    <SafeAreaView style={styles.safe}> 
      <View style={{ flex: 1 }}>
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

          {!isOwnedByUser && product && (
            <Card>
              <Text style={styles.sectionTitle}>Lender Info</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
                {product.owner?.avatarUrl ? (
                  <Image source={{ uri: product.owner.avatarUrl }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#DDD' }]} />
                )}
                <View style={{ flex: 1 }}>
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
                      showContactOptions(product.owner!.name, product.owner!.phone!)
                    }
                  >
                    <MessageCircle size={24} color="#555" />
                  </TouchableOpacity>
                ) : null}
              </View>
              {!isCurrentlyBorrowing && (
                <Pressable 
                  style={[
                    styles.button, 
                    { marginTop: 16 },
                    isRequested && styles.buttonRequested
                  ]} 
                  onPress={handleRequestToBorrow}
                >
                  <Text style={[styles.buttonText, isRequested && styles.buttonTextRequested]}>
                    {isRequested ? 'Cancel Request' : 'Request to Borrow'}
                  </Text>
                </Pressable>
              )}
            </Card>
          )}

          {isCurrentlyLending && borrower && (
            <Card>
              <Text style={styles.sectionTitle}>Borrower Info</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
                {borrower.avatarUrl ? (
                  <Image source={{ uri: borrower.avatarUrl }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#DDD' }]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerName}>{borrower.name || '—'}</Text>
                  {lendingActivity?.activity?.dueDate && (
                    <Text style={styles.muted}>
                      Return by: {new Date(lendingActivity.activity.dueDate).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  )}
                </View>
                {borrowerPhone ? (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() =>
                      showContactOptions(borrower.name, borrowerPhone)
                    }
                  >
                    <MessageCircle size={24} color="#555" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </Card>
          )}

          {isOwn && !isCurrentlyLending && (
            <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 16 }}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteListing}>
                <Text style={styles.deleteButtonText}>Delete Listing</Text>
              </TouchableOpacity>
            </View>
          )}

          <Modal
            visible={false} // Modal logic removed in favor of Alert
            transparent
            animationType="slide"
          >
          </Modal>
        </ScrollView>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#11181C" />
        </TouchableOpacity>
      </View>
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
  buttonRequested: {
    backgroundColor: '#E6E8EB',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Raleway_500Medium',
    fontSize: 16,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
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
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#222' },
  buttonTextRequested: {
    color: '#687076',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d32f2f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontFamily: 'Raleway_700Bold',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


