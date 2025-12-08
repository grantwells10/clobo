import { ProfilePage } from '@/components/ProfileComponents/ProfilePage';
import { getActivityItems } from '@/data/activityStore';
import { setUserListings } from '@/data/userListings';
import usersStore from '@/data/usersStore';
import { globalStyles } from '@/styles/globalStyles';
import type { Listing, Profile } from '@/types/profile';
import { Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileData = require('@/data/profile.json') as Omit<Profile, 'avatarUrl' | 'listings'> & { 
  avatarUrl: string; 
  listings: Array<{ id: string; imageUrl: string; alt: string }> 
};

const itemsCount = profileData.listings.length;

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
    profileData.listings.map(listing => ({
      ...listing,
      imageUrl: getImageSource(listing.imageUrl) as any,
      isLent: false,
    }))
  );

  const updateListingsAndStats = useCallback(() => {
    const activitiesData = getActivityItems();
    const lendsCount = activitiesData.filter(
      (a) => a.owner?.name === 'You' && a.activity?.role === 'lending' && (a.activity?.status === 'current' || a.activity?.status === 'completed')
    ).length;
    const borrowsCount = activitiesData.filter(
      (a) => a.activity?.role === 'borrowed' && (a.activity?.status === 'current' || a.activity?.status === 'completed')
    ).length;
    const lentListingIds = new Set(
      activitiesData
        .filter(a => a.owner?.name === 'You' && a.activity?.role === 'lending' && a.activity?.status === 'current')
        .map(a => a.id)
    );
    
    setListings(prev => prev.map(listing => ({
      ...listing,
      isLent: lentListingIds.has(listing.id),
    })));
    
    setStats(prev => ({
      ...prev,
      lends: profileData.stats.lends + lendsCount,
      borrows: profileData.stats.borrows + borrowsCount,
    }));
  }, []);

  const [stats, setStats] = useState({
    ...profileData.stats,
    items: itemsCount,
    lends: 0,
    borrows: 0,
    friends: 0,
  });

  // Initial load
  useEffect(() => {
    updateListingsAndStats();
  }, [updateListingsAndStats]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      updateListingsAndStats();
    }, [updateListingsAndStats])
  );

  useEffect(() => {
    setUserListings(listings);
  }, [listings]);

  // subscribe to users to update friends count
  useEffect(() => {
    const unsub = usersStore.subscribe(() => {
      const all = usersStore.getUsers();
      const friendCount = all.filter((u: any) => u.isFriend).length;
      setStats(prev => ({ ...prev, friends: friendCount }));
    });
    // initialize
    const all = usersStore.getUsers();
    setStats(prev => ({ ...prev, friends: all.filter((u: any) => u.isFriend).length }));
    return unsub;
  }, []);

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
      isLent: false,
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