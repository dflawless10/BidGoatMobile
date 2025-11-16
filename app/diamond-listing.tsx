import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/AuthContext';
import Svg, { Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const SpinningDiamond = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AnimatedSvg
      width={24}
      height={24}
      viewBox="0 0 40 40"
      style={{ transform: [{ rotate }], marginRight: 8 }}
    >
      <Defs>
        <LinearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00f0ff" />
          <Stop offset="100%" stopColor="#0044ff" />
        </LinearGradient>
      </Defs>
      <Polygon points="20,0 40,20 20,40 0,20" fill="url(#diamondGradient)" />
      <Polygon points="20,0 30,20 20,20" fill="#00d0dd" />
      <Polygon points="20,0 10,20 20,20" fill="#00aacc" />
      <Polygon points="10,20 20,40 20,20" fill="#0088bb" />
      <Polygon points="30,20 20,40 20,20" fill="#006699" />
    </AnimatedSvg>
  );
};

export default function DiamondListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const [title, setTitle] = useState(`${params.carat}ct ${params.shape} Diamond`);
  const [description, setDescription] = useState(
    `Beautiful ${params.shape} cut diamond\n\n` +
    `Carat: ${params.carat}ct\n` +
    `Color: ${params.color}\n` +
    `Clarity: ${params.clarity}\n` +
    `Certified: ${params.certified}`
  );
  const [startingBid, setStartingBid] = useState(params.price?.toString() || '');
  const [duration, setDuration] = useState('7');

  const handleCreateListing = async () => {
    if (!title || !startingBid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!params.imageUrl) {
      Alert.alert('Error', 'Please upload a photo of your diamond first using the "Upload Photo" button above.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', title);
      formData.append('description', description);
      formData.append('price', startingBid);
      formData.append('duration_hours', duration);
      formData.append('category_id', '1');
      formData.append('tags', `diamond,${params.shape},${params.carat}ct,${params.color},${params.clarity}`);
      formData.append('rarity', 'rare');

      // Handle the image file
      const imageUri = params.imageUrl as string;
      const filename = imageUri.split('/').pop() || 'diamond.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch('http://10.0.0.170:5000/create_item', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', '💎 Diamond listed successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/MyAuctionScreen') },
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('🐐 Listing error:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Your Diamond</Text>
        <View style={{ width: 24 }} />
      </View>

      {params.imageUrl && (
        <Image
          source={{ uri: params.imageUrl as string }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., 1.25ct Round Diamond"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your diamond..."
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Starting Bid ($) *</Text>
        <TextInput
          style={styles.input}
          value={startingBid}
          onChangeText={setStartingBid}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Auction Duration (days) *</Text>
        <View style={styles.durationRow}>
          {['7', '14', '30'].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.durationButton,
                duration === days && styles.durationButtonActive,
              ]}
              onPress={() => setDuration(days)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === days && styles.durationTextActive,
                ]}
              >
                {days} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#FF6B35" />
          <Text style={styles.infoText}>
            Estimated value: ${params.price}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="cash" size={20} color="#38a169" />
          <Text style={styles.infoText}>
            You'll receive 89% after BidGoat fees (8% commission + 3% processing)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreateListing}
        >
          <SpinningDiamond />
          <Text style={styles.submitButtonText}>List Diamond</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A202C',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  durationTextActive: {
    color: '#FF6B35',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4A5568',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
