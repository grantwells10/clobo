import type { Product } from '@/types/product';
import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import { Image } from 'expo-image';
import { ChevronDown, MapPin, Search as SearchIcon } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const productsData = require('@/data/products.json') as Product[];

export default function SearchScreen() {
  const [loaded] = useFonts({ Raleway_500Medium });
  const [query, setQuery] = useState('');

  const contentPadding = 16;
  const gap = 12;
  const numColumns = 3;
  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const totalHorizontal = contentPadding * 2 + gap * (numColumns - 1);
    return Math.floor((screenWidth - totalHorizontal) / numColumns);
  }, [contentPadding, gap, numColumns]);

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productsData;
    return productsData.filter((p) => {
      const title = (p.title ?? '').toLowerCase();
      const brand = (p.brand ?? '').toLowerCase();
      return title.includes(q) || brand.includes(q);
    });
  }, [query]);

  if (!loaded) return null;

  return (
    // specifying top removes the annoying bottom padding above navbar
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={filteredData}
        keyExtractor={(item: Product) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: contentPadding, paddingBottom: 8 }}
        columnWrapperStyle={{ gap }}
        ListHeaderComponent={<SearchHeader query={query} setQuery={setQuery} />}
        ListEmptyComponent={<EmptyResults query={query} />}
        renderItem={({ item }) => (
          <ProductCard item={item} width={cardWidth} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SearchHeader({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Search</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchIcon color="#11181C" size={18} />
          <TextInput
            placeholder="Search clothing, brand, or keyword"
            placeholderTextColor="#687076"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
        <View style={styles.locButton}>
          <MapPin color="#11181C" size={18} />
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.inlineRow}>
          <MapPin color="#11181C" size={16} />
          <Text style={styles.metaText}>Within 5 km</Text>
        </View>
        <View style={styles.inlineRow}>
          <Text style={styles.metaText}>Recommended</Text>
          <ChevronDown color="#11181C" size={16} />
        </View>
      </View>

      <View style={styles.chipsRow}>
        <Chip label="Size" />
        <Chip label="Material" />
        <Chip label="Color" />
        <Chip label="Occasion" />
        {/* <View style={styles.filterIcon}>
          <SlidersHorizontal color="#11181C" size={16} />
        </View> */}
      </View>
    </View>
  );
}

function EmptyResults({ query }: { query: string }) {
  if (!query) return null;
  return (
    <View style={{ paddingVertical: 24 }}>
      <Text style={{ textAlign: 'center', color: '#687076' }}>No results for “{query}”.</Text>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function ProductCard({ item, width }: { item: Product; width: number }) {
  return (
    <View style={[styles.card, { width }]}> 
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <Text style={styles.brand}>{item.brand}</Text>
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: '#11181C',
    fontFamily: 'Raleway_500Medium',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#11181C',
  },
  locButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
    backgroundColor: '#ffffff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#11181C',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7CBD1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  chipText: {
    color: '#11181C',
  },
  filterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7CBD1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  card: {
    marginTop: 8,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F6F6F6',
  },
  brand: {
    marginTop: 8,
    color: '#687076',
  },
  title: {
    color: '#11181C',
    fontFamily: 'Raleway_500Medium',
  },
});


