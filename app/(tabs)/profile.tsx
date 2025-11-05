import { ProfilePage } from '@/components/ProfileComponents/ProfilePage';
import { Raleway_500Medium, useFonts } from '@expo-google-fonts/raleway';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
    const [loaded] = useFonts({ Raleway_500Medium });
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
        // Add more items...
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway_500Medium',
    color: '#11181C',
  },
});


