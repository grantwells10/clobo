import { ProfilePage } from '@/components/ProfileComponents/ProfilePage';
import { setUserListings } from '@/data/userListings';
import { globalStyles } from '@/styles/globalStyles';
import type { Listing, Profile } from '@/types/profile';
import { Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileData = require('@/data/profile.json') as Omit<Profile, 'avatarUrl' | 'listings'> & { 
  avatarUrl: string; 
  listings: Array<{ id: string; imageUrl: string; alt: string }> 
};

import activitiesData from '@/data/activity.json';
import profileData2 from '@/data/profile.json';

const itemsCount = profileData2.listings.length;

const lendsCount = activitiesData.filter(
  (a) => a.activity.role === 'lending' && a.activity.status === 'current'
).length;

const borrowsCount = activitiesData.filter(
  (a) => a.activity.role === 'borrowed' && a.activity.status === 'current'
).length;

const baseStats = {
  ...profileData2.stats,
  items: itemsCount,
  lends: lendsCount,
  borrows: borrowsCount,
};

// map JSON paths to require() calls (bundler requires static paths)
const imageMap: Record<string, any> = {
  '../../assets/images/avatar.jpeg': require('../../assets/images/avatar.jpeg'),
  '../../assets/images/item1.jpeg': require('../../assets/images/item1.jpeg'),
  '../../assets/images/item2.jpeg': require('../../assets/images/item2.jpeg'),
  '../../assets/images/item3.jpeg': require('../../assets/images/item3.jpeg'),
};

function getImageSource(imageUrl: string): { uri: string } | number {
  // if local asset path, use require()
  if (imageMap[imageUrl]) {
    return imageMap[imageUrl];
  }
  // otherwise treat as URI
  return { uri: imageUrl };
}

export default function ProfileScreen() {
  const [loaded] = useFonts({ Raleway_500Medium, Raleway_700Bold });
  const router = useRouter();

  const baseProfile = profileData;

  const [profileInfo, setProfileInfo] = useState({
    name: baseProfile.name,
    location: baseProfile.location,
    bio: baseProfile.bio,
    avatarUrl: getImageSource(baseProfile.avatarUrl) as any,
  });

  const [listings, setListings] = useState<Listing[]>(
    baseProfile.listings.map(listing => ({
      ...listing,
      imageUrl: getImageSource(listing.imageUrl) as any,
    }))
  );

  const [stats, setStats] = useState(baseStats);

  useEffect(() => {
    setUserListings(listings);
  }, [listings]);

  if (!loaded) return null;

  const goToFriends = () => router.push('/friends');

  const handleAddListing = async (images: string[], listingData: { title: string; brand?: string; sizeLabel?: string; material?: string; color?: string; occasion?: string; description?: string; washingInstructions?: string }) => {
    const newListing: Listing = {
      id: `listing_${Date.now()}`,
      imageUrl: { uri: images[0] },
      alt: listingData.title,
      title: listingData.title,
      brand: listingData.brand,
      sizeLabel: listingData.sizeLabel,
      material: listingData.material,
      color: listingData.color,
      occasion: listingData.occasion,
      description: listingData.description,
      washingInstructions: listingData.washingInstructions,
    };

    const updatedListings = [...listings, newListing];
    setListings(updatedListings);
    setUserListings(updatedListings); // update the store so product/[id] can access it
    setStats(prev => ({ ...prev, items: prev.items + 1 }));
  };

  const handleProfileSave = (updated: { name: string; location: string; bio: string; avatarUri?: string }) => {
    setProfileInfo(prev => ({
      ...prev,
      name: updated.name,
      location: updated.location,
      bio: updated.bio,
      avatarUrl: updated.avatarUri ? { uri: updated.avatarUri } : prev.avatarUrl,
    }));
  };

  const profile: Profile = {
    ...baseProfile,
    avatarUrl: profileInfo.avatarUrl,
    listings,
    stats,
    name: profileInfo.name,
    location: profileInfo.location,
    bio: profileInfo.bio,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProfilePage
        profile={profile}
        onFriendsPress={goToFriends}
        onAddListing={handleAddListing}
        onProfileSave={handleProfileSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: globalStyles.container,
});