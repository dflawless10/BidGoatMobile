import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ToastAndroid,
  FlatList,
  Image,
  useColorScheme,
} from 'react-native';
import { useAuth } from '@/hooks/AuthContext';
import { JewelryItem } from '@/types/jewelry';

const goatColors = {
  light: {
    background: '#fff',
    card: '#f5f5f5',
    text: '#242c40',
    subtext: '#555',
    empty: '#666',
  },
  dark: {
    background: '#1c1c1e',
    card: '#2c2c2e',
    text: '#fdfdfd',
    subtext: '#aaa',
    empty: '#888',
  },
};

export default function JewelryBoxScreen() {
  const { isAuthenticated, username, token } = useAuth();
  const [jewelryItems, setJewelryItems] = useState<JewelryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme() ?? 'light';
  const theme = goatColors[scheme];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated && token) {
          const response = await fetch('http://10.0.0.170:5000/api/jewelry-box', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Full API response:', data);

            const items = data.items || data.jewelry || [];
            setJewelryItems(items);

            if (items.length > 0) {
              console.log('🐐 First item:', items[0]);
            } else {
              console.log('🪞 Jewelry box is empty for user:', username);
            }

            if (Platform.OS === 'android' && username) {
              ToastAndroid.show(`🎉 Welcome back, ${username}!`, ToastAndroid.SHORT);
            }
          } else {
            const errorText = await response.text();
            console.warn('API call failed:', response.status, errorText);
          }
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [isAuthenticated, token, username]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.details, { color: theme.subtext }]}>Loading your jewelry box... 💎</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.greeting, { color: theme.text }]}>
        Welcome back, {username || 'friend'} 💍
      </Text>
      <FlatList
        data={jewelryItems}
        keyExtractor={(item, index) => item?.id?.toString() ?? `fallback-${index}`}
        renderItem={({ item }) => (
          <View style={[styles.jewelryItem, { backgroundColor: theme.card }]}>
            <Image source={{ uri: item.photo_url }} style={styles.image} resizeMode="cover" />
            <Text style={[styles.jewelryName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.jewelryDescription, { color: theme.subtext }]}>{item.description}</Text>
            <Text style={[styles.details, { color: theme.subtext }]}>
              Category: {item.category || 'Uncategorized'}
            </Text>
            <Text style={[styles.details, { color: theme.subtext }]}>Price: ${item.price}</Text>
            <Text style={[styles.details, { color: theme.subtext }]}>Tags: {item.tags}</Text>
            <Text style={[styles.details, { color: theme.subtext }]}>Listed: {item.listedAt}</Text>
            <Text style={[styles.details, { color: theme.subtext }]}>Ends: {item.auction_ends_at}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyState, { color: theme.empty }]}>
            Your jewelry box is empty. Start listing auctions to sparkle! ✨
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  jewelryItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  jewelryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  jewelryDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  details: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 24,
  },
});
