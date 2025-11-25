import { Colors, globalStyles } from '@/styles/globalStyles';
import type { Listing, ProfileStats } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { FC, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
//const imageSize = (screenWidth - 48) / 3;

const PhotoUploadArea: FC<{ onPress: () => void; images: string[] }> = ({ onPress, images }) => {
    return (
      <View>
        {images && images.length > 0 ? (
          <View style={styles.uploadedPhotoSingle}>
            <Image 
              source={{ uri: images[0] }} 
              style={styles.uploadedPhotoSmall}
              contentFit="cover"
            />
            <Pressable style={globalStyles.buttonSecondary} onPress={() => onPress()}>
              <Text style={globalStyles.buttonSecondaryText}>Change Photo</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={globalStyles.uploadArea} onPress={onPress}>
            <Text style={globalStyles.uploadIcon}>↑</Text>
            <Text style={globalStyles.uploadTitle}>Click to upload photo</Text>
            <Text style={globalStyles.uploadSubtext}>1 image</Text>
          </Pressable>
        )}
      </View>
    );
  };
  
const FormInput: FC<{ label: string; placeholder: string; value?: string; onChangeText?: (text: string) => void }> = 
  ({ label, placeholder, value, onChangeText }) => (
  <View style={globalStyles.formField}>
    <Text style={globalStyles.formLabel}>{label}</Text>
    <TextInput 
      style={globalStyles.formInput}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMutedLight}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL'];

const AddListingModal: FC<{ visible: boolean; onClose: () => void; onAddListing?: (images: string[], listingData: { title: string; brand?: string; sizeLabel?: string; material?: string; color?: string; occasion?: string; description?: string; washingInstructions?: string }) => void }> = ({ visible, onClose, onAddListing }) => {
    const insets = useSafeAreaInsets();
    const [images, setImages] = useState<string[]>([]);
    const [itemName, setItemName] = useState('');
    const [brand, setBrand] = useState('');
    const [size, setSize] = useState<string>('');
    const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
    const [material, setMaterial] = useState('');
    const [color, setColor] = useState('');
    const [occasion, setOccasion] = useState('');
    const [description, setDescription] = useState('');
    const [washingInstructions, setWashingInstructions] = useState('');

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsMultipleSelection: false,
        });
    
        console.log('ImagePicker result:', result);
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
          // Only take the first image
          const uri = result.assets[0].uri;
          console.log('Setting image:', uri);
          setImages([uri]);
        } else {
          console.log('No image selected or canceled');
        }
    };

    const handleClose = () => {
        Keyboard.dismiss();
        setImages([]);
        setItemName('');
        setBrand('');
        setSize('');
        setSizeDropdownOpen(false);
        setMaterial('');
        setColor('');
        setOccasion('');
        setDescription('');
        setWashingInstructions('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!itemName.trim()) {
          Alert.alert('Error', 'Please enter an item name');
          return;
        }
        if (images.length === 0) {
          Alert.alert('Error', 'Please add at least one photo');
          return;
        }
        
        // Call the callback to save images locally and add to listings
        if (onAddListing) {
          await onAddListing(images, {
            title: itemName,
            brand: brand.trim() || undefined,
            sizeLabel: size || undefined,
            material: material.trim() || undefined,
            color: color.trim() || undefined,
            occasion: occasion.trim() || undefined,
            description: description.trim() || undefined,
            washingInstructions: washingInstructions.trim() || undefined,
          });
        }
        
        Alert.alert('Success', `"${itemName}" added to your listings!`);
        handleClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
          <Pressable 
            style={[globalStyles.modalBackdrop, { paddingTop: insets.top }]} 
            onPress={(e) => {
              if (e.target === e.currentTarget) {
                Keyboard.dismiss();
                handleClose();
              }
            }}
          >
            <Pressable style={globalStyles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={globalStyles.modalHeader}>
                <Text style={globalStyles.modalTitle}>Add New Listing</Text>
                <Pressable onPress={handleClose}>
                  <Text style={globalStyles.closeButton}>✕</Text>
                </Pressable>
              </View>
              
              <Text style={globalStyles.modalSubtitle}>Share an item from your closet with friends</Text>
              
              <ScrollView 
                style={globalStyles.modalBody}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => {
                  Keyboard.dismiss();
                  setSizeDropdownOpen(false);
                }}
              >
                <Text style={globalStyles.formLabel}>Photo</Text>
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
                
                <View style={globalStyles.formField}>
                  <Text style={globalStyles.formLabel}>Size</Text>
                  <View style={styles.dropdownContainer}>
                    <Pressable 
                      style={globalStyles.selectInput}
                      onPress={() => {
                        Keyboard.dismiss();
                        setSizeDropdownOpen(!sizeDropdownOpen);
                      }}
                    >
                      <Text style={[globalStyles.selectInputText, size ? { color: Colors.text } : { color: Colors.textMutedLight }]}>
                        {size || 'Select size'}
                      </Text>
                    </Pressable>
                    {sizeDropdownOpen && (
                      <>
                        <Pressable 
                          style={styles.dropdownOverlay}
                          onPress={() => setSizeDropdownOpen(false)}
                        />
                        <View style={globalStyles.dropdown}>
                          {SIZE_OPTIONS.map((option) => (
                            <Pressable
                              key={option}
                              style={globalStyles.dropdownItem}
                              onPress={() => {
                                setSize(option);
                                setSizeDropdownOpen(false);
                              }}
                            >
                              <Text style={globalStyles.dropdownItemText}>{option}</Text>
                              {size === option && <Text style={globalStyles.checkmark}>✓</Text>}
                            </Pressable>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
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
                
                <View style={globalStyles.formField}>
                  <Text style={globalStyles.formLabel}>Description</Text>
                  <TextInput 
                    style={[globalStyles.formInput, globalStyles.formTextArea]}
                    placeholder="Describe the item..."
                    placeholderTextColor={Colors.textMutedLight}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <View style={globalStyles.formField}>
                  <Text style={globalStyles.formLabel}>Washing Instructions</Text>
                  <TextInput 
                    style={[globalStyles.formInput, globalStyles.formTextArea]}
                    placeholder="e.g., Machine wash cold, hang to dry"
                    placeholderTextColor={Colors.textMutedLight}
                    value={washingInstructions}
                    onChangeText={setWashingInstructions}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                
                <Pressable style={[globalStyles.buttonPrimary, { marginTop: 20, marginBottom: 16 }]} onPress={handleSubmit}>
                  <Text style={globalStyles.buttonPrimaryText}>Add Listing</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
    );
};

const Header: FC<{ onSettingsPress: () => void }> = ({ onSettingsPress }) => (
  <View style={[globalStyles.profileHeader, { paddingHorizontal: 16, paddingTop: 8 }]}>
    <View style={{ flex: 1 }} />
    <Pressable onPress={onSettingsPress} hitSlop={12} style={{ padding: 8, alignSelf: 'flex-end' }}>
      <Ionicons name="settings-sharp" size={24} color="black" />
    </Pressable>
  </View>
);

const EditProfileModal: FC<{
  visible: boolean;
  profile: { name: string; location: string; bio: string; avatarUrl?: any };
  onClose: () => void;
  onSave: (updated: { name: string; location: string; bio: string; avatarUri?: string }) => void;
}> = ({ visible, profile, onClose, onSave }) => {
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    typeof profile.avatarUrl === 'object' && profile.avatarUrl?.uri
      ? profile.avatarUrl.uri
      : undefined
  );

  useEffect(() => {
    setName(profile.name);
    setLocation(profile.location);
    setBio(profile.bio);
    const uri =
      typeof profile.avatarUrl === 'object' && profile.avatarUrl?.uri
        ? profile.avatarUrl.uri
        : undefined;
    setAvatarUri(uri);
  }, [profile, visible]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    onSave({ name: name.trim(), location: location.trim(), bio: bio.trim(), avatarUri });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={globalStyles.modalBackdrop}
        onPress={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Pressable style={globalStyles.modalContent} onPress={e => e.stopPropagation()}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Edit Profile</Text>
            <Pressable onPress={onClose}>
              <Text style={globalStyles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={globalStyles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={globalStyles.formLabel}>Profile Photo</Text>
            <PhotoUploadArea
              onPress={pickAvatar}
              images={avatarUri ? [avatarUri] : []}
            />
            <FormInput
              label="Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />
            <FormInput
              label="Location"
              placeholder="City, State"
              value={location}
              onChangeText={setLocation}
            />
            <View style={globalStyles.formField}>
              <Text style={globalStyles.formLabel}>Bio</Text>
              <TextInput
                style={[globalStyles.formInput, globalStyles.formTextArea]}
                placeholder="Tell friends about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <Pressable
              style={[globalStyles.buttonPrimary, { marginTop: 20 }]}
              onPress={handleSubmit}
            >
              <Text style={globalStyles.buttonPrimaryText}>Save</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const Bio: FC<{ text: string }> = ({ text }) => (
  <Text style={globalStyles.bodyCentered}>{text}</Text>
);

const Stat: FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={globalStyles.statContainer}>
    <Text style={globalStyles.statValue}>{value}</Text>
    <Text style={globalStyles.statLabel}>{label}</Text>
  </View>
);

const StatsRow: FC<{ stats: ProfileStats; onFriendsPress?: () => void }> = ({ stats, onFriendsPress }) => {
  const entries = Object.entries(stats).filter(([key]) => key !== 'friends');
  return (
    <View style={globalStyles.statsRow}>
      {entries.map(([key, value]) => (
        <Stat key={key} label={key} value={value as number} />
      ))}
      <TouchableOpacity style={globalStyles.statContainer} onPress={onFriendsPress}>
        <Text style={globalStyles.statValue}>{stats.friends}</Text>
        <Text style={globalStyles.statLabel}>Friends</Text>
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
  <View style={globalStyles.profileContainer}>
    {avatarUrl ? (
      <Image source={avatarUrl} style={globalStyles.avatarLarge} contentFit="cover" />
    ) : (
      <View style={[globalStyles.avatarLarge, { backgroundColor: Colors.placeholder }]} />
    )}
    <Text style={globalStyles.titleLarge}>{name}</Text>
    <Text style={globalStyles.locationText}>{location}</Text>
    
    <StatsRow stats={stats} onFriendsPress={onFriendsPress} />
    
    <Bio text={bio} />
  </View>
);

const ListingsGrid: FC<{ listings: Listing[] }> = ({ listings }) => {
  const router = useRouter();
  const contentPadding = 16;
  const gap = 8;
  const numColumns = 3;
  const imageWidth = Math.floor((Dimensions.get('window').width - (contentPadding * 2) - (gap * (numColumns - 1))) / numColumns);

  return (
    <View style={globalStyles.listingsSection}>
      <Text style={globalStyles.sectionTitleLarge}>My Listings</Text>
      <FlatList
        data={listings}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ 
              pathname: '/product/[id]', 
              params: { id: item.id, isOwnListing: 'true' } 
            })}
          >
            <View style={{ width: imageWidth, height: imageWidth }} >
              <Image 
                source={item.imageUrl} 
                style={[globalStyles.gridImage, { width: imageWidth }]}
                contentFit="cover"
              />
              {item.isLent && (
                <View style={styles.unavailableIconContainer}>
                  <Ionicons name="lock-closed" size={16} color="#ffffff" />
                </View>
              )}
            </View>
          </Pressable>
        )}
        contentContainerStyle={globalStyles.listingsGrid}
        columnWrapperStyle={{ gap }}
        scrollEnabled={false}
      />
    </View>
  );
};

export function ProfilePage(props: any) {
  const { profile, onFriendsPress, onAddListing, onProfileSave } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const onSettingsPress = () => {
    setEditProfileVisible(true);
  };

  const handleProfileSave = (updatedProfile: { name: string; location: string; bio: string; avatarUri?: string }) => {
    if (onProfileSave) {
      onProfileSave(updatedProfile);
    }
    setEditProfileVisible(false);
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Header onSettingsPress={onSettingsPress} />
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
          globalStyles.fab,
          { 
            bottom: 24 + insets.bottom,
            right: 24 + insets.right,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={globalStyles.fabText}>+</Text>
      </Pressable>

      <AddListingModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onAddListing={onAddListing}
      />

      <EditProfileModal
        visible={editProfileVisible}
        profile={{ name: profile.name, location: profile.location, bio: profile.bio, avatarUrl: profile.avatarUrl, }}
        onClose={() => setEditProfileVisible(false)}
        onSave={handleProfileSave}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: globalStyles.container,
  dropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  uploadedPhotoSingle: {
    alignItems: 'center',
    marginVertical: 12,
  },
  uploadedPhotoSmall: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  unavailableIconContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfilePage;
