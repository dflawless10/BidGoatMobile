import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MenuScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const email = await AsyncStorage.getItem('userEmail');
    const sellerStatus = await AsyncStorage.getItem('isSeller');
    setUserEmail(email || '');
    setIsSeller(sellerStatus === 'true');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'userEmail', 'isSeller', 'userId']);
    router.replace('/login');
  };

  const MenuItem = ({
    icon,
    label,
    route,
    color = '#444',
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
    color?: string;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push(route as any)}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#444" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <Ionicons name="person-circle" size={60} color="#FF6B35" />
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Main Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop</Text>
          <MenuItem icon="search" label="Discover Items" route="/discover" />
          <MenuItem icon="heart" label="Watchlist" route="/watchlist" />
          <MenuItem icon="gift" label="Gift Finder" route="/GiftFinder" />
          <MenuItem icon="cart" label="Shopping Cart" route="/cart" />
        </View>

        {/* Buying */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buying</Text>
          <MenuItem icon="receipt" label="My Orders" route="/orders" />
          <MenuItem icon="time" label="Active Bids" route="/bids" />
        </View>

        {/* Selling */}
        {isSeller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selling</Text>
            <MenuItem icon="analytics" label="Seller Dashboard" route="/seller/dashboard" />
            <MenuItem icon="cube" label="My Orders" route="/seller/orders" color="#FF6B35" />
            <MenuItem icon="cash" label="Revenue" route="/seller/revenue" color="#FF6B35" />
            <MenuItem icon="add-circle" label="List New Item" route="/list-item" />
          </View>
        )}

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem icon="person" label="Profile" route="/profile" />
          <MenuItem icon="settings" label="Settings" route="/settings" />
          {!isSeller && (
            <MenuItem icon="storefront" label="Become a Seller" route="/seller/register" />
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BidGoat v1.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for collectors</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '600',
    marginTop: 12,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginVertical: 2,
  },
});
