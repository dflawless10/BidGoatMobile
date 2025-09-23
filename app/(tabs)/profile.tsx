import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../theme/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';
type MascotMood =
  | 'Celebrate'
  | 'Mischievous'
  | 'Joyful'
  | 'Grumpy'
  | 'Sad'
  | 'Curious'
  | 'Sleepy'
  | 'Chaotic';

type AvatarResponse = {
  avatar_url?: string;
  username?: string;
  email?: string;
  error?: string;
};


export default function ProfileScreen() {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const [mascotMood, setMascotMood] = useState<MascotMood>('Mischievous');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) return;

      try {
        const res = await fetch('http://10.0.0.170:5000/api/user-profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data: AvatarResponse = await res.json();
          setUsername(data.username ?? '');
          setEmail(data.email ?? '');
          setProfileImage(data.avatar_url ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const uploadProfileImage = async (uri: string) => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) return;

    const formData = new FormData();
    formData.append('avatar', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const res = await fetch('http://10.0.0.170:5000/api/upload-avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (res.ok) {
        const data: AvatarResponse = await res.json();
        setProfileImage(data.avatar_url ?? null);
      } else {
        console.warn('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setProfileImage(uri); // show immediately
      await uploadProfileImage(uri); // persist it
    }
  };

  const themedStyles = getThemedStyles(isDarkMode);

  return (
    <ScrollView style={themedStyles.container}>
      <Text style={themedStyles.title}>👤 BidGoat Profile</Text>

      <TouchableOpacity onPress={pickImage} style={themedStyles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={themedStyles.profileImage} />
        ) : (
          <Text style={themedStyles.imagePlaceholder}>
            📸 Tap to upload profile picture
          </Text>
        )}
      </TouchableOpacity>

      <Text style={themedStyles.section}>✨ Account Info</Text>
      <ProfileItem label="Username" value={username} />
      <ProfileItem label="Email" value={email} />

      <Text style={themedStyles.section}>🎨 Preferences</Text>
      <View style={themedStyles.preferenceRow}>
        <Text style={themedStyles.item}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          thumbColor={isDarkMode ? '#fff' : '#000'}
        />
      </View>
      <ProfileItem label="Notifications" value="Enabled" />

      <Text style={themedStyles.section}>🐐 Mascot Mood</Text>
      <Picker
        selectedValue={mascotMood}
        style={themedStyles.picker}
        onValueChange={(value: MascotMood) => setMascotMood(value)}
      >
        <Picker.Item label="Mischievous" value="Mischievous" />
        <Picker.Item label="Joyful" value="Joyful" />
        <Picker.Item label="Sleepy" value="Sleepy" />
        <Picker.Item label="Curious" value="Curious" />
        <Picker.Item label="Celebrate" value="Celebrate" />
        <Picker.Item label="Grumpy" value="Grumpy" />
        <Picker.Item label="Sad" value="Sad" />
        <Picker.Item label="Chaotic" value="Chaotic" />
      </Picker>
      <Text style={themedStyles.item}>Current Mood: {mascotMood}</Text>
    </ScrollView>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ fontSize: 16, marginBottom: 4 }}>
      • {label}: {value}
    </Text>
  );
}

function getThemedStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#000' : '#fff',
      padding: 20,
    },
    title: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 12,
    },
    section: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 8,
      color: isDarkMode ? '#fff' : '#000',
    },
    item: {
      fontSize: 16,
      marginBottom: 4,
      color: isDarkMode ? '#fff' : '#000',
    },
    preferenceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 8,
    },
    picker: {
      height: 50,
      width: '100%',
      marginBottom: 8,
      color: isDarkMode ? '#fff' : '#000',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    imagePlaceholder: {
      fontSize: 16,
      color: isDarkMode ? '#aaa' : '#555',
      padding: 20,
      textAlign: 'center',
    },
  });
}
