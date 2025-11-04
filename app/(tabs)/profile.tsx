import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [loaded] = useFonts({ Raleway_500Medium });
  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Hello World</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway_500Medium',
    color: '#11181C',
  },
});


