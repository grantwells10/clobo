import type { Listing, Profile, ProfileStats } from '@/types/profile';
import { Image } from 'expo-image';
import { FC } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const Header: FC = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>My Profile</Text>
    <Pressable style={styles.settingsButton}>
      <Text style={styles.settingsIcon}>⚙️</Text>
    </Pressable>
  </View>
);

const Bio: FC<{ text: string }> = ({ text }) => (
  <Text style={styles.body}>{text}</Text>
);

const Stat: FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.statContainer}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StatsRow: FC<{ stats: ProfileStats }> = ({ stats }) => (
  <View style={styles.statsRow}>
    {Object.entries(stats).map(([key, value]) => (
      <Stat key={key} label={key} value={value} />
    ))}
  </View>
);

const ProfileInfo: FC<Omit<Profile, 'listings'>> = ({ 
  name, 
  location, 
  avatarUrl, 
  stats,
  bio 
}) => (
  <View style={styles.profileContainer}>
    {avatarUrl ? (
      <Image source={avatarUrl} style={styles.avatar} contentFit="cover" />
    ) : (
      <View style={[styles.avatar, { backgroundColor: '#EEE' }]} />
    )}
    <Text style={styles.title}>{name}</Text>
    <Text style={styles.location}>{location}</Text>
    
    <StatsRow stats={stats} />
    
    <Bio text={bio} />
  </View>
);

const ListingsGrid: FC<{ listings: Listing[] }> = ({ listings }) => (
  <View style={styles.listingsSection}>
    <Text style={styles.sectionTitle}>My Listings</Text>
    <FlatList
      data={listings}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Image 
          source={item.imageUrl}
          style={styles.gridImage}
          contentFit="cover"
        />
      )}
      contentContainerStyle={styles.listingsGrid}
      scrollEnabled={false}
    />
  </View>
);

export const ProfilePage: FC<{ profile: Profile }> = ({ profile }) => (
  <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
    <Header />
    <ProfileInfo 
      name={profile.name}
      location={profile.location}
      avatarUrl={profile.avatarUrl}
      bio={profile.bio}
      stats={profile.stats}
    />
    <ListingsGrid listings={profile.listings} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    backgroundColor: '#EEE',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  statContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    paddingHorizontal: 0,
  },
  listingsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 16,
  },
  listingsGrid: {
    gap: 8,
  },
  gridImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
  },
});

export default ProfilePage;
