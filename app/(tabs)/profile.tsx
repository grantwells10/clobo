import { ProfilePage } from '@/components/ProfileComponents/ProfilePage';
import { Raleway_500Medium, Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [loaded] = useFonts({ Raleway_500Medium, Raleway_700Bold });
  if (!loaded) return null;

  const mockProfile = {
    name: "Emma Lin",
    location: "San Francisco, CA",
    avatarUrl: require('../../assets/images/avatar.jpeg'),
    bio: "Fashion enthusiast 👗 Sustainable living advocate 🌱 Happy to share my closet with friends!",
    stats: {
      items: 9,
      friends: 127,
      borrows: 43,
      lends: 28
    },
    listings: [
      { id: '1', imageUrl: require('../../assets/images/item1.jpeg'), alt: 'Blue shirt' },
      { id: '2', imageUrl: require('../../assets/images/item2.jpeg'), alt: 'Denim jacket' },
      { id: '3', imageUrl: require('../../assets/images/item3.jpeg'), alt: 'White tee' },
    //   { id: '4', imageUrl: require('../../assets/images/item4.jpeg'), alt: 'Black hoodie' },
    //   { id: '5', imageUrl: require('../../assets/images/item5.jpeg'), alt: 'Gray sweater' },
    //   { id: '6', imageUrl: require('../../assets/images/item6.jpeg'), alt: 'Jeans' },
    ]
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProfilePage profile={mockProfile} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});