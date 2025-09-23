import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import SearchBar from '@/components/SearchBar';
import UnTappedHeart from '../assets/unTappedHeart.svg';
import TappedHeart from '../assets/TappedHeart.svg';

const API_URL = 'http://10.0.0.170:5000';

function CreateAuctionForm() {
  const [isFavorited, setIsFavorited] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<{ uri: string }[]>([]);
  const [startPrice, setStartPrice] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [tags, setTags] = useState('');
  const [buyItNow, setBuyItNow] = useState('');
  const [rarity, setRarity] = useState('common');
  const [reservePrice, setReservePrice] = useState('');
  const [category, setCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<
    { id: number; name: string; emoji: string }[]
  >([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategory(data[0].id);
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const handleImagePick = async () => {
  if (additionalImages.length >= 5) {
    Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets.length > 0) {
    const newImage = { uri: result.assets[0].uri };

    if (!imageUri) {
      setImageUri(newImage.uri);
    } else {
      setAdditionalImages([...additionalImages, newImage]);
    }
  }
};

  const handleSubmit = async () => {
  if (!name || !description || !category || !startPrice || !durationHours || !imageUri) {
    Alert.alert('Missing Fields', 'Please fill out all fields and upload a photo');
    return;
  }

  const token = await AsyncStorage.getItem('jwtToken');
  const formData = new FormData();

  formData.append('name', name);
  formData.append('description', description);
  formData.append('category_id', category.toString());
  formData.append('price', startPrice); // ✅ unified with /item route
  formData.append('tags', tags);
  formData.append('duration_hours', durationHours || '48');
  formData.append('buy_it_now', buyItNow || '');
  formData.append('rarity', rarity || 'common');
  formData.append('reserve_price', reservePrice || '');

  formData.append('photo', {
    uri: imageUri,
    name: 'item.jpg',
    type: 'image/jpeg',
  } as any);

  additionalImages.forEach((img, idx) => {
    formData.append(`additional_photo_${idx}`, {
      uri: img.uri,
      name: `extra_${idx}.jpg`,
      type: 'image/jpeg',
    } as any);
  });

  console.log('FormData Preview:');
console.log('name:', name);
console.log('description:', description);
console.log('price:', startPrice);
console.log('category_id:', category?.toString());
console.log('tags:', tags);
console.log('buy_it_now:', buyItNow);
console.log('rarity:', rarity);
console.log('duration_hours:', durationHours);
console.log('photo:', imageUri);
additionalImages.forEach((img, idx) => {
  console.log(`additional_photo_${idx}:`, img.uri);
});
console.log('Main image file:', {
  uri: imageUri,
  name: 'item.jpg',
  type: 'image/jpeg',
});


  try {
    const res = await fetch(`${API_URL}/item`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      Alert.alert('Success', 'Item listed successfully!');
      setName('');
      setDescription('');
      setStartPrice('');
      setDurationHours('');
      setTags('');
      setBuyItNow('');
      setRarity('common');
      setReservePrice('');
      setCategory(null);
      setImageUri(null);
      setAdditionalImages([]);
    } else {
      const msg = await res.text();
      Alert.alert('Error', msg);
    }
  } catch (error) {
    console.error('Listing error:', error);
    Alert.alert('Network Error', 'Could not reach the server.');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Category</Text>
      <SearchBar onSearch={(text) => console.log('Searching for:', text)} />

      <TouchableOpacity
        onPress={() => setIsFavorited(!isFavorited)}
        style={{ alignSelf: 'center', marginVertical: 12 }}
        accessibilityLabel="Toggle favorite"
        activeOpacity={0.7}
      >
        {isFavorited ? (
          <TappedHeart width={48} height={48} />
        ) : (
          <UnTappedHeart width={48} height={48} />
        )}
      </TouchableOpacity>

      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={`${cat.emoji} ${cat.name}`} value={cat.id} />
        ))}
      </Picker>

      <Button title="Upload Photo(s)" onPress={handleImagePick} />

      {imageUri && <Image source={{ uri: imageUri }} style={styles.thumbnailPreview} />}

      {additionalImages.length > 0 && (
        <ScrollView horizontal style={styles.additionalImageScroll}>
          {additionalImages.map((img, idx) => (
            <Image key={idx} source={{ uri: img.uri }} style={styles.additionalImage} />
          ))}
        </ScrollView>
      )}

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} multiline />
      <TextInput placeholder="Start Price" value={startPrice} onChangeText={setStartPrice} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Duration (hours)" value={durationHours} onChangeText={setDurationHours} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Tags (comma-separated)" value={tags} onChangeText={setTags} style={styles.input} />
      <TextInput placeholder="Buy It Now (optional)" value={buyItNow} onChangeText={setBuyItNow} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Rarity (e.g. common, rare)" value={rarity} onChangeText={setRarity} style={styles.input} />
       <TextInput placeholder="Reserve Price (optional)" value={reservePrice} onChangeText={setReservePrice} keyboardType="numeric" style={styles.input} />

      <Button title="Create Auction" onPress={handleSubmit} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginBottom: 4, fontWeight: '500' },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  thumbnailPreview: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 12,
  },
  additionalImageScroll: {
    marginBottom: 12,
  },
  additionalImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});

export default CreateAuctionForm;
