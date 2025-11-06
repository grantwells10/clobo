import type { Listing, Profile, ProfileStats } from '@/types/profile';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FC, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
//const imageSize = (screenWidth - 48) / 3;

const PhotoUploadArea: FC<{ onPress: () => void; images: string[] }> = ({ onPress, images }) => {
    return (
      <View>
        {images && images.length > 0 ? (
          <View style={styles.uploadedPhotos}>
            {images.map((uri, index) => (
              <View key={index} style={styles.uploadedPhotoContainer}>
                <Image 
                  source={{ uri }} 
                  style={styles.uploadedPhoto}
                  contentFit="cover"
                  onLoad={() => console.log(`Image ${index} loaded`)}
                  onError={(error) => console.log(`Image ${index} error:`, error)}
                />
              </View>
            ))}
          </View>
        ) : (
          <Pressable style={styles.uploadArea} onPress={onPress}>
            <Text style={styles.uploadIcon}>↑</Text>
            <Text style={styles.uploadTitle}>Click to upload photos</Text>
            <Text style={styles.uploadSubtext}>Up to 5 images</Text>
          </Pressable>
        )}
        {images.length > 0 && (
          <Pressable style={styles.addMoreButton} onPress={onPress}>
            <Text style={styles.addMoreText}>+ Add More Photos</Text>
          </Pressable>
        )}
      </View>
    );
  };

// const PhotoUploadArea: FC<{ onPress: () => void; images: string[] }> = ({ onPress, images }) => (
//     <View>
//       {images.length > 0 ? (
//         <View style={styles.uploadedPhotos}>
//           {images.map((uri, index) => (
//             <Image key={index} source={{ uri }} style={styles.uploadedPhoto} />
//           ))}
//         </View>
//       ) : (
//         <Pressable style={styles.uploadArea} onPress={onPress}>
//           <Text style={styles.uploadIcon}>↑</Text>
//           <Text style={styles.uploadTitle}>Click to upload photos</Text>
//           <Text style={styles.uploadSubtext}>Up to 5 images</Text>
//         </Pressable>
//       )}
//       {images.length > 0 && (
//         <Pressable style={styles.addMoreButton} onPress={onPress}>
//           <Text style={styles.addMoreText}>Add More Photos</Text>
//         </Pressable>
//       )}
//     </View>
// );
  
const FormInput: FC<{ label: string; placeholder: string; value?: string; onChangeText?: (text: string) => void }> = 
  ({ label, placeholder, value, onChangeText }) => (
  <View style={styles.formField}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput 
      style={styles.formInput}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const AddListingModal: FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
    const insets = useSafeAreaInsets();
    const [images, setImages] = useState<string[]>([]);
    const [itemName, setItemName] = useState('');
    const [brand, setBrand] = useState('');
    const [material, setMaterial] = useState('');
    const [color, setColor] = useState('');
    const [occasion, setOccasion] = useState('');

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
    
        console.log('ImagePicker result:', result);
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uris = result.assets.map(asset => {
            console.log('Asset URI:', asset.uri);
            return asset.uri;
          });
          
          if (images.length + uris.length > 5) {
            Alert.alert('Limit Reached', 'Maximum 5 images');
            return;
          }
          
          console.log('Setting images:', uris);
          setImages([...images, ...uris]);
        } else {
          console.log('No images selected or canceled');
        }
    };

    const handleClose = () => {
        setImages([]);
        setItemName('');
        setBrand('');
        setMaterial('');
        setColor('');
        setOccasion('');
        onClose();
    };

    const handleSubmit = () => {
        if (!itemName.trim()) {
          Alert.alert('Error', 'Please enter an item name');
          return;
        }
        if (images.length === 0) {
          Alert.alert('Error', 'Please add at least one photo');
          return;
        }
        
        Alert.alert('Success', `"${itemName}" added to your listings!`);
        handleClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
          <Pressable 
            style={[styles.modalBackdrop, { paddingTop: insets.top }]} 
            onPress={handleClose}
          >
            <Pressable style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Listing</Text>
                <Pressable onPress={handleClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>
              
              <Text style={styles.modalSubtitle}>Share an item from your closet with friends</Text>
              
              <ScrollView 
                style={styles.modalBody}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              >
                <Text style={styles.formLabel}>Photos</Text>
                <PhotoUploadArea onPress={pickImages} images={images} />
                
                <FormInput 
                  label="Item Name" 
                  placeholder="e.g., Summer Midi Dress"
                  value={itemName}
                  onChangeText={setItemName}
                />
                <FormInput 
                  label="Brand" 
                  placeholder="e.g., Zara"
                  value={brand}
                  onChangeText={setBrand}
                />
                
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Size</Text>
                  <Pressable style={styles.selectInput}>
                    <Text style={{ color: '#999' }}>Select size</Text>
                  </Pressable>
                </View>
                
                <FormInput 
                  label="Material" 
                  placeholder="e.g., 100% Cotton"
                  value={material}
                  onChangeText={setMaterial}
                />
                <FormInput 
                  label="Color" 
                  placeholder="e.g., Navy Blue"
                  value={color}
                  onChangeText={setColor}
                />
                <FormInput 
                  label="Occasion" 
                  placeholder="e.g., Casual, Brunch"
                  value={occasion}
                  onChangeText={setOccasion}
                />
                
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Add Listing</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
    );
};

const Header: FC = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>My Profile</Text>
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

const StatsRow: FC<{ stats: ProfileStats; onFriendsPress?: () => void }> = ({ stats, onFriendsPress }) => {
  const entries = Object.entries(stats).filter(([key]) => key !== 'friends');
  return (
    <View style={styles.statsRow}>
      {entries.map(([key, value]) => (
        <Stat key={key} label={key} value={value as number} />
      ))}
      <TouchableOpacity style={styles.statContainer} onPress={onFriendsPress}>
        <Text style={styles.statValue}>{stats.friends}</Text>
        <Text style={styles.statLabel}>Friends</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProfileInfo: FC<any> = ({ 
  name, 
  location, 
  avatarUrl, 
  stats,
  bio,
  onFriendsPress,
}) => (
  <View style={styles.profileContainer}>
    {avatarUrl ? (
      <Image source={avatarUrl} style={styles.avatar} contentFit="cover" />
    ) : (
      <View style={[styles.avatar, { backgroundColor: '#EEE' }]} />
    )}
    <Text style={styles.title}>{name}</Text>
    <Text style={styles.location}>{location}</Text>
    
    <StatsRow stats={stats} onFriendsPress={onFriendsPress} />
    
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

export function ProfilePage(props: any) {
  const { profile, onFriendsPress } = props;
    const [modalVisible, setModalVisible] = useState(false);
    const insets = useSafeAreaInsets();
  
    return (
      <>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Header />
          <ProfileInfo 
            name={profile.name}
            location={profile.location}
            avatarUrl={profile.avatarUrl}
            bio={profile.bio}
            stats={profile.stats}
            onFriendsPress={onFriendsPress}
          />
          <ListingsGrid listings={profile.listings} />
        </ScrollView>
        
        <Pressable 
          style={[
            styles.fab,
            { 
              bottom: 24 + insets.bottom,
              right: 24 + insets.right,
            }
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
  
        <AddListingModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      </>
    );
  };

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
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DAA520',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '85%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
  },
  closeButton: {
    fontSize: 24,
    color: '#687076',
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#687076',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  uploadArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#FAFBFC',
  },
  uploadIcon: {
    fontSize: 32,
    color: '#687076',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#687076',
    marginTop: 4,
  },
  uploadedPhotoContainer: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#11181C',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#550000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedPhotos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  uploadedPhoto: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  addMoreButton: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addMoreText: {
    color: '#11181C',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfilePage;
