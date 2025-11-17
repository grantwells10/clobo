import { getUserRequests } from '@/data/userRequests';
import { Colors, globalStyles } from '@/styles/globalStyles';
import type { Product } from '@/types/product';
import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Check, ChevronDown, MapPin, Search as SearchIcon } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const productsData = require('@/data/products.json') as Product[];

export default function SearchScreen() {
  const [loaded] = useFonts({ Raleway_500Medium });
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<null | 'size' | 'material' | 'color' | 'occasion'>(null);
  const [filters, setFilters] = useState<{ size: string | null; material: string | null; color: string | null; occasion: string | null }>({ size: null, material: null, color: null, occasion: null });
  const [sortOption, setSortOption] = useState<'popularity' | 'distance'>('popularity');
  const [sortOpen, setSortOpen] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  // Refresh requested IDs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const userRequests = getUserRequests();
      const ids = new Set(userRequests.map(req => req.id));
      setRequestedIds(ids);
    }, [])
  );

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
    return productsData.filter((p) => {
      // Filter out products that have been requested
      if (requestedIds.has(p.id)) {
        return false;
      }
      const title = (p.title ?? '').toLowerCase();
      const brand = (p.brand ?? '').toLowerCase();
      const matchQuery = q ? title.includes(q) || brand.includes(q) : true;
      const matchSize = filters.size ? (p.sizes ?? []).includes(filters.size) : true;
      const matchMaterial = filters.material ? (p.material ?? '').toLowerCase() === filters.material.toLowerCase() : true;
      const matchColor = filters.color ? (p.color ?? '').toLowerCase() === filters.color.toLowerCase() : true;
      const matchOccasion = filters.occasion ? (p.occasion ?? '').toLowerCase() === filters.occasion.toLowerCase() : true;
      return matchQuery && matchSize && matchMaterial && matchColor && matchOccasion;
    });
  }, [query, filters, requestedIds]);

  const sortedData = useMemo(() => {
    const copy = [...filteredData];
    if (sortOption === 'popularity') {
      copy.sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
    } else {
      const BIG = 1e9;
      copy.sort((a, b) => (a.distanceKm ?? BIG) - (b.distanceKm ?? BIG));
    }
    return copy;
  }, [filteredData, sortOption]);

  const sizeOptions = useMemo(() => Array.from(new Set(productsData.flatMap((p) => p.sizes ?? []))), []);
  const materialOptions = useMemo(() => Array.from(new Set(productsData.map((p) => p.material).filter(Boolean))) as string[], []);
  const colorOptions = useMemo(() => Array.from(new Set(productsData.map((p) => p.color).filter(Boolean))) as string[], []);
  const occasionOptions = useMemo(() => Array.from(new Set(productsData.map((p) => p.occasion).filter(Boolean))) as string[], []);

  if (!loaded) return null;

  return (
    // specifying top removes the annoying bottom padding above navbar
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        style={styles.list}
        data={sortedData}
        keyExtractor={(item: Product) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: contentPadding, paddingBottom: 8 }}
        columnWrapperStyle={{ gap }}
        onScrollBeginDrag={() => setSortOpen(false)}
        ListHeaderComponentStyle={{ zIndex: 100, elevation: 4, backgroundColor: '#ffffff' }}
        ListHeaderComponent={
          <SearchHeader
            query={query}
            setQuery={setQuery}
            activeChip={activeChip}
            setActiveChip={setActiveChip}
            filters={filters}
            setFilters={setFilters}
            options={{ size: sizeOptions, material: materialOptions, color: colorOptions, occasion: occasionOptions }}
            sortOption={sortOption}
            setSortOption={setSortOption}
            sortOpen={sortOpen}
            setSortOpen={setSortOpen}
          />
        }
        ListEmptyComponent={<EmptyResults query={query} />}
        renderItem={({ item }) => (
          <ProductCard item={item} width={cardWidth} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SearchHeader(
  { query, setQuery, activeChip, setActiveChip, filters, setFilters, options, sortOption, setSortOption, sortOpen, setSortOpen }: {
    query: string;
    setQuery: (q: string) => void;
    activeChip: null | 'size' | 'material' | 'color' | 'occasion';
    setActiveChip: (k: null | 'size' | 'material' | 'color' | 'occasion') => void;
    filters: { size: string | null; material: string | null; color: string | null; occasion: string | null };
    setFilters: (f: { size: string | null; material: string | null; color: string | null; occasion: string | null }) => void;
    options: { size: string[]; material: string[]; color: string[]; occasion: string[] };
    sortOption: 'popularity' | 'distance';
    setSortOption: (s: 'popularity' | 'distance') => void;
    sortOpen: boolean;
    setSortOpen: (b: boolean) => void;
  }
) {
  const sortLabel = sortOption === 'popularity' ? 'Popularity' : 'Distance';
  return (
    <View style={styles.headerContainer}>
      {sortOpen && <Pressable style={styles.headerOverlay} onPress={() => setSortOpen(false)} />}

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
        <View style={styles.sortWrapper}>
          <Pressable style={styles.inlineRow} onPress={() => setSortOpen(!sortOpen)}>
            <Text style={styles.metaText}>{sortLabel}</Text>
            <ChevronDown color="#11181C" size={16} />
          </Pressable>
          {sortOpen && (
            <View style={styles.dropdown}>
              <DropdownItem
                label="Popularity"
                selected={sortOption === 'popularity'}
                onPress={() => { setSortOption('popularity'); setSortOpen(false); }}
              />
              <DropdownItem
                label="Distance"
                selected={sortOption === 'distance'}
                onPress={() => { setSortOption('distance'); setSortOpen(false); }}
              />
            </View>
          )}
        </View>
      </View>


      <View style={styles.chipsRow}>
        <FilterChip label="Size" active={activeChip === 'size' || !!filters.size} onPress={() => setActiveChip(activeChip === 'size' ? null : 'size')} />
        <FilterChip label="Material" active={activeChip === 'material' || !!filters.material} onPress={() => setActiveChip(activeChip === 'material' ? null : 'material')} />
        <FilterChip label="Color" active={activeChip === 'color' || !!filters.color} onPress={() => setActiveChip(activeChip === 'color' ? null : 'color')} />
        <FilterChip label="Occasion" active={activeChip === 'occasion' || !!filters.occasion} onPress={() => setActiveChip(activeChip === 'occasion' ? null : 'occasion')} />
      </View>

      {activeChip && (
        <View style={styles.optionsRow}>
          {options[activeChip].map((opt) => (
            <OptionChip
              key={opt}
              label={opt}
              selected={filters[activeChip] === opt}
              onPress={() => {
                const next = filters[activeChip] === opt ? null : opt;
                setFilters({ ...filters, [activeChip]: next });
              }}
            />
          ))}
          <OptionChip label="Clear" selected={false} onPress={() => setFilters({ ...filters, [activeChip]: null })} />
        </View>
      )}
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

function FilterChip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function OptionChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.optionChip, selected ? styles.optionChipSelected : null]}>
      <Text style={[styles.optionChipText, selected ? styles.optionChipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function DropdownItem({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.dropdownItem}>
      <Text style={[styles.dropdownText, selected ? styles.dropdownTextSelected : null]}>{label}</Text>
      {selected ? <Check size={16} color="#11181C" /> : null}
    </Pressable>
  );
}

function ProductCard({ item, width }: { item: Product; width: number }) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.card, { width }]}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: globalStyles.screen,
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
    position: 'relative',
    zIndex: 100,
  },
  headerTitle: globalStyles.header,
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderColor: Colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.text,
  },
  locButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.background,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortWrapper: {
    position: 'relative',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: globalStyles.text,
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: globalStyles.chip,
  chipText: globalStyles.chipText,
  chipActive: globalStyles.chipActive,
  chipTextActive: globalStyles.chipText,
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  optionChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.goldBackgroundLight,
  },
  optionChipText: {
    color: Colors.text,
    fontSize: 13,
  },
  optionChipTextSelected: {
    color: Colors.text,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 28,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 1000,
  },
  headerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  list: {
    zIndex: 0,
  },
  dropdownItem: {
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLightest,
  },
  dropdownText: globalStyles.text,
  dropdownTextSelected: {
    fontWeight: '600',
  },
  filterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  card: {
    marginTop: 8,
    marginBottom: 20,
  },
  imagePlaceholder: globalStyles.imagePlaceholder,
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.placeholderLight,
  },
  brand: {
    marginTop: 8,
    ...globalStyles.textMuted,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Raleway_500Medium',
  },
});


