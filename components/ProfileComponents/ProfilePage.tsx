import { Listing, Profile, ProfileStats } from '@/types/profile';
import { FC } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Header: FC = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>My Profile</Text>
    <TouchableOpacity style={styles.settingsButton}>
      <Text style={styles.settingsIcon}>⚙️</Text>
    </TouchableOpacity>
  </View>
);

const Bio: FC<{ text: string }> = ({ text }) => (
  <Text style={styles.bio}>{text}</Text>
);

const Stat: FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.stat}>
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
  stats 
}) => (
  <View style={styles.profileInfo}>
    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.location}>{location}</Text>
    <StatsRow stats={stats} />
  </View>
);

const ListingsGrid: FC<{ listings: Listing[] }> = ({ listings }) => (
  <FlatList
    data={listings}
    numColumns={3}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.gridImage}
        resizeMode="cover"
      />
    )}
    contentContainerStyle={styles.listingsGrid}
  />
);

export const ProfilePage: FC<{ profile: Profile }> = ({ profile }) => (
  <ScrollView style={styles.container}>
    <Header />
    <ProfileInfo 
      name={profile.name}
      location={profile.location}
      avatarUrl={profile.avatarUrl}
      bio={profile.bio}
      stats={profile.stats}
    />
    <Bio text={profile.bio} />
    <ListingsGrid listings={profile.listings} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#333',
  },
  listingsGrid: {
    paddingHorizontal: 4,
  },
  gridImage: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
  },
});

export default ProfilePage;