import { ProfilePage } from '../../components/ProfileComponents/ProfilePage';

const mockProfile = {
  name: "Emma Lin",
  location: "San Francisco, CA",
  avatarUrl: require('@/assets/images/photo-1607664919376-626f7c3afe97.jpeg'),
  bio: "Fashion enthusiast 👗 Sustainable living advocate 🌱 Happy to share my closet with friends!",
  stats: {
    items: 9,
    friends: 127,
    borrows: 43,
    lends: 28
  },
  listings: [
    { id: '1', imageUrl: require('@/assets/images/photo-1716951735110-09cdbeb17051.jpeg'), alt: 'Blue shirt' },
    { id: '2', imageUrl: require('@/assets/images/photo-1760641371983-ab4c2227ad5d.jpeg'), alt: 'Denim jacket' },
    { id: '3', imageUrl: require('@/assets/images/photo-1760006502808-e44ef11b3bfa.jpeg'), alt: 'Gray sweater' },
    // Add more items...
  ]
};

export default function ProfileScreen() {
  return <ProfilePage profile={mockProfile} />;
}