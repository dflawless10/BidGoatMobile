import React, { useEffect, useState } from 'react';
import { View, Text, TextStyle, ViewStyle, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, logoutUser } from '@/api/auth';
import { FC } from 'react';
import {User} from "@/types";
import { TouchableOpacity } from 'react-native';
import {Link, router} from 'expo-router';


import { Image } from 'expo-image'; // ❓ Possible trigger



// ... (keep your existing interface and initial styles)

const UserProfileScreen: FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        const data = await getUserProfile(token);
        if (data) {
          setUser(data);
        }
      }
    };

    void loadProfile();
  }, []);

  const handleLogout = async () => {
  try {
    await logoutUser();
  } catch (error) {
    // user-facing feedback + propagate to caller/logging infra
    Alert.alert('Error', 'Failed to logout. Please try again.');
    throw error;
  }
};

const AvatarUploader: React.FC<{ uri: string }> = ({ uri }) => {
  return <Image source={{ uri }} style={styles.avatar} />;
};

return (
      <View style={styles.container}>
        {user?.avatar_url && <AvatarUploader uri={user.avatar_url} />}
        <Text style={styles.title}>
        {user ? `BidGoat Welcomes ${user.username}! 🐐` : 'Loading profile...'}
      </Text>

      {user && (
        <>
          <Text style={styles.item}>Username: {user.username}</Text>
          <Text style={styles.item}>Email: {user.email}</Text>
          <Text style={styles.item}>Name: {user.firstname} {user.lastname}</Text>

          <Link href="/(tabs)/editProfile">
          <Text style={styles.link}>Edit Profile Info</Text>
        </Link>

          <View style={styles.settingsRow}>
      <Text style={styles.label}>Recent Logins</Text>
      <TouchableOpacity onPress={() => router.push('/login-history')}>
        <Text style={styles.link}>View</Text>
      </TouchableOpacity>
          </View>
          <Link href="/seller/dashboard">
            <Text style={{color: '#3182ce', marginTop: 12}}>Go to My Vault →</Text>
          </Link>



          <View style={styles.logoutButtonContainer}>
            <Button
              title="Logout"
              onPress={handleLogout}
              color="#ff3b30" // iOS red color
            />
          </View>
        </>
      )}
    </View>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24
  } as ViewStyle,
  avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
  alignSelf: 'center',
  marginBottom: 12,
},

  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  } as TextStyle,
  item: {
    fontSize: 16,
    marginBottom: 8
  } as TextStyle,
  logoutButtonContainer: {
    marginTop: 24,
    paddingHorizontal: 20
  } as ViewStyle,
  settingsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginVertical: 12,
  paddingHorizontal: 10
} as ViewStyle,
label: {
  fontSize: 16,
  fontWeight: '500'
} as TextStyle,
link: {
  fontSize: 16,
  color: '#007AFF' // iOS blue link style
} as TextStyle
});

export default UserProfileScreen;