import { Raleway_300Light, Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { Activity, Search, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Raleway_300Light,
    Raleway_500Medium,
    Raleway_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.centered}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.helloTitle}>Hello World</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hello styles</Text>

          <Text style={styles.subheading}>Brand colors</Text>
          <View style={styles.swatchesRow}>
            <View style={[styles.swatch, styles.deepMaroon]} />
            <View style={[styles.swatch, styles.gold]} />
          </View>

          <Text style={styles.subheading}>Raleway font weights</Text>
          <View style={styles.fontColumn}>
            <Text style={[styles.sampleText, styles.ralewayLight]}>Raleway Light</Text>
            <Text style={[styles.sampleText, styles.ralewayMedium]}>Raleway Medium</Text>
            <Text style={[styles.sampleText, styles.ralewayBold]}>Raleway Bold</Text>
          </View>

          <Text style={styles.subheading}>Lucide icons</Text>
          <View style={styles.iconsRow}>
            <Search color="#550000" size={32} />
            <Activity color="#D4AF37" size={32} />
            <User color="#550000" size={32} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 24,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloTitle: {
    fontSize: 32,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Raleway_500Medium',
    color: '#11181C',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Raleway_700Bold',
    color: '#11181C',
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Raleway_500Medium',
    color: '#11181C',
  },
  swatchesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  swatch: {
    height: 64,
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000020',
  },
  deepMaroon: {
    backgroundColor: '#550000',
  },
  gold: {
    backgroundColor: '#D4AF37',
  },
  fontColumn: {
    gap: 6,
  },
  sampleText: {
    fontSize: 18,
    color: '#11181C',
  },
  ralewayLight: {
    fontFamily: 'Raleway_300Light',
  },
  ralewayMedium: {
    fontFamily: 'Raleway_500Medium',
  },
  ralewayBold: {
    fontFamily: 'Raleway_700Bold',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
