import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  Alert, ScrollView, Image
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { Picker } from "@react-native-picker/picker";
import { useGoatBid } from "@/hooks/useGoatBid";
import { GoatFlip } from "@/components/GoatAnimator/goatFlip";
import { useRouter } from 'expo-router';

const API_URL = 'http://10.0.0.170:5000';

export default function ItemScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<{ uri: string }[]>([]);
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<
    { id: number; name: string; emoji: string }[]
  >([]);
  const [showGoat, setShowGoat] = useState(false);
  const [buyItNow, setBuyItNow] = useState('');
const [rarity, setRarity] = useState('common');
const [durationHours, setDurationHours] = useState('48');
const { goatTrigger, lastBidAmount, triggerGoat } = useGoatBid();
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategory(data[0].id);
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const handleBidConfirm = () => {
    setShowGoat(true);
    setTimeout(() => setShowGoat(false), 2000);
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !category || !imageUri) {
      Alert.alert('Missing Fields', 'Please fill out all fields and upload a photo');
     if (!imageUri) {
  Alert.alert('Missing Photo', 'Please upload a main image before listing.');
  return;
}

      return;
    }

    const token = await AsyncStorage.getItem('jwtToken');
    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category_id', category.toString());
    formData.append('tags', tags);

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

    try {
      const res = await fetch(`${API_URL}/item`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (res.ok) {
        Alert.alert('Success', 'Item listed successfully!');
        triggerGoat(Number(price));
        handleBidConfirm();
        await res.json();

        setName('');
        setDescription('');
        setPrice('');
        setCategory(null);
        setTags('');
        setImageUri(null);
        setAdditionalImages([]);
        router.push('/discover');
      }
    } catch (error) {
      console.error('Listing error:', error);
      Alert.alert('Network Error', 'Could not reach the server.');
    }
  };

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

    console.log('🐐 Main image URI:', newImage.uri); // 👈 Add this here

    if (!imageUri) {
      setImageUri(newImage.uri);
    } else {
      setAdditionalImages([...additionalImages, newImage]);
    }
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        {categories.map((cat) => (
          <Picker.Item
            key={cat.id}
            label={`${cat.emoji} ${cat.name}`}
            value={cat.id}
          />
        ))}
      </Picker>

      <Button title="Upload Photo(s)" onPress={handleImagePick} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.thumbnailPreview} />
      )}

      {additionalImages.length > 0 && (
        <ScrollView horizontal style={styles.additionalImageScroll}>
          {additionalImages.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img.uri }}
              style={styles.additionalImage}
            />
          ))}
        </ScrollView>
      )}

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Tags (comma-separated)" value={tags} onChangeText={setTags} style={styles.input} />
<TextInput
  placeholder="Buy It Now Price (optional)"
  value={buyItNow}
  onChangeText={setBuyItNow}
  keyboardType="numeric"
  style={styles.input}
/>

<TextInput
  placeholder="Rarity (e.g. common, rare)"
  value={rarity}
  onChangeText={setRarity}
  style={styles.input}
/>

<TextInput
  placeholder="Auction Duration (hours)"
  value={durationHours}
  onChangeText={setDurationHours}
  keyboardType="numeric"
  style={styles.input}
/>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <GoatFlip trigger={goatTrigger || showGoat} bidAmount={lastBidAmount || Number(price)} />
      </View>

      <Button title="List Item" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
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
    marginBottom: 12,
    borderRadius: 8,
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
