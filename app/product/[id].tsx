import type { Product } from '@/types/product';
import { Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  headerShown: true,
};

const products = require('@/data/products.json') as Product[];

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loaded] = useFonts({ Raleway_500Medium, Raleway_700Bold });
  const product = products.find((p) => p.id === id);

  if (!loaded) return null;

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}> 
        <View style={{ padding: 16 }}>
          <Text>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}> 
      <View style={{ padding: 40 }}></View>
      <ScrollView contentContainerStyle={styles.container}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.hero} contentFit="contain" />
        ) : (
          <View style={[styles.hero, { backgroundColor: '#EEE' }]} />
        )}

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
        </View>

        <Card>
          <Row label="Size" value={product.sizeLabel ?? (product.sizes?.join(', ') || '—')} />
          <Row label="Material" value={product.material || '—'} />
          <Row label="Color" value={product.color || '—'} />
          <Row label="Occasion" value={product.occasion || '—'} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{product.description || '—'}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Washing Instructions</Text>
          <Text style={styles.body}>{product.washingInstructions || '—'}</Text>
        </Card>

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
          </View>
          <Pressable style={[styles.button, { marginTop: 16 }]}>
            <Text style={styles.buttonText}>Request to Borrow</Text>
          </Pressable>
        </Card>
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
});


